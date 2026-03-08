import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function pollTaskResult(taskId: string, apiKey: string, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://api.fluxapi.ai/api/v1/task/${taskId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
      });

      if (!response.ok) throw new Error(`Task polling failed: ${response.status}`);

      const data = await response.json();
      if (data.code === 200 && data.data) {
        if (data.data.status === 'success' && data.data.output?.image_url) {
          return data.data.output.image_url;
        } else if (data.data.status === 'failed') {
          throw new Error('Image generation failed');
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Poll attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
    }
  }
  throw new Error('Task timeout');
}

async function generateWithLovableAI(prompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  console.log('Using Lovable AI fallback for image generation');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text'],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI image error:', response.status, errorText);
    if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
    if (response.status === 402) throw new Error('AI credits exhausted. Please add credits.');
    throw new Error('Lovable AI image generation failed');
  }

  const data = await response.json();
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) throw new Error('No image generated');
  return imageUrl;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = "dev", width = 1024, height = 1024 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try FluxAPI first
    const FLUXAPI_API_KEY = Deno.env.get('FLUXAPI_API_KEY');
    if (FLUXAPI_API_KEY) {
      try {
        console.log(`Generating image with FluxAPI - model: flux-kontext-${model}`);

        let aspectRatio = "1:1";
        if (width === height) aspectRatio = "1:1";
        else if (width > height) aspectRatio = width / height > 1.5 ? "16:9" : "4:3";
        else aspectRatio = height / width > 1.5 ? "9:16" : "3:4";

        const generateResponse = await fetch("https://api.fluxapi.ai/api/v1/flux/kontext/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${FLUXAPI_API_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            model: `flux-kontext-${model}`,
            aspectRatio,
            outputFormat: "png",
            promptUpsampling: false,
          }),
        });

        if (!generateResponse.ok) throw new Error(`FluxAPI error: ${generateResponse.status}`);

        const generateData = await generateResponse.json();
        if (generateData.code !== 200 || !generateData.data?.taskId) throw new Error('Invalid FluxAPI response');

        const taskId = generateData.data.taskId;
        console.log(`Task started: ${taskId}, polling...`);
        const imageUrl = await pollTaskResult(taskId, FLUXAPI_API_KEY);

        return new Response(
          JSON.stringify({ url: imageUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (fluxError) {
        console.warn('FluxAPI failed, falling back to Lovable AI:', fluxError);
      }
    }

    // Fallback to Lovable AI image generation
    const imageUrl = await generateWithLovableAI(prompt);
    return new Response(
      JSON.stringify({ url: imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in fluxapi-image function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
