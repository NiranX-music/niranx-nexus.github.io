import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { essay, title, rubric, provider = 'lovable', model } = await req.json();

    if (!essay) {
      throw new Error('Essay content is required');
    }

    const wordCount = essay.split(/\s+/).filter((w: string) => w.length > 0).length;

    let rubricInstructions = '';
    if (rubric && rubric.criteria) {
      rubricInstructions = `
Use this grading rubric:
${rubric.criteria.map((c: RubricCriterion) => `- ${c.name} (${c.maxPoints} points): ${c.description}`).join('\n')}
Total possible points: ${rubric.maxScore || 100}`;
    } else {
      rubricInstructions = `
Use a standard essay grading rubric:
- Thesis & Argument (25 points): Clear thesis, strong argument, logical reasoning
- Evidence & Support (25 points): Relevant evidence, proper citations, examples
- Organization (20 points): Clear structure, smooth transitions, coherent flow
- Language & Style (15 points): Grammar, vocabulary, sentence variety
- Originality & Insight (15 points): Creative thinking, unique perspectives
Total possible points: 100`;
    }

    const systemPrompt = `You are an expert essay grader and writing coach. Your role is to:
1. Provide detailed, constructive feedback on student essays
2. Grade fairly and consistently according to the rubric
3. Identify specific strengths and areas for improvement
4. Give actionable suggestions for revision
5. Be encouraging while maintaining high standards

${rubricInstructions}

Respond in JSON format:
{
  "score": <total score>,
  "maxScore": <maximum possible score>,
  "percentage": <percentage score>,
  "letterGrade": "<A+/A/A-/B+/B/B-/C+/C/C-/D/F>",
  "criteriaScores": [
    {"name": "<criterion name>", "score": <points>, "maxScore": <max points>, "feedback": "<specific feedback>"}
  ],
  "overallFeedback": "<2-3 paragraphs of comprehensive feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "inlineComments": [
    {"startIndex": <approximate char position>, "text": "<selected text>", "comment": "<inline feedback>"}
  ],
  "grammarIssues": [
    {"issue": "<description>", "suggestion": "<correction>", "type": "<grammar|spelling|punctuation|style>"}
  ],
  "nextSteps": ["<actionable step 1>", "<actionable step 2>"]
}`;

    const userPrompt = `Please grade this essay${title ? ` titled "${title}"` : ''}:

Word Count: ${wordCount}

---
${essay}
---

Provide comprehensive feedback and grading.`;

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
    } else if (provider === 'openai-direct') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      };
      body = {
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      };
    } else if (provider === 'groq') {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
      if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
      headers = {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      };
      body = {
        model: model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      };
    } else if (provider === 'deepseek') {
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
      if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY is not configured');
      headers = {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      };
      body = {
        model: model || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      };
    } else if (provider === 'perplexity') {
      apiUrl = 'https://api.perplexity.ai/chat/completions';
      const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
      if (!PERPLEXITY_API_KEY) throw new Error('PERPLEXITY_API_KEY is not configured');
      headers = {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      };
      body = {
        model: model || 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };
    } else if (provider === 'aiml') {
      apiUrl = 'https://api.aimlapi.com/chat/completions';
      const AIML_API_KEY = Deno.env.get('AIML_API_KEY');
      if (!AIML_API_KEY) throw new Error('AIML_API_KEY is not configured');
      headers = {
        'Authorization': `Bearer ${AIML_API_KEY}`,
        'Content-Type': 'application/json',
      };
      body = {
        model: model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };
    } else {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
      if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured');
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

    console.log(`Grading essay with provider: ${provider}, word count: ${wordCount}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    try {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const grading = JSON.parse(content);
      grading.wordCount = wordCount;
      
      console.log(`Essay graded: ${grading.score}/${grading.maxScore} (${grading.letterGrade})`);

      return new Response(
        JSON.stringify(grading),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse grading response:', content);
      throw new Error('Failed to parse essay grading');
    }
  } catch (error) {
    console.error('Essay grading error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
