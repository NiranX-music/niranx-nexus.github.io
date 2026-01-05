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
    const { labType, experimentName, variables, observations, provider = 'lovable', model } = await req.json();

    if (!labType || !experimentName) {
      throw new Error('Lab type and experiment name are required');
    }

    const systemPrompt = `You are a science lab instructor AI. Analyze virtual lab experiments and provide educational feedback.

Return ONLY a valid JSON object with this structure:
{
  "analysis": "Detailed analysis of the experiment results",
  "scientificPrinciples": ["Principle 1", "Principle 2"],
  "whatWorkedWell": ["Point 1", "Point 2"],
  "areasToImprove": ["Suggestion 1", "Suggestion 2"],
  "realWorldApplications": ["Application 1", "Application 2"],
  "followUpQuestions": ["Question 1", "Question 2"],
  "grade": "A/B/C/D/F based on scientific accuracy and methodology"
}`;

    const userPrompt = `Lab Type: ${labType}
Experiment: ${experimentName}
Variables Used: ${JSON.stringify(variables || {})}
Student Observations: ${observations || 'No observations recorded'}

Please analyze this virtual lab experiment and provide educational feedback.`;

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

    console.log(`Experiment analysis with provider: ${provider}`);

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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const feedback = JSON.parse(jsonMatch[0]);

    console.log(`Generated experiment feedback with grade: ${feedback.grade}`);

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Experiment analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
