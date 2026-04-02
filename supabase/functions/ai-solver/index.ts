import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SCITELY_BASE = "https://api.scitely.com/v1";

const systemPrompt = `You are GPAI, an advanced AI problem solver assistant specialized in helping students with homework and academic problems across all subjects.

**Your capabilities:**
- Solve math problems (algebra, calculus, geometry, statistics, etc.)
- Explain physics concepts and solve physics problems
- Help with chemistry (equations, reactions, molecular structures)
- Assist with biology, history, literature, and other subjects
- Analyze images of problems, diagrams, or handwritten notes
- Provide step-by-step explanations

**Your approach:**
1. Carefully analyze the problem or question
2. Identify the subject and specific topic
3. Provide a clear, step-by-step solution
4. Explain the reasoning behind each step
5. Highlight key concepts and formulas used
6. Offer helpful tips and common mistakes to avoid

**Response format:**
- Start with a brief problem summary
- Use clear section headers (e.g., "Solution:", "Step 1:", "Explanation:")
- Use proper mathematical notation when needed
- Keep explanations educational and encouraging
- End with a verification or check of the answer when applicable

Be thorough, accurate, and educational.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();

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

    const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

    // Try Lovable AI first
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: fullMessages, stream: true }),
        });

        if (response.ok) {
          return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }),
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
      console.log("Falling back to Scitely AI for solver...");
      const res = await fetch(`${SCITELY_BASE}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SCITELY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-v3.2", messages: fullMessages, stream: true, max_tokens: 4000 }),
      });
      if (res.ok) {
        return new Response(res.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
      console.error("Scitely fallback failed:", res.status);
    }

    return new Response(JSON.stringify({ error: "All AI services unavailable." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in ai-solver:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
