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
    const { emailContent, emailSubject, senderName } = await req.json();
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI assistant helping to generate quick reply suggestions for emails.
Given an email's content, subject, and sender, generate 3 brief, professional reply options.
Each reply should be:
- Concise (1-3 sentences)
- Professional and friendly
- Appropriate to the email context

Return ONLY a JSON array with 3 objects, each having:
- "label": A short 2-4 word label describing the reply type (e.g., "Acknowledge Receipt", "Request Details", "Confirm Attendance")
- "content": The actual reply text

Example output:
[
  {"label": "Acknowledge Receipt", "content": "Thank you for your email. I have received it and will get back to you shortly."},
  {"label": "Request More Info", "content": "Thank you for reaching out. Could you please provide more details about this matter?"},
  {"label": "Confirm & Schedule", "content": "That sounds great! I'm available to discuss this further. When works best for you?"}
]`;

    const userPrompt = `Generate 3 quick reply suggestions for this email:

From: ${senderName}
Subject: ${emailSubject}
Content: ${emailContent}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the JSON from the response
    let suggestions;
    try {
      // Extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse suggestions:", content);
      // Fallback suggestions
      suggestions = [
        { label: "Acknowledge", content: "Thank you for your email. I'll review and get back to you soon." },
        { label: "Request Info", content: "Thanks for reaching out. Could you provide more details?" },
        { label: "Confirm", content: "Got it! I'll take care of this and follow up shortly." }
      ];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating suggestions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate suggestions",
        suggestions: [
          { label: "Acknowledge", content: "Thank you for your email. I'll review and get back to you soon." },
          { label: "Request Info", content: "Thanks for reaching out. Could you provide more details?" },
          { label: "Confirm", content: "Got it! I'll take care of this and follow up shortly." }
        ]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
