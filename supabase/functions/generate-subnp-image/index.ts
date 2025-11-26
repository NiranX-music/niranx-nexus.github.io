import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = "turbo" } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client to check admin settings
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: unauthorizedSetting } = await serviceClient.rpc('get_admin_setting', {
      p_setting_key: 'allow_unauthorized_ai'
    });
    
    const allowUnauthorized = unauthorizedSetting?.enabled || false;

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let supabaseClient = null;

    if (authHeader) {
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user: authenticatedUser }, error: userError } = await supabaseClient.auth.getUser();
      
      if (!userError && authenticatedUser) {
        user = authenticatedUser;
      }
    }

    if (!allowUnauthorized && !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: unlimitedSetting } = await serviceClient.rpc('get_admin_setting', {
      p_setting_key: 'unlimited_credits_enabled'
    });
    
    const unlimitedCredits = unlimitedSetting?.enabled || false;

    if (user && !unlimitedCredits && supabaseClient) {
      const { data: hasCredits, error: creditError } = await supabaseClient.rpc('deduct_credits', {
        _user_id: user.id,
        _amount: 1
      });

      if (creditError) {
        console.error('Credit deduction error:', creditError);
      } else if (!hasCredits) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. You need 1 credit to generate an image.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
    }

    console.log(`Generating image with prompt: ${prompt}, model: ${model}`);

    // Make request to SubNP API
    const response = await fetch("https://subnp.com/api/free/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SubNP API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate image",
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in generate-subnp-image function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
