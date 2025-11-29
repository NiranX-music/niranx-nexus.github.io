import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = "flux-dev", width = 1024, height = 1024 } = await req.json();

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

    console.log(`Generating image with FluxAPI - model: ${model}, dimensions: ${width}x${height}`);

    // Make request to FluxAPI
    const response = await fetch("https://api.fluxapi.ai/v1/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FLUXAPI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        width,
        height,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FluxAPI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate image",
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
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
