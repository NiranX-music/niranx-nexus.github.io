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
    const { text, mode, provider = "lovable", model } = await req.json();

    console.log(`Processing text with mode: ${mode}, provider: ${provider}`);

    const modePrompts: Record<string, string> = {
      improve: "Improve the clarity, flow, and readability of this text while preserving the original meaning:",
      expand: "Expand this text with more details, examples, and supporting information:",
      summarize: "Summarize the key points of this text concisely:",
      paraphrase: "Rewrite this text in a different way while keeping the same meaning:",
      grammar: "Fix all grammar, spelling, and punctuation errors in this text:",
      creative: "Make this text more engaging, vivid, and creative while maintaining its core message:",
    };

    const systemPrompt = modePrompts[mode] || modePrompts.improve;

    let response;
    let result: string;

    if (provider === "openai-direct") {
      const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
      if (!OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
        }),
      });
    } else if (provider === "openrouter") {
      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not configured");
      }

      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "google/gemini-flash-1.5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
        }),
      });
    } else {
      // Lovable AI
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("Lovable API key not configured");
      }

      const validLovableModels = [
        'google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash-lite',
        'google/gemini-3-flash-preview', 'google/gemini-3.1-pro-preview',
        'openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano', 'openai/gpt-5.2',
      ];
      const lovableModel = validLovableModels.includes(model) ? model : 'google/gemini-3-flash-preview';
      console.log('Using Lovable AI model:', lovableModel);

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: lovableModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    result = data.choices[0].message.content;

    console.log("Text processed successfully");

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-writing-assistant:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
