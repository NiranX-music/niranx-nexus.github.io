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
    const { messages, currentCode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing website upgrade request");

    const systemPrompt = `You are an expert web developer assistant helping users enhance their websites.

CURRENT WEBSITE CODE:
${JSON.stringify(currentCode, null, 2)}

Your job is to:
1. Understand what the user wants to add or modify
2. Generate the updated HTML, CSS, and JavaScript code
3. Return ONLY a JSON object with the new code

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Keep code concise and efficient
3. Maintain existing functionality unless asked to change it
4. Response format: {"html": "...", "css": "...", "js": "..."}
5. All styles should be in the HTML <style> tag

DESIGN PRINCIPLES:
- Maintain modern, clean design
- Keep mobile responsiveness
- Use semantic HTML5
- Add smooth transitions for new features

Remember: Return ONLY the JSON object with updated code.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 10000,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
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
    let upgradedCode;
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
      
      upgradedCode = JSON.parse(cleanContent);
      
      if (!upgradedCode.html) {
        throw new Error("Response missing 'html' field");
      }
      
      console.log("Successfully generated upgrade. HTML length:", upgradedCode.html.length);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content preview:", content.substring(0, 500));
      throw new Error("Failed to parse AI response. Please try rephrasing your request.");
    }

    return new Response(
      JSON.stringify({ 
        message: "I've updated your website with the requested changes. Review the code and save if you're happy with it!",
        code: {
          html: upgradedCode.html || "",
          css: upgradedCode.css || "",
          js: upgradedCode.js || ""
        }
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Website AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
