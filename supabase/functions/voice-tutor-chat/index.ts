import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SCITELY_BASE = "https://api.scitely.com/v1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, subject, provider = 'lovable', model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const systemPrompt = `You are an expert AI tutor specializing in ${subject || 'general education'}. 
Your role is to:
- Explain concepts clearly and thoroughly
- Use examples and analogies to make complex topics understandable
- Ask follow-up questions to ensure understanding
- Encourage critical thinking
- Be patient, supportive, and encouraging

Keep your responses conversational and engaging, as they will be read aloud. Avoid using markdown formatting, bullet points, or special characters. Speak naturally as if having a real conversation.`;

    const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    // Try primary provider
    let response: Response | null = null;

    if (provider === 'openai-direct') {
      const key = Deno.env.get('OPENAI_API_KEY');
      if (key) {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model || 'gpt-4o-mini', messages: fullMessages }),
        });
        if (response.ok) return extractContent(response);
      }
    } else if (provider !== 'lovable') {
      const key = Deno.env.get('OPENROUTER_API_KEY');
      if (key) {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model || 'openai/gpt-4o-mini', messages: fullMessages }),
        });
        if (response.ok) return extractContent(response);
      }
    }

    // Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY) {
      try {
        response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model || 'google/gemini-2.5-flash', messages: fullMessages }),
        });
        if (response.ok) return extractContent(response);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        console.warn("Lovable AI failed:", response.status);
      } catch (e) {
        console.warn("Lovable AI error:", e);
      }
    }

    // Scitely fallback
    const SCITELY_API_KEY = Deno.env.get("SCITELY_API_KEY");
    if (SCITELY_API_KEY) {
      console.log("Falling back to Scitely for voice tutor...");
      const res = await fetch(`${SCITELY_BASE}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SCITELY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-v3.2", messages: fullMessages, max_tokens: 2000 }),
      });
      if (res.ok) return extractContent(res);
    }

    return new Response(JSON.stringify({ error: "All AI services unavailable." }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Voice tutor error:', error);
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function extractContent(response: Response) {
  const corsH = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  return new Response(JSON.stringify({ content }), {
    headers: { ...corsH, 'Content-Type': 'application/json' },
  });
}
