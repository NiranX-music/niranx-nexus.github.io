import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Generate a quiz from the provided study notes. Return ONLY valid JSON with this structure:
{"questions":[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}
Generate 5-8 multiple choice questions. "correct" is the 0-based index of the right answer. Keep questions focused on key concepts.`;

async function tryLovableAI(notes: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.log("LOVABLE_API_KEY not configured, skipping Lovable AI");
    return null;
  }

  try {
    console.log("Attempting Lovable AI...");
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: notes.slice(0, 8000) },
        ],
        max_tokens: 2000,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Lovable AI error:", resp.status, errText);
      return null;
    }

    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error("Lovable AI exception:", e);
    return null;
  }
}

async function tryOpenRouter(notes: string): Promise<string | null> {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) return null;
  try {
    console.log("Attempting OpenRouter...");
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://niranx-nexus.lovable.app",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: notes.slice(0, 8000) }],
        max_tokens: 2000,
      }),
    });
    if (!resp.ok) { console.error("OpenRouter error:", resp.status); return null; }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) { console.error("OpenRouter exception:", e); return null; }
}

async function tryScitely(notes: string): Promise<string | null> {
  const SCITELY_API_KEY = Deno.env.get("SCITELY_API_KEY");
  if (!SCITELY_API_KEY) return null;
  try {
    console.log("Attempting Scitely fallback...");
    const resp = await fetch("https://api.scitely.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${SCITELY_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v3.2",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: notes.slice(0, 8000) }],
        max_tokens: 2000,
      }),
    });
    if (!resp.ok) { console.error("Scitely error:", resp.status); return null; }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) { console.error("Scitely exception:", e); return null; }
}

function parseQuizJSON(content: string) {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : content.trim();
  return JSON.parse(raw);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { notes } = await req.json();
    if (!notes || notes.length < 50) {
      return new Response(JSON.stringify({ error: "Notes too short (minimum 50 characters)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Quiz generation request from user:", user.id);

    // Try providers in order: Lovable AI → OpenRouter
    let content = await tryLovableAI(notes);
    let provider = "lovable";

    if (!content) {
      content = await tryOpenRouter(notes);
      provider = "openrouter";
    }

    if (!content) {
      console.error("All AI providers failed");
      return new Response(JSON.stringify({ error: "All AI providers are currently unavailable. Please try again later." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Quiz generated successfully via ${provider}`);
    const parsed = parseQuizJSON(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate quiz. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
