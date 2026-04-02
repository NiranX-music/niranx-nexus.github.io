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
    const { text, documentType } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: "Text content is required" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are an expert document analyzer. Extract schedule information from documents.
Given document text, extract ALL tasks, events, classes, deadlines, and time-based items.

You MUST respond with a valid JSON object using this EXACT structure (no markdown, no code fences):
{
  "tasks": [
    {
      "title": "Task or event name",
      "subject": "Subject/category",
      "description": "Brief description",
      "day_column": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",
      "start_time": "HH:MM (24h format)",
      "end_time": "HH:MM (24h format)",
      "duration_minutes": 60,
      "priority": "high|medium|low",
      "tags": ["tag1", "tag2"],
      "deadline": "YYYY-MM-DD or null",
      "notes": "Any additional notes"
    }
  ],
  "summary": "Brief summary of what was extracted"
}

Rules:
- Extract ALL time-based items from the document
- Infer days and times from context if not explicit
- Set priority based on urgency indicators (exam = high, homework = medium, review = low)
- Use sensible defaults for missing fields
- If no specific day, distribute across weekdays`;

    const userContent = `Document type: ${documentType || 'unknown'}\n\nDocument content:\n${text.substring(0, 8000)}`;

    const toolDef = {
      type: "function" as const,
      function: {
        name: "extract_schedule_tasks",
        description: "Extract schedule tasks from document text",
        parameters: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" }, subject: { type: "string" },
                  description: { type: "string" },
                  day_column: { type: "string", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
                  start_time: { type: "string" }, end_time: { type: "string" },
                  duration_minutes: { type: "number" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  tags: { type: "array", items: { type: "string" } },
                  deadline: { type: "string" }, notes: { type: "string" }
                },
                required: ["title", "day_column", "start_time", "duration_minutes", "priority"],
                additionalProperties: false
              }
            },
            summary: { type: "string" }
          },
          required: ["tasks", "summary"],
          additionalProperties: false
        }
      }
    };

    // Try Lovable AI first
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
            tools: [toolDef],
            tool_choice: { type: "function", function: { name: "extract_schedule_tasks" } },
          }),
        });

        if (response.ok) {
          return parseExtractResponse(await response.json());
        }
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        console.warn("Lovable AI failed:", response.status);
      } catch (e) {
        console.warn("Lovable AI error:", e);
      }
    }

    // Scitely fallback (plain text, no tool calling)
    const SCITELY_API_KEY = Deno.env.get("SCITELY_API_KEY");
    if (SCITELY_API_KEY) {
      console.log("Falling back to Scitely for timegrid scanner...");
      const res = await fetch(`${SCITELY_BASE}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SCITELY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-v3.2",
          messages: [
            { role: 'system', content: systemPrompt + "\n\nIMPORTANT: Return ONLY the raw JSON object, no markdown code fences." },
            { role: 'user', content: userContent }
          ],
          max_tokens: 4000,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        try {
          const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch {
          return new Response(JSON.stringify({ tasks: [], summary: content }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    return new Response(JSON.stringify({ error: "All AI services unavailable." }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('TimeGrid AI Scanner error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function parseExtractResponse(data: any) {
  const corsH = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall) {
    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), { headers: { ...corsH, 'Content-Type': 'application/json' } });
  }
  const content = data.choices?.[0]?.message?.content || '';
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content);
    return new Response(JSON.stringify(parsed), { headers: { ...corsH, 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ tasks: [], summary: content }), {
      headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  }
}
