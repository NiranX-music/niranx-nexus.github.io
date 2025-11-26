import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { content, n_slides, language, template } = await req.json();
    const PRESENTON_API_KEY = Deno.env.get("PRESENTON_API_KEY");

    if (!PRESENTON_API_KEY) {
      throw new Error("PRESENTON_API_KEY is not configured");
    }

    console.log('Generating presentation with Presenton:', { content, n_slides, language, template });

    // Call Presenton API to generate presentation
    const response = await fetch('https://api.presenton.ai/api/v1/ppt/presentation/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRESENTON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        n_slides: n_slides || 10,
        language: language || 'English',
        template: template || 'general',
        export_as: 'pptx',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Presenton API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. Please check your Presenton API credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Presenton API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Presentation generated successfully');

    return new Response(
      JSON.stringify({
        presentation_id: data.presentation_id,
        download_url: data.path,
        edit_url: data.edit_path,
        credits_consumed: data.credits_consumed,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-presentation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
