import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { text, mode, provider = "lovable", model } = await req.json();

    const modePrompts: Record<string, string> = {
      improve: "Improve the clarity, flow, and readability of this text while preserving the original meaning:",
      expand: "Expand this text with more details, examples, and supporting information:",
      summarize: "Summarize the key points of this text concisely:",
      paraphrase: "Rewrite this text in a different way while keeping the same meaning:",
      grammar: "Fix all grammar, spelling, and punctuation errors in this text:",
      creative: "Make this text more engaging, vivid, and creative while maintaining its core message:",
    };

    const systemPrompt = modePrompts[mode] || modePrompts.improve;

    let response: Response | null = null;

    if (provider === "openai-direct") {
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (OPENAI_API_KEY) {
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: model || "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }] }),
        });
        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    } else if (provider === "openrouter") {
      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (OPENROUTER_API_KEY) {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: model || "google/gemini-flash-1.5", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: text }] }),
        });
        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Lovable AI (default or fallback from failed providers above)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const msgs = [{ role: "system", content: systemPrompt }, { role: "user", content: text }];
    
    if (LOVABLE_API_KEY) {
      const validModels = ['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash-lite', 'google/gemini-3-flash-preview', 'google/gemini-3.1-pro-preview', 'openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano', 'openai/gpt-5.2'];
      const lovableModel = validModels.includes(model) ? model : 'google/gemini-3-flash-preview';
      
      try {
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: lovableModel, messages: msgs }),
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required" }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        console.warn("Lovable AI failed:", response.status);
      } catch (e) {
        console.warn("Lovable AI error:", e);
      }
    }

    // Scitely fallback
    const SCITELY_API_KEY = Deno.env.get("SCITELY_API_KEY");
    if (SCITELY_API_KEY) {
      console.log("Falling back to Scitely for writing assistant...");
      const res = await fetch(`${SCITELY_BASE}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SCITELY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-v3.2", messages: msgs, max_tokens: 4000 }),
      });
      if (res.ok) {
        const data = await res.json();
        return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "All AI services unavailable." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in ai-writing-assistant:", error);
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
