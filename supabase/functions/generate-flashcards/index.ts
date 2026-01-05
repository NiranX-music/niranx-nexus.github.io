import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  topic: string;
  content?: string;
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  provider: string;
  model: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, content, count, difficulty, provider, model } = await req.json() as GenerateRequest;

    if (!topic && !content) {
      return new Response(
        JSON.stringify({ error: 'Topic or content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert flashcard creator for educational purposes. Generate ${count} flashcards about the given topic or content. 
    
The difficulty level is: ${difficulty}
- easy: Simple recall questions with straightforward answers
- medium: Questions that require understanding concepts
- hard: Questions that require analysis, synthesis, or application of knowledge

Return your response as a JSON array with the following structure:
[
  {
    "question": "The question text",
    "answer": "The answer text",
    "difficulty": "${difficulty}"
  }
]

Only return the JSON array, no other text.`;

    const userPrompt = content 
      ? `Create flashcards from this content:\n\n${content}`
      : `Create flashcards about: ${topic}`;

    let apiUrl: string;
    let headers: Record<string, string>;
    let body: any;

    // Route to appropriate API based on provider
    if (provider === 'openai-direct') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured. Please add it in settings.');
      }
      headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      };
      
      // Check if model is GPT-5 or newer (requires different parameters)
      const isNewModel = model?.includes('gpt-5') || model?.includes('gpt-4.1') || model?.includes('o3') || model?.includes('o4');
      
      body = {
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        ...(isNewModel ? { max_completion_tokens: 4096 } : { max_tokens: 4096, temperature: 0.7 }),
      };
    } else if (provider === 'lovable') {
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
    } else if (provider === 'groq') {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
      if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured. Please add it in settings.');
      }
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
      };
    } else if (provider === 'deepseek') {
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
      if (!DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY is not configured. Please add it in settings.');
      }
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
      };
    } else if (provider === 'aiml') {
      apiUrl = 'https://api.aimlapi.com/chat/completions';
      const AIML_API_KEY = Deno.env.get('AIML_API_KEY');
      if (!AIML_API_KEY) {
        throw new Error('AIML_API_KEY is not configured. Please add it in settings.');
      }
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
      // OpenRouter for openai, anthropic, google, openrouter providers
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
      if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured. Please add it in settings.');
      }
      headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://studyverse.app',
        'X-Title': 'StudyVerse Flashcards',
      };
      body = {
        model: model || 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };
    }

    console.log(`Calling ${provider} API with model: ${body.model}`);

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
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted. Please check your API key balance.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content_response = data.choices?.[0]?.message?.content;

    if (!content_response) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let flashcards;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content_response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(content_response);
      }
    } catch (parseError) {
      console.error('Failed to parse flashcards:', parseError);
      console.log('Raw response:', content_response);
      throw new Error('Failed to parse AI response as flashcards');
    }

    return new Response(
      JSON.stringify({ flashcards }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate flashcards' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
