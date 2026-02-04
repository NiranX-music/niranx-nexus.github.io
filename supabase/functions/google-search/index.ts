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
    // Get auth header but don't require it for basic searches
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    const { query, searchType = 'web' } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Search query:', query, 'type:', searchType, 'user:', user?.id || 'anonymous');

    const GOOGLE_SEARCH_API_KEY = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const GOOGLE_SEARCH_CX = Deno.env.get('GOOGLE_SEARCH_CX');

    if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_CX) {
      console.log('Google Search API not configured, providing helpful fallback');
      
      // Provide a helpful response that opens Google directly
      return new Response(JSON.stringify({
        results: [
          {
            title: `Search Google for: "${query}"`,
            link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: 'Click here to search on Google directly. For integrated search results, configure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX in your secrets.',
            displayLink: 'google.com',
          },
          {
            title: `Search Wikipedia for: "${query}"`,
            link: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
            snippet: 'Search Wikipedia for relevant articles and information.',
            displayLink: 'wikipedia.org',
          },
          {
            title: `Search YouTube for: "${query}"`,
            link: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            snippet: 'Watch videos related to your search on YouTube.',
            displayLink: 'youtube.com',
          }
        ],
        fallback: true,
        note: 'Direct search links provided. Configure Google Custom Search API for full integration.',
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
      // Return fallback on API error (invalid key, quota exceeded, etc.)
      return new Response(JSON.stringify({
        results: [
          {
            title: `Search Google for: "${query}"`,
            link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: 'Click here to search on Google directly.',
            displayLink: 'google.com',
          },
          {
            title: `Search Wikipedia for: "${query}"`,
            link: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
            snippet: 'Search Wikipedia for relevant articles and information.',
            displayLink: 'wikipedia.org',
          },
          {
            title: `Search YouTube for: "${query}"`,
            link: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            snippet: 'Watch videos related to your search on YouTube.',
            displayLink: 'youtube.com',
          }
        ],
        fallback: true,
        note: 'Google API unavailable. Using direct search links.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    // Return fallback on any error
    const query = 'search';
    return new Response(JSON.stringify({
      results: [
        {
          title: 'Search Google',
          link: 'https://www.google.com',
          snippet: 'Open Google to search directly.',
          displayLink: 'google.com',
        },
        {
          title: 'Search Wikipedia',
          link: 'https://en.wikipedia.org',
          snippet: 'Search Wikipedia for articles.',
          displayLink: 'wikipedia.org',
        }
      ],
      fallback: true,
      error: error instanceof Error ? error.message : 'Search failed',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
