import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Query parameter is required');
    }

    console.log('Fetching weather data for:', query);

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // Fetch current weather
    const weatherResponse = await fetch(
      `https://weatherapi-com.p.rapidapi.com/current.json?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
        },
      }
    );

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('Weather API error:', errorText);
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // Fetch forecast (3 days)
    const forecastResponse = await fetch(
      `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${encodeURIComponent(query)}&days=3`,
      {
        headers: {
          'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
        },
      }
    );

    let forecastData = null;
    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json();
    }

    console.log('Weather data fetched successfully');

    return new Response(
      JSON.stringify({
        current: weatherData,
        forecast: forecastData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in weather-api function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
