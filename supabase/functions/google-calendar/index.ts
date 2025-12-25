import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...params } = await req.json();
    console.log(`Google Calendar action: ${action} for user: ${user.id}`);

    switch (action) {
      case 'get-auth-url': {
        const { redirectUri } = params;
        const scopes = [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' ');

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${GOOGLE_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scopes)}` +
          `&access_type=offline` +
          `&prompt=consent`;

        return new Response(JSON.stringify({ authUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'exchange-code': {
        const { code, redirectUri } = params;
        
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });

        const tokens = await tokenResponse.json();
        
        if (tokens.error) {
          console.error('Token exchange error:', tokens);
          return new Response(JSON.stringify({ error: tokens.error_description || tokens.error }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userInfoResponse.json();

        // Check if this email is already connected
        const { data: existing } = await supabase
          .from('google_calendar_tokens')
          .select('id')
          .eq('user_id', user.id)
          .eq('google_email', googleUser.email)
          .single();

        if (existing) {
          // Update existing token
          await supabase
            .from('google_calendar_tokens')
            .update({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || existing.refresh_token,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          // Check if this is the first account
          const { count } = await supabase
            .from('google_calendar_tokens')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          // Store new tokens
          await supabase
            .from('google_calendar_tokens')
            .insert({
              user_id: user.id,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
              google_email: googleUser.email,
              account_name: googleUser.name || googleUser.email,
              is_primary: (count || 0) === 0,
            });
        }

        return new Response(JSON.stringify({ 
          success: true,
          email: googleUser.email,
          name: googleUser.name,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list-accounts': {
        const { data: accounts } = await supabase
          .from('google_calendar_tokens')
          .select('id, google_email, account_name, is_primary, created_at')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false });

        return new Response(JSON.stringify({ accounts: accounts || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'disconnect': {
        const { accountId } = params;
        
        if (accountId) {
          await supabase
            .from('google_calendar_tokens')
            .delete()
            .eq('id', accountId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('google_calendar_tokens')
            .delete()
            .eq('user_id', user.id);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list-calendars': {
        const { accountId } = params;
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Calendar' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();
        
        if (data.error) {
          console.error('Calendar API error:', data.error);
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ calendars: data.items || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list-events': {
        const { accountId, calendarId = 'primary', timeMin, timeMax, maxResults = 100 } = params;
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Calendar' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('orderBy', 'startTime');
        url.searchParams.set('maxResults', String(maxResults));
        
        if (timeMin) url.searchParams.set('timeMin', timeMin);
        if (timeMax) url.searchParams.set('timeMax', timeMax);

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();
        
        if (data.error) {
          console.error('Events API error:', data.error);
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ events: data.items || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create-event': {
        const { accountId, calendarId = 'primary', event } = params;
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Calendar' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        );

        const data = await response.json();
        
        if (data.error) {
          console.error('Create event error:', data.error);
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ event: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-event': {
        const { accountId, calendarId = 'primary', eventId, event } = params;
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Calendar' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          }
        );

        const data = await response.json();
        
        if (data.error) {
          console.error('Update event error:', data.error);
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ event: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-event': {
        const { accountId, calendarId = 'primary', eventId } = params;
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Calendar' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok && response.status !== 204) {
          const error = await response.text();
          console.error('Delete event error:', error);
          return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Google Calendar function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getValidAccessToken(supabase: any, userId: string, accountId?: string): Promise<string | null> {
  let query = supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId);
  
  if (accountId) {
    query = query.eq('id', accountId);
  } else {
    query = query.eq('is_primary', true);
  }
  
  const { data: tokenData } = await query.single();

  if (!tokenData) {
    // Fall back to any account if no primary
    const { data: anyToken } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (!anyToken) return null;
    return await refreshTokenIfNeeded(supabase, anyToken);
  }

  return await refreshTokenIfNeeded(supabase, tokenData);
}

async function refreshTokenIfNeeded(supabase: any, tokenData: any): Promise<string | null> {
  const expiresAt = new Date(tokenData.expires_at);
  if (expiresAt.getTime() - 300000 > Date.now()) {
    return tokenData.access_token;
  }

  console.log('Refreshing Google Calendar access token for account:', tokenData.google_email);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const tokens = await response.json();

  if (tokens.error) {
    console.error('Token refresh error:', tokens);
    return null;
  }

  await supabase
    .from('google_calendar_tokens')
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tokenData.id);

  return tokens.access_token;
}
