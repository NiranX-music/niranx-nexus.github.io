import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map Xvibing model names to Groq models
function mapToGroqModel(model: string): string {
  const map: Record<string, string> = {
    'blackboxai': 'llama-3.3-70b-versatile',
    'blackboxai-pro': 'llama-3.3-70b-versatile',
    'gpt-4o': 'llama-3.3-70b-versatile',
    'claude-3-sonnet': 'mixtral-8x7b-32768',
    'gemini-pro': 'llama-3.3-70b-versatile',
  };
  return map[model] || 'llama-3.3-70b-versatile';
}

// Map Xvibing model names to Lovable AI models
function mapToLovableModel(model: string): string {
  const map: Record<string, string> = {
    'blackboxai': 'google/gemini-3-flash-preview',
    'blackboxai-pro': 'google/gemini-2.5-pro',
    'gpt-4o': 'openai/gpt-5-mini',
    'claude-3-sonnet': 'google/gemini-2.5-flash',
    'gemini-pro': 'google/gemini-2.5-pro',
  };
  return map[model] || 'google/gemini-3-flash-preview';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    console.log(`Xvibing chat request from user ${user.id}, model: ${model || 'default'}`);

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Try OpenRouter first, fall back to Lovable AI
    let responseContent = '';
    let usedFallback = false;

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (OPENROUTER_API_KEY) {
      try {
        // Use models that are actually available on OpenRouter
        const orModel = model === 'blackboxai' ? 'meta-llama/llama-3.1-8b-instruct' :
                        model === 'blackboxai-pro' ? 'meta-llama/llama-3.1-70b-instruct' :
                        model === 'gpt-4o' ? 'openai/gpt-4o' :
                        model === 'claude-3-sonnet' ? 'anthropic/claude-3-sonnet' :
                        model === 'gemini-pro' ? 'google/gemini-pro' : 'meta-llama/llama-3.1-8b-instruct';

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://niranx.com',
            'X-Title': 'NiranX Xvibing',
          },
          body: JSON.stringify({
            model: orModel,
            messages: formattedMessages,
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn('OpenRouter failed:', response.status, errorText);
          throw new Error(`OpenRouter error: ${response.status}`);
        }

        const data = await response.json();
        responseContent = data.choices?.[0]?.message?.content || 'No response received';
      } catch (orError) {
        console.warn('OpenRouter failed, falling back to Lovable AI:', orError);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // Fallback to Lovable AI
    if (usedFallback) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'AI service not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const lovableModel = mapToLovableModel(model);
      console.log('Using Lovable AI with model:', lovableModel);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: lovableModel,
          messages: [
            { role: 'system', content: 'You are Xvibing, an expert AI coding assistant. Help users write, debug, and understand code. Provide clear, well-structured responses with code examples when appropriate.' },
            ...formattedMessages,
          ],
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI error:', response.status, errorText);

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
          );
        }

        return new Response(
          JSON.stringify({ error: 'AI service error' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const data = await response.json();
      responseContent = data.choices?.[0]?.message?.content || 'No response received';
    }

    console.log('Xvibing response generated successfully');

    return new Response(
      JSON.stringify({
        content: responseContent,
        model: model || 'blackboxai',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Xvibing chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
