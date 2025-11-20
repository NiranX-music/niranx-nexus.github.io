import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subjects, timing, priority } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating timetable with:', { subjects, timing, priority });

    // Create a detailed prompt for generating timetable
    const prompt = `Generate a detailed study timetable based on the following information:

Subjects: ${subjects.map((s: any) => `${s.name} (Priority: ${s.priority})`).join(', ')}
Available Time: ${timing}
Overall Priority Focus: ${priority}

Create a realistic weekly study timetable that:
1. Allocates more time to higher priority subjects
2. Includes regular breaks (5-10 min after each hour)
3. Balances study sessions throughout the week
4. Suggests optimal times based on subject difficulty
5. Includes variety to prevent burnout

Return the timetable as a JSON array of time slots with this structure:
[
  {
    "day": "Monday",
    "slots": [
      {
        "time": "9:00 AM - 10:00 AM",
        "subject": "Subject Name",
        "activity": "Study/Review/Practice",
        "priority": "high/medium/low"
      }
    ]
  }
]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a study planning expert. Generate realistic, balanced timetables that help students maximize productivity while preventing burnout.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    const generatedContent = data.choices[0].message.content;
    
    // Try to parse JSON from the response
    let timetable;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                       generatedContent.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : generatedContent;
      timetable = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse timetable JSON:', parseError);
      // Return a structured response even if parsing fails
      timetable = {
        raw: generatedContent,
        parsed: false
      };
    }

    return new Response(
      JSON.stringify({ timetable }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in timetable-ai function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
