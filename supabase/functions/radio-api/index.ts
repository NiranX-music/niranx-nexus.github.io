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
    const { action, genreId, countryCode, searchQuery, page = 1 } = await req.json();
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');

    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    const baseUrl = 'https://radio-world-50-000-radios-stations.p.rapidapi.com';
    const headers = {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': 'radio-world-50-000-radios-stations.p.rapidapi.com',
    };

    let endpoint = '';
    
    switch (action) {
      case 'getGenres':
        endpoint = '/v1/genres/getAll';
        break;
      case 'getCountries':
        endpoint = '/v1/countries/getAll';
        break;
      case 'getStationsByGenre':
        endpoint = `/v1/radios/getByGenre?genre_id=${genreId}&page=${page}`;
        break;
      case 'getStationsByCountry':
        endpoint = `/v1/radios/getByCountry?country_code=${countryCode}&page=${page}`;
        break;
      case 'searchStations':
        endpoint = `/v1/radios/search?query=${encodeURIComponent(searchQuery)}&page=${page}`;
        break;
      case 'getTopStations':
        endpoint = `/v1/radios/getTopVoted?page=${page}`;
        break;
      default:
        throw new Error('Invalid action');
    }

    console.log(`Fetching: ${baseUrl}${endpoint}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response received successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in radio-api function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
