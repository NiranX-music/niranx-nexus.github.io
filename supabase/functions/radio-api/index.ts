import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback genres when API is unavailable
const fallbackGenres = [
  { id: "1", name: "Pop" },
  { id: "2", name: "Rock" },
  { id: "3", name: "Jazz" },
  { id: "4", name: "Classical" },
  { id: "5", name: "Hip Hop" },
  { id: "6", name: "Electronic" },
  { id: "7", name: "Country" },
  { id: "8", name: "R&B" },
  { id: "9", name: "Latin" },
  { id: "10", name: "Indie" },
  { id: "11", name: "Metal" },
  { id: "12", name: "Blues" },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, genreId, countryCode, searchQuery, searchType, artistId, page = 1 } = await req.json();
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');

    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // TheAudioDB API endpoints (free tier)
    const audioDbBaseUrl = 'https://www.theaudiodb.com/api/v1/json/2';
    
    // Radio World API
    const radioBaseUrl = 'https://radio-world-50-000-radios-stations.p.rapidapi.com';
    const radioHeaders = {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': 'radio-world-50-000-radios-stations.p.rapidapi.com',
    };

    let endpoint = '';
    let useRadioApi = true;
    
    switch (action) {
      // Radio World API actions
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
      
      // TheAudioDB API actions (free API, no key needed)
      case 'searchAudioDB':
        useRadioApi = false;
        if (searchType === 'artist') {
          endpoint = `/search.php?s=${encodeURIComponent(searchQuery)}`;
        } else if (searchType === 'album') {
          endpoint = `/searchalbum.php?s=${encodeURIComponent(searchQuery)}`;
        } else if (searchType === 'track') {
          endpoint = `/searchtrack.php?s=${encodeURIComponent(searchQuery)}`;
        }
        break;
      case 'getArtistDetails':
        useRadioApi = false;
        endpoint = `/artist.php?i=${artistId}`;
        break;
      case 'getArtistAlbums':
        useRadioApi = false;
        endpoint = `/album.php?i=${artistId}`;
        break;
      case 'getAlbumTracks':
        useRadioApi = false;
        endpoint = `/track.php?m=${artistId}`;
        break;
      default:
        throw new Error('Invalid action');
    }

    const url = useRadioApi ? `${radioBaseUrl}${endpoint}` : `${audioDbBaseUrl}${endpoint}`;
    const headers = useRadioApi ? radioHeaders : {};
    
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    // Handle Radio API errors with fallbacks
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      
      // Return fallback data for genres when API is unavailable
      if (action === 'getGenres' && (response.status === 502 || response.status === 429)) {
        console.log('Returning fallback genres');
        return new Response(JSON.stringify({ genres: fallbackGenres }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API request failed: ${response.status}`);
    }

    // Handle empty or null responses from TheAudioDB
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '' || responseText === 'null') {
      console.log('Empty response from API, returning empty result');
      return new Response(JSON.stringify({ artists: null, album: null, track: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ artists: null, album: null, track: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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
