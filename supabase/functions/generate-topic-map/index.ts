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
    const { chapterText, imageUrl, visualizationMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generating topic map with mode:", visualizationMode);

    const modeInstructions = {
      "concept-map": "Create a spider-web style concept map with nodes and connections showing relationships between ideas.",
      "flowchart": "Create a linear flowchart showing step-by-step progression and decision points.",
      "tree-diagram": "Create a hierarchical tree diagram with parent-child relationships branching from the main topic."
    };

    const systemPrompt = `You are an expert educational content analyzer specializing in concept mapping and knowledge visualization.
Generate a comprehensive topic map structure from the provided text or image.

VISUALIZATION MODE: ${visualizationMode}
${modeInstructions[visualizationMode as keyof typeof modeInstructions]}

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Identify the main topic and all related concepts
3. Create hierarchical relationships between concepts based on the visualization mode
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

    const userPrompt = `Analyze this ${imageUrl ? 'image' : 'text'} and create a comprehensive topic map in ${visualizationMode} format:

${chapterText || 'Please analyze the image content'}

Generate the complete topic map with:
- Main concepts and subtopics ${visualizationMode === 'tree-diagram' ? 'organized hierarchically' : visualizationMode === 'flowchart' ? 'in sequential order' : 'with interconnections'}
- All important definitions
- Formulas and their explanations
- Prerequisites needed to understand this
- Logical flow showing how concepts connect`;

    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    if (imageUrl) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 8000,
        messages
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

    // Save to history
    await supabaseClient.from("topic_map_history").insert({
      user_id: user.id,
      title: topicMap.title,
      input_text: chapterText || null,
      image_url: imageUrl || null,
      visualization_mode: visualizationMode,
      topic_map_data: topicMap
    });

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
