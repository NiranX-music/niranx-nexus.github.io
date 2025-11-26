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
    const { description, title } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating website for:", title);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are an expert web developer. Generate a complete, modern, and responsive landing page based on the user's description. 

CRITICAL: You MUST return ONLY a valid JSON object. NO markdown formatting, NO code blocks, NO explanations.

RESPONSE FORMAT (return EXACTLY this structure):
{
  "html": "<!DOCTYPE html><html>...</html>",
  "css": "/* Additional CSS if needed */",
  "js": "// Additional JavaScript if needed"
}

REQUIREMENTS:
- The HTML must be a complete page with proper <!DOCTYPE html> structure
- Use modern CSS with flexbox/grid, animations, and responsive design
- Include ALL styles in a <style> tag within the HTML head
- Make it visually stunning with gradients, shadows, and smooth transitions
- Ensure mobile responsiveness with media queries
- Use semantic HTML5 elements (header, nav, main, section, footer)
- Add subtle animations and hover effects
- DO NOT wrap the response in markdown code blocks
- DO NOT add any explanations or comments outside the JSON
- Return ONLY the JSON object, nothing else`
          },
          {
            role: "user",
            content: `Generate a landing page for: ${title}\n\nDescription: ${description}\n\nMake it modern, beautiful, and responsive.`
          }
        ],
        max_tokens: 4000,
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

    // Try to extract JSON from the response
    let generatedCode;
    try {
      // Remove markdown code blocks more aggressively
      let cleanContent = content.trim();
      
      // Remove markdown code blocks (handles various formats)
      cleanContent = cleanContent.replace(/^```(?:json)?\s*/gi, '');
      cleanContent = cleanContent.replace(/\s*```$/g, '');
      cleanContent = cleanContent.trim();
      
      // Try to find JSON object if it's embedded in text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      generatedCode = JSON.parse(cleanContent);
      
      // Validate that we have the required fields
      if (!generatedCode.html) {
        throw new Error("Generated response missing 'html' field");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response. Content preview:", content.substring(0, 500));
      console.error("Parse error:", parseError);
      throw new Error("AI returned invalid format. Please try again.");
    }

    return new Response(
      JSON.stringify({ 
        html: generatedCode.html || "",
        css: generatedCode.css || "",
        js: generatedCode.js || ""
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Website generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
