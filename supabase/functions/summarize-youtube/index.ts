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
    const { videoId, title, subject, transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Summarizing YouTube video:", videoId);

    const systemPrompt = `You are an expert educational content analyzer specializing in video content summarization.
Generate a comprehensive summary with key topics and important timestamps from educational videos.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Create concise but informative summaries
3. Extract key topics covered in the video
4. If transcript is provided, identify important timestamps and concepts
5. Response format: {"summary": string, "keyTopics": string[], "suggestedTimestamps": [...]}

Each timestamp should have:
- time: string (format "HH:MM:SS" or "MM:SS")
- title: string
- description: string

Remember: Return ONLY the JSON object.`;

    const userPrompt = transcript 
      ? `Analyze this educational video and its transcript:
Title: ${title}
${subject ? `Subject: ${subject}` : ""}
Video ID: ${videoId}

Transcript:
${transcript.substring(0, 8000)}

Generate a summary, extract key topics, and suggest important timestamps for note-taking.`
      : `Analyze this educational video:
Title: ${title}
${subject ? `Subject: ${subject}` : ""}
Video ID: ${videoId}

Generate a summary and extract key topics based on the title and subject. Suggest general chapter timestamps typically found in educational videos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 4000,
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
    let videoSummary;
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
      
      videoSummary = JSON.parse(cleanContent);
      
      if (!videoSummary.summary || !videoSummary.keyTopics) {
        throw new Error("Response missing required fields");
      }
      
      console.log("Successfully summarized video. Key topics:", videoSummary.keyTopics.length);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content preview:", content.substring(0, 500));
      throw new Error("Failed to parse AI response. Please try again.");
    }

    return new Response(
      JSON.stringify({ 
        message: "Video summarized successfully!",
        summary: videoSummary
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Video summarization error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
