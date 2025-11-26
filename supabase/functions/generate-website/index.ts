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
        max_tokens: 3500, // Reduced limit to prevent truncation
        messages: [
          { 
            role: "system", 
            content: `You are an expert web developer. Generate a CONCISE, modern landing page.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations
2. Keep code CONCISE - minify CSS, use short class names
3. Inline ALL styles in HTML <style> tag
4. Response format: {"html": "...", "css": "", "js": ""}

CODE EFFICIENCY:
- Use minified/compressed CSS (remove extra spaces, combine selectors)
- Keep HTML semantic but concise
- Single-page design only
- Total response must be under 3000 tokens

DESIGN:
- Modern, clean, professional
- Responsive with mobile-first approach
- Use CSS gradients, flexbox/grid
- Add subtle hover effects
- Semantic HTML5 structure

IMPORTANT: Keep the code SHORT and EFFICIENT. Quality over quantity.`
          },
          {
            role: "user",
            content: `Create a concise landing page:
Title: ${title}
Description: ${description}

Generate efficient, minified code with modern design.`
          }
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
      
      // Check for truncated JSON
      const openBraces = (cleanContent.match(/\{/g) || []).length;
      const closeBraces = (cleanContent.match(/\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        console.error("JSON appears truncated. Open braces:", openBraces, "Close braces:", closeBraces);
        console.error("Content length:", cleanContent.length);
        throw new Error("Response too large and got truncated. Try a simpler description.");
      }
      
      generatedCode = JSON.parse(cleanContent);
      
      // Validate required fields
      if (!generatedCode.html) {
        throw new Error("Generated response missing 'html' field");
      }
      
      // Validate HTML has minimum content
      if (generatedCode.html.length < 200) {
        throw new Error("Generated HTML is too short. Please try again.");
      }
      
      console.log("Successfully generated website. HTML length:", generatedCode.html.length);
      
    } catch (parseError) {
      console.error("Failed to parse AI response.");
      console.error("Content length:", content.length);
      console.error("First 400 chars:", content.substring(0, 400));
      console.error("Last 400 chars:", content.substring(Math.max(0, content.length - 400)));
      console.error("Parse error:", parseError);
      
      if (content.length > 15000) {
        throw new Error("Response too large. Please use a shorter, simpler description.");
      }
      
      throw new Error("Failed to parse AI response. Please try a simpler description.");
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
