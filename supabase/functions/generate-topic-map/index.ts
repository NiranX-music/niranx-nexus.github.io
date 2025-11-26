import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapterText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating topic map for chapter text");

    const systemPrompt = `You are an expert educational content analyzer specializing in concept mapping and knowledge visualization.
Generate a comprehensive topic map structure from the provided text.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Identify the main topic and all related concepts
3. Create hierarchical relationships between concepts
4. Extract all definitions, formulas, and prerequisites
5. Build a flowchart showing logical progression
6. Response format:
{
  "title": "Main Topic Title",
  "concepts": [
    {
      "id": "unique_id",
      "label": "Concept Name",
      "type": "main" | "subtopic" | "definition" | "formula" | "prerequisite",
      "description": "Brief explanation",
      "connections": ["id1", "id2"]
    }
  ],
  "definitions": {
    "term": "definition"
  },
  "formulas": [
    {
      "name": "Formula Name",
      "formula": "mathematical expression",
      "explanation": "what it means"
    }
  ],
  "prerequisites": ["prerequisite topic 1", "prerequisite topic 2"],
  "flowchart": [
    {
      "from": "concept1",
      "to": "concept2",
      "label": "relationship description"
    }
  ]
}

Remember: Return ONLY the JSON object.`;

    const userPrompt = `Analyze this chapter and create a comprehensive topic map:

${chapterText}

Generate the complete topic map with:
- Main concepts and subtopics
- All important definitions
- Formulas and their explanations
- Prerequisites needed to understand this
- Logical flow showing how concepts connect`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 8000,
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

    let topicMap;
    try {
      let cleanContent = content.trim();
      
      cleanContent = cleanContent.replace(/^```(?:json)?\s*/gi, '');
      cleanContent = cleanContent.replace(/\s*```$/g, '');
      cleanContent = cleanContent.trim();
      
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      topicMap = JSON.parse(cleanContent);
      
      if (!topicMap.title || !topicMap.concepts) {
        throw new Error("Response missing required fields");
      }
      
      console.log("Successfully generated topic map. Concepts:", topicMap.concepts.length);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content preview:", content.substring(0, 500));
      throw new Error("Failed to parse AI response. Please try again.");
    }

    return new Response(
      JSON.stringify({ 
        message: "Topic map generated successfully!",
        topicMap
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Topic map generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
