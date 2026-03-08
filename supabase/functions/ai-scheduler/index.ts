import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, type } = await req.json();
    console.log('AI Scheduler request from user:', user.id, 'type:', type);

    const systemPrompt = `You are an expert AI study schedule planner. You help students create personalized, optimized study schedules.

When asked to GENERATE a schedule, you MUST respond with a valid JSON object in this exact format (no markdown, no code fences, just raw JSON):
{
  "schedule": [
    {
      "time": "6:00 AM - 7:00 AM",
      "subject": "Mathematics",
      "topic": "Calculus - Derivatives",
      "duration": "1 hour",
      "priority": "high",
      "notes": "Focus on chain rule problems"
    }
  ],
  "summary": "A brief summary of the schedule and reasoning",
  "tips": ["Tip 1", "Tip 2"]
}

Priority must be one of: "high", "medium", "low".

When asked to MODIFY/EDIT a schedule, return the full updated schedule in the same JSON format.

When asked a GENERAL QUESTION about studying, respond naturally in plain text (not JSON).

Key principles:
- Schedule difficult subjects during peak cognitive hours (morning)
- Include breaks between sessions (at least 15-30 min)
- Vary subjects to prevent fatigue
- Consider spaced repetition for review sessions
- Balance workload across the day
- Be realistic about time management`;

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 4096,
    };

    // For schedule generation, use tool calling for structured output
    if (type === "generate" || type === "edit") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "create_study_schedule",
            description: "Create or update a study schedule with time slots, subjects, and priorities",
            parameters: {
              type: "object",
              properties: {
                schedule: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string", description: "Time range e.g. '6:00 AM - 7:00 AM'" },
                      subject: { type: "string" },
                      topic: { type: "string" },
                      duration: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      notes: { type: "string" }
                    },
                    required: ["time", "subject", "topic", "duration", "priority"],
                    additionalProperties: false
                  }
                },
                summary: { type: "string", description: "Brief summary of the schedule" },
                tips: { type: "array", items: { type: "string" }, description: "Study tips" }
              },
              required: ["schedule", "summary", "tips"],
              additionalProperties: false
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "create_study_schedule" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Check for tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ type: "schedule", data: args }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular text response
    const content = data.choices?.[0]?.message?.content || "No response received";
    return new Response(JSON.stringify({ type: "chat", content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Scheduler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
