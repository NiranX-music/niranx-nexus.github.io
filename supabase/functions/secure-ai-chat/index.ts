import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        needsApiKey: true 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, category = 'general' } = await req.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check message content using database validation
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_message_content', { content: prompt });

    if (validationError || !validationResult) {
      console.error('Content validation failed:', validationError);
      return new Response(JSON.stringify({ error: 'Invalid message content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limiting
    const { data: rateLimitResult, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', { 
        user_uuid: user.id, 
        action_type_param: 'ai_chat',
        limit_per_hour: 60 
      });

    if (rateLimitError || !rateLimitResult) {
      console.error('Rate limit check failed:', rateLimitError);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare comprehensive system message with platform knowledge
    const platformContext = `You are the AI Study Assistant for Studyverse, a comprehensive educational platform. 

PLATFORM FEATURES YOU CAN HELP WITH:
- Dashboard, Analytics, Tasks, Scheduler, Exam Hub
- Live Classrooms (video calls, screen sharing, attendance)
- Virtual Labs (Chemistry, Physics, Biology, Math)
- Debate Hub (Reddit-style discussions)
- Focus Tools (Pomodoro, Havoc Mode, Distraction Blocker)
- Study Resources (Library, PDF Viewer, Video Player)
- Gamification (XP, Streaks, Achievements, Guilds)
- AI Tools (Scheduler, Study Buddy, Contextual Suggestions)
- Social Features (Community, Messages, Study Groups)

Keep responses under 5000 characters. Be helpful, encouraging, and guide users to use platform features when relevant.`;

    let systemMessage = platformContext;
    
    switch (category) {
      case 'homework':
        systemMessage = `${platformContext}\n\nSPECIALIZATION: Homework Help
Guide students through problems step-by-step without giving direct answers. Encourage learning and understanding. Suggest using Virtual Labs for science, Math Lab for calculations, or Study Groups for collaboration.`;
        break;
      case 'explain':
        systemMessage = `${platformContext}\n\nSPECIALIZATION: Concept Explanation
Explain complex concepts in simple terms. Use analogies and examples. Recommend Virtual Labs for hands-on learning or Video Library for visual explanations.`;
        break;
      case 'practice':
        systemMessage = `${platformContext}\n\nSPECIALIZATION: Practice Questions
Create meaningful practice questions. Suggest Quiz Leaderboards in Virtual Labs or Daily Challenges for gamified practice.`;
        break;
      case 'translate':
        systemMessage = `${platformContext}\n\nSPECIALIZATION: Language Learning
Provide accurate translations and explain grammar. Recommend Study Material Hub for language resources.`;
        break;
      case 'schedule':
        systemMessage = `${platformContext}\n\nSPECIALIZATION: Study Planning
Create realistic study schedules. Recommend using AI Scheduler, Enhanced Scheduler, or Smart Timetable features for automated planning.`;
        break;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1250,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Log the interaction (optional)
    await supabase
      .from('voice_commands')
      .insert({
        user_id: user.id,
        command_text: prompt,
        intent: category,
        response_text: aiResponse,
        success: true
      });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      category 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in secure-ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});