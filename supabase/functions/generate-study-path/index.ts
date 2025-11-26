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
    const { goal, subjects, targetDate, currentLevel, exams } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating study path for:", { goal, subjects, targetDate });

    const systemPrompt = `You are an expert educational advisor and learning path designer.
Generate a comprehensive, personalized study roadmap based on the user's goals, subjects, and timeline.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Create realistic, achievable milestones
3. Break down subjects into specific topics
4. Include estimated time commitments
5. Suggest resources and study techniques
6. Response format: {"roadmap": [...], "totalWeeks": number, "difficulty": string, "tips": [...]}

Each milestone should have:
- week: number
- title: string
- topics: string[]
- estimatedHours: number
- skills: string[]
- resources: string[]
- assessmentType: string

Remember: Return ONLY the JSON object.`;

    const userPrompt = `Create a study path for:
Goal: ${goal}
Subjects: ${subjects.join(", ")}
Target Date: ${targetDate}
Current Level: ${currentLevel}
${exams && exams.length > 0 ? `Upcoming Exams: ${exams.join(", ")}` : ""}

Generate a week-by-week roadmap with clear milestones, topics to cover, and practical study tips.`;

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

    // Parse the JSON response
    let studyPath;
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
      
      studyPath = JSON.parse(cleanContent);
      
      if (!studyPath.roadmap) {
        throw new Error("Response missing 'roadmap' field");
      }
      
      console.log("Successfully generated study path. Milestones:", studyPath.roadmap.length);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content preview:", content.substring(0, 500));
      throw new Error("Failed to parse AI response. Please try again.");
    }

    return new Response(
      JSON.stringify({ 
        message: "Study path generated successfully!",
        studyPath
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Study path generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
