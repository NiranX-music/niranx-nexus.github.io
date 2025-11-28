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
    const { action, text, language, speaker, audioFile } = await req.json();
    const COQUI_API_KEY = Deno.env.get('COQUI_API_KEY');

    if (!COQUI_API_KEY) {
      throw new Error('COQUI_API_KEY not configured');
    }

    if (action === 'text-to-speech') {
      // Text-to-speech synthesis
      const response = await fetch('https://app.coqui.ai/api/v2/samples', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COQUI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: language || 'en',
          speaker: speaker || 'default',
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'voice-clone') {
      // Voice cloning
      if (!audioFile) {
        throw new Error('Audio file required for voice cloning');
      }

      const response = await fetch('https://app.coqui.ai/api/v2/voices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COQUI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: speaker || 'cloned_voice',
          samples: [audioFile],
        }),
      });

      if (!response.ok) {
        throw new Error(`Voice cloning API error: ${response.statusText}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'list-voices') {
      // List available voices
      const response = await fetch('https://app.coqui.ai/api/v2/voices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${COQUI_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Coqui TTS error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
