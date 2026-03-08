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
    const { query } = await req.json();

    if (!query) {
      throw new Error('Query parameter is required');
    }

    console.log('Fetching weather data for:', query);

    // Step 1: Geocode the location using Open-Meteo Geocoding API (free, no key)
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    );

    if (!geoRes.ok) {
      throw new Error('Geocoding failed');
    }

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Location "${query}" not found`);
    }

    const location = geoData.results[0];
    const { latitude, longitude, name, admin1, country, timezone } = location;

    console.log(`Found location: ${name}, ${admin1 || ''}, ${country} (${latitude}, ${longitude})`);

    // Step 2: Fetch weather from Open-Meteo (free, no key)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=${encodeURIComponent(timezone || 'auto')}` +
      `&forecast_days=3`
    );

    if (!weatherRes.ok) {
      throw new Error('Weather API request failed');
    }

    const weather = await weatherRes.json();

    // Map WMO weather codes to descriptions and icon hints
    const weatherCodeMap: Record<number, { text: string; icon: string }> = {
      0: { text: "Clear sky", icon: "☀️" },
      1: { text: "Mainly clear", icon: "🌤️" },
      2: { text: "Partly cloudy", icon: "⛅" },
      3: { text: "Overcast", icon: "☁️" },
      45: { text: "Foggy", icon: "🌫️" },
      48: { text: "Depositing rime fog", icon: "🌫️" },
      51: { text: "Light drizzle", icon: "🌦️" },
      53: { text: "Moderate drizzle", icon: "🌦️" },
      55: { text: "Dense drizzle", icon: "🌧️" },
      61: { text: "Slight rain", icon: "🌧️" },
      63: { text: "Moderate rain", icon: "🌧️" },
      65: { text: "Heavy rain", icon: "🌧️" },
      71: { text: "Slight snow", icon: "🌨️" },
      73: { text: "Moderate snow", icon: "🌨️" },
      75: { text: "Heavy snow", icon: "❄️" },
      80: { text: "Slight rain showers", icon: "🌦️" },
      81: { text: "Moderate rain showers", icon: "🌧️" },
      82: { text: "Violent rain showers", icon: "⛈️" },
      85: { text: "Slight snow showers", icon: "🌨️" },
      86: { text: "Heavy snow showers", icon: "❄️" },
      95: { text: "Thunderstorm", icon: "⛈️" },
      96: { text: "Thunderstorm with hail", icon: "⛈️" },
      99: { text: "Thunderstorm with heavy hail", icon: "⛈️" },
    };

    const currentCode = weather.current?.weather_code ?? 0;
    const condition = weatherCodeMap[currentCode] || { text: "Unknown", icon: "🌡️" };

    // Get current local time
    const now = new Date();
    const localtime = now.toLocaleString('en-US', { timeZone: timezone || 'UTC' });

    // Format response to match the frontend's expected structure
    const responseData = {
      current: {
        location: {
          name,
          region: admin1 || '',
          country,
          localtime,
        },
        current: {
          temp_c: Math.round(weather.current.temperature_2m),
          feelslike_c: Math.round(weather.current.apparent_temperature),
          condition: {
            text: condition.text,
            icon: condition.icon,
          },
          wind_kph: Math.round(weather.current.wind_speed_10m),
          humidity: weather.current.relative_humidity_2m,
          vis_km: weather.current.visibility ? Math.round(weather.current.visibility / 1000) : 10,
          pressure_mb: Math.round(weather.current.pressure_msl),
        },
      },
      forecast: {
        forecast: {
          forecastday: (weather.daily?.time || []).map((date: string, i: number) => {
            const dayCode = weather.daily.weather_code[i];
            const dayCondition = weatherCodeMap[dayCode] || { text: "Unknown", icon: "🌡️" };
            return {
              date,
              day: {
                maxtemp_c: Math.round(weather.daily.temperature_2m_max[i]),
                mintemp_c: Math.round(weather.daily.temperature_2m_min[i]),
                condition: {
                  text: dayCondition.text,
                  icon: dayCondition.icon,
                },
                daily_chance_of_rain: weather.daily.precipitation_probability_max?.[i] ?? 0,
              },
            };
          }),
        },
      },
    };

    console.log('Weather data fetched successfully via Open-Meteo');

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
