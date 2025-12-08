import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { noteContent, title, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client and verify user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Summarizing notes for user:", user.id, "title:", title);

    const systemPrompt = `You are an expert educational content analyzer specializing in note summarization and concept mapping.
Generate a comprehensive summary with key points and mind map structure from the provided notes.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Create concise but comprehensive summaries
3. Extract the most important key points (5-10 points)
4. Structure information hierarchically for mind mapping
5. Identify main concepts and their relationships
6. Response format: {"summary": string, "keyPoints": string[], "mindMap": {...}, "tags": string[]}

Mind map structure:
{
  "central": "main topic",
  "branches": [
    {
      "title": "subtopic",
      "concepts": ["concept1", "concept2"],
      "connections": ["related branch title"]
    }
  ]
}

Remember: Return ONLY the JSON object.`;

    const userPrompt = `Analyze and summarize these notes:
${subject ? `Subject: ${subject}` : ""}
Title: ${title}

Content:
${noteContent}

Generate a summary, extract key points, create a mind map structure, and suggest relevant tags.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 6000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let noteSummary;
    try {
      let cleanContent = content.trim();
      
      // Remove markdown code blocks
      cleanContent = cleanContent.replace(/^```(?:json)?\s*/gi, '');
      cleanContent = cleanContent.replace(/\s*```$/g, '');
      cleanContent = cleanContent.trim();
      
      // Try to find JSON object
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      noteSummary = JSON.parse(cleanContent);
      
      if (!noteSummary.summary || !noteSummary.keyPoints) {
        throw new Error("Response missing required fields");
      }
      
      console.log("Successfully summarized notes. Key points:", noteSummary.keyPoints.length);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content preview:", content.substring(0, 500));
      throw new Error("Failed to parse AI response. Please try again.");
    }

    return new Response(
      JSON.stringify({ 
        message: "Notes summarized successfully!",
        summary: noteSummary
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Note summarization error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
