import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const apiKey = Deno.env.get('BLACKBOX_API_KEY');
    if (!apiKey) {
      console.error('BLACKBOX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'BlackBox API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`BlackBox chat request from user ${user.id}, model: ${model || 'default'}`);

    // Call BlackBox API using OpenRouter as fallback
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY') || apiKey}`,
        'HTTP-Referer': 'https://niranx.com',
        'X-Title': 'NiranX Xvibing',
      },
      body: JSON.stringify({
        model: model === 'blackboxai' ? 'meta-llama/llama-3.1-8b-instruct:free' : 
               model === 'blackboxai-pro' ? 'meta-llama/llama-3.1-70b-instruct' :
               model === 'gpt-4o' ? 'openai/gpt-4o' :
               model === 'claude-3-sonnet' ? 'anthropic/claude-3-sonnet' :
               model === 'gemini-pro' ? 'google/gemini-pro' : 'meta-llama/llama-3.1-8b-instruct:free',
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BlackBox API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `BlackBox API error: ${response.status}`, details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    console.log('BlackBox API response received successfully');

    return new Response(
      JSON.stringify({
        content: data.choices?.[0]?.message?.content || data.message || data.content || 'No response received',
        model: model || 'blackboxai',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('BlackBox chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
