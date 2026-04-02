import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_MODELS = [
  'google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash-lite',
  'google/gemini-3-flash-preview', 'google/gemini-3.1-pro-preview',
  'openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano', 'openai/gpt-5.2',
];

const SCITELY_BASE = "https://api.scitely.com/v1";

async function callScitelyFallback(messages: any[], stream: boolean, SCITELY_API_KEY: string) {
  console.log("Falling back to Scitely AI...");
  const res = await fetch(`${SCITELY_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SCITELY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-v3.2",
      messages,
      stream,
      max_tokens: 2000,
    }),
  });
  return res;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, model: requestedModel, stream: requestStream } = body;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const model = VALID_MODELS.includes(requestedModel) ? requestedModel : 'google/gemini-2.5-flash';
    const shouldStream = requestStream !== false;

    const systemMsg = { 
      role: "system", 
      content: `You are the AI Study Assistant for NiranX Universe, a comprehensive educational platform. You are helpful, encouraging, and knowledgeable. Keep responses clear and well-structured. When solving problems, show step-by-step work. When asked to return JSON, return valid JSON only.`
    };
    const fullMessages = [systemMsg, ...messages];

    console.log(`AI Chat: user=${user.id}, model=${model}, stream=${shouldStream}`);

    // Try Lovable AI first
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model, messages: fullMessages, max_tokens: 2000, stream: shouldStream }),
        });

        if (response.ok) {
          if (shouldStream) {
            return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
          }
          const data = await response.json();
          return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        console.warn("Lovable AI failed:", response.status);
      } catch (e) {
        console.warn("Lovable AI error:", e);
      }
    }

    // Fallback to Scitely
    const SCITELY_API_KEY = Deno.env.get("SCITELY_API_KEY");
    if (SCITELY_API_KEY) {
      const scitelyRes = await callScitelyFallback(fullMessages, shouldStream, SCITELY_API_KEY);
      if (scitelyRes.ok) {
        if (shouldStream) {
          return new Response(scitelyRes.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }
        const data = await scitelyRes.json();
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("Scitely fallback also failed:", scitelyRes.status);
    }

    return new Response(JSON.stringify({ error: "All AI services unavailable. Please try again later." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
