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
    const { prompt, title } = await req.json();
    const SONAUTO_API_KEY = Deno.env.get("SONAUTO_API_KEY");

    if (!SONAUTO_API_KEY) {
      throw new Error("SONAUTO_API_KEY is not configured");
    }

    console.log('Generating song with Sonauto:', { title, prompt });

    // Call Sonauto API to generate song
    const response = await fetch('https://api.sonauto.ai/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SONAUTO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        instrumental: false,
        num_songs: 1,
        output_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sonauto API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Sonauto API error: ${response.status}`);
    }

    const data = await response.json();
    const taskId = data.task_id;
    console.log('Song generation task created:', taskId);

    // Poll for completion
    let songUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // Wait up to 5 minutes

    while (!songUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.sonauto.ai/v1/generations/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${SONAUTO_API_KEY}`,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('Generation status:', statusData.status);
        
        if (statusData.status === 'SUCCESS' && statusData.song_paths && statusData.song_paths.length > 0) {
          songUrl = statusData.song_paths[0];
          break;
        } else if (statusData.status === 'FAILURE') {
          throw new Error('Song generation failed');
        }
      }
      
      attempts++;
    }

    if (!songUrl) {
      throw new Error('Song generation timed out');
    }

    console.log('Song generated successfully');

    return new Response(
      JSON.stringify({
        audio_url: songUrl,
        title: title,
        task_id: taskId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-song function:', error);
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
