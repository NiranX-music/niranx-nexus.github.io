import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizResponse {
  questionId: string;
  answer: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses, provider = 'lovable', model } = await req.json();

    if (!responses || !Array.isArray(responses)) {
      throw new Error('Responses array is required');
    }

    const systemPrompt = `You are an expert educational psychologist specializing in learning styles analysis. 
Based on the VARK learning styles model (Visual, Auditory, Read/Write, Kinesthetic), analyze the student's quiz responses and provide:

1. A detailed breakdown of their learning style percentages
2. Their primary and secondary learning styles
3. Specific study recommendations tailored to their style
4. Tips for each subject area (Math, Science, Languages, History, etc.)

Respond in JSON format with this structure:
{
  "styles": {
    "visual": <percentage 0-100>,
    "auditory": <percentage 0-100>,
    "readWrite": <percentage 0-100>,
    "kinesthetic": <percentage 0-100>
  },
  "primaryStyle": "<visual|auditory|readWrite|kinesthetic>",
  "secondaryStyle": "<visual|auditory|readWrite|kinesthetic>",
  "summary": "<2-3 sentence summary of their learning profile>",
  "recommendations": [
    {"title": "<tip title>", "description": "<detailed tip>", "style": "<which style this helps>"},
    ...
  ],
  "subjectTips": {
    "math": "<specific tip for math>",
    "science": "<specific tip for science>",
    "languages": "<specific tip for languages>",
    "history": "<specific tip for history>",
    "arts": "<specific tip for arts>"
  }
}`;

    const userPrompt = `Here are the student's quiz responses about their learning preferences:

${responses.map((r: QuizResponse, i: number) => `Q${i + 1}: ${r.questionId} - Answer: ${r.answer}`).join('\n')}

Analyze these responses and provide a comprehensive learning style assessment.`;

    let apiUrl: string;
    let headers: Record<string, string>;
    let body: any;

    if (provider === 'lovable') {
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }
      headers = {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      };
      body = {
        model: model || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      };
    } else {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
      if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }
      headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      };
      body = {
        model: model || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };
    }

    console.log(`Analyzing learning style with provider: ${provider}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    try {
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(content);
      
      console.log(`Learning style analysis complete: Primary=${analysis.primaryStyle}`);

      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse learning style analysis');
    }
  } catch (error) {
    console.error('Learning style analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
