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
    const { centralTopic, existingNodes, provider = 'lovable', model } = await req.json();

    if (!centralTopic) {
      throw new Error('Central topic is required');
    }

    const existingNodesList = existingNodes?.map((n: any) => n.label).join(', ') || 'none';

    const systemPrompt = `You are a mind map expert. Given a central topic and existing nodes, suggest 5 new related concepts that would expand the mind map meaningfully.

Return ONLY a valid JSON array of objects with this exact structure:
[
  {"label": "Concept Name", "description": "Brief explanation", "category": "category_name"},
  ...
]

Categories can be: definition, example, related, application, history, or theory.
Do not include concepts that are already in the existing nodes.`;

    const userPrompt = `Central Topic: ${centralTopic}
Existing Nodes: ${existingNodesList}

Suggest 5 new related concepts for this mind map.`;

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
      };
    } else {
      // OpenRouter or other providers
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
      if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }
      headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://niranx.lovable.app',
        'X-Title': 'NiranX Mind Map Builder',
      };
      body = {
        model: model || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };
    }

    console.log(`Mind map suggestion with provider: ${provider}, model: ${body.model}`);

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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    console.log(`Generated ${suggestions.length} mind map suggestions`);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Mind map suggestion error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
