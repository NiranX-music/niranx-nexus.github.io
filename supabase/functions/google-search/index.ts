import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query, searchType = 'web' } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GOOGLE_SEARCH_API_KEY = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const GOOGLE_SEARCH_CX = Deno.env.get('GOOGLE_SEARCH_CX');

    if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_CX) {
      console.log('Google Search API not configured, using fallback search');
      
      // Fallback: Use a simple web scraping approach or return mock data
      // In production, you would configure the actual API keys
      return new Response(JSON.stringify({
        results: [
          {
            title: `Search results for: ${query}`,
            link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: 'Click to open Google search in a new tab. Configure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX in secrets for full integration.',
            displayLink: 'www.google.com',
          }
        ],
        note: 'Google Search API not configured. Add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX to enable full search.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Searching Google for:', query, 'type:', searchType);

    // Build the Google Custom Search API URL
    let url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_CX}&q=${encodeURIComponent(query)}`;
    
    if (searchType === 'image') {
      url += '&searchType=image';
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Google Search API error:', data);
      throw new Error(data.error?.message || 'Failed to fetch search results');
    }

    // Parse results
    const results = (data.items || []).map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || '',
      displayLink: item.displayLink,
      thumbnail: item.image?.thumbnailLink || item.pagemap?.cse_thumbnail?.[0]?.src,
    }));

    console.log('Found', results.length, 'results');

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Google Search error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Search failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
