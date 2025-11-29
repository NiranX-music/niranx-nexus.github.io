import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to poll for task completion
async function pollTaskResult(taskId: string, apiKey: string, maxRetries = 60) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://api.fluxapi.ai/api/v1/task/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Task polling failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        // Check task status
        if (data.data.status === 'success' && data.data.output?.image_url) {
          return data.data.output.image_url;
        } else if (data.data.status === 'failed') {
          throw new Error('Image generation failed');
        }
        // If status is 'processing' or 'pending', continue polling
      }

      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Poll attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
    }
  }

  throw new Error('Task timeout - exceeded maximum polling attempts');
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

    const FLUXAPI_API_KEY = Deno.env.get('FLUXAPI_API_KEY');
    if (!FLUXAPI_API_KEY) {
      console.error('FLUXAPI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Generating image with FluxAPI - model: flux-kontext-${model}`);

    // Determine aspect ratio based on dimensions
    let aspectRatio = "1:1";
    if (width === height) {
      aspectRatio = "1:1";
    } else if (width > height) {
      aspectRatio = width / height > 1.5 ? "16:9" : "4:3";
    } else {
      aspectRatio = height / width > 1.5 ? "9:16" : "3:4";
    }

    // Start the image generation task
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

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error("FluxAPI generation error:", generateResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to start image generation",
          details: errorText 
        }),
        { status: generateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generateData = await generateResponse.json();
    
    if (generateData.code !== 200 || !generateData.data?.taskId) {
      console.error("Invalid generation response:", generateData);
      return new Response(
        JSON.stringify({ 
          error: "Invalid response from image generation service",
          details: generateData 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const taskId = generateData.data.taskId;
    console.log(`Task started with ID: ${taskId}, polling for result...`);

    // Poll for the result
    const imageUrl = await pollTaskResult(taskId, FLUXAPI_API_KEY);

    console.log(`Image generated successfully: ${imageUrl}`);

    return new Response(
      JSON.stringify({ url: imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in fluxapi-image function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
