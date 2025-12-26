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

    const { action, accountId, ...params } = await req.json();
    console.log(`Google Drive action: ${action} for user: ${user.id}, accountId: ${accountId}`);

    switch (action) {
      case 'get-auth-url': {
        const redirectUri = params.redirectUri;
        const scopes = [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.readonly',
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

        // Check if this account is already connected
        const { data: existingAccount } = await supabase
          .from('google_drive_tokens')
          .select('id')
          .eq('user_id', user.id)
          .eq('google_email', googleUser.email)
          .single();

        // Check how many accounts user has
        const { data: accountCount } = await supabase
          .from('google_drive_tokens')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const isPrimary = !accountCount || accountCount.length === 0;

        let accountIdResult: string;

        if (existingAccount) {
          accountIdResult = existingAccount.id;
          // Update existing account
          const { error: updateError } = await supabase
            .from('google_drive_tokens')
            .update({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || existingAccount.refresh_token,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            })
            .eq('id', existingAccount.id);

          if (updateError) {
            console.error('Token update error:', updateError);
            return new Response(JSON.stringify({ error: 'Failed to update tokens' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } else {
          // Insert new account
          const { data: newAccount, error: insertError } = await supabase
            .from('google_drive_tokens')
            .insert({
              user_id: user.id,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
              google_email: googleUser.email,
              account_name: googleUser.name || googleUser.email,
              is_primary: isPrimary,
            })
            .select('id')
            .single();

          if (insertError || !newAccount) {
            console.error('Token storage error:', insertError);
            return new Response(JSON.stringify({ error: 'Failed to store tokens' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          accountIdResult = newAccount.id;
        }

        return new Response(JSON.stringify({ 
          success: true,
          email: googleUser.email,
          accountId: accountIdResult,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list-accounts': {
        const { data: accounts } = await supabase
          .from('google_drive_tokens')
          .select('id, google_email, account_name, is_primary')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false });

        return new Response(JSON.stringify({ accounts: accounts || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check-connection': {
        const { data: tokenData } = await supabase
          .from('google_drive_tokens')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .limit(1)
          .single();

        return new Response(JSON.stringify({ 
          connected: !!tokenData,
          email: tokenData?.google_email 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'disconnect': {
        if (accountId) {
          await supabase
            .from('google_drive_tokens')
            .delete()
            .eq('id', accountId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('google_drive_tokens')
            .delete()
            .eq('user_id', user.id);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'disconnect-all': {
        await supabase
          .from('google_drive_tokens')
          .delete()
          .eq('user_id', user.id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list-files': {
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Drive' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { folderId, pageToken, query } = params;
        let q = `trashed=false`;
        if (folderId) {
          q += ` and '${folderId}' in parents`;
        } else {
          q += ` and 'root' in parents`;
        }
        if (query) {
          q += ` and name contains '${query}'`;
        }

        const url = new URL('https://www.googleapis.com/drive/v3/files');
        url.searchParams.set('q', q);
        url.searchParams.set('fields', 'nextPageToken,files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,iconLink,parents)');
        url.searchParams.set('pageSize', '50');
        url.searchParams.set('orderBy', 'folder,name');
        if (pageToken) url.searchParams.set('pageToken', pageToken);

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();
        
        if (data.error) {
          console.error('Drive API error:', data.error);
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'upload-file': {
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Drive' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { fileName, mimeType, content, folderId } = params;

        const metadata: any = { name: fileName };
        if (folderId) metadata.parents = [folderId];

        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const body = 
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType}\r\n` +
          'Content-Transfer-Encoding: base64\r\n\r\n' +
          content +
          closeDelimiter;

        const response = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body,
          }
        );

        const data = await response.json();

        if (data.error) {
          console.error('Upload error:', data.error);
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, file: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'download-file': {
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Drive' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { fileId, mimeType } = params;
        
        let url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
        
        if (mimeType?.startsWith('application/vnd.google-apps')) {
          const exportMimeTypes: Record<string, string> = {
            'application/vnd.google-apps.document': 'application/pdf',
            'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.google-apps.presentation': 'application/pdf',
          };
          const exportMimeType = exportMimeTypes[mimeType] || 'application/pdf';
          url += `/export?mimeType=${encodeURIComponent(exportMimeType)}`;
        } else {
          url += '?alt=media';
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('Download error:', error);
          return new Response(JSON.stringify({ error: 'Failed to download file' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        return new Response(JSON.stringify({ 
          content: base64,
          contentType: response.headers.get('content-type'),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-file': {
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Drive' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { fileId } = params;

        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok && response.status !== 204) {
          const error = await response.text();
          console.error('Delete error:', error);
          return new Response(JSON.stringify({ error: 'Failed to delete file' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create-folder': {
        const accessToken = await getValidAccessToken(supabase, user.id, accountId);
        if (!accessToken) {
          return new Response(JSON.stringify({ error: 'Not connected to Google Drive' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { folderName, parentFolderId } = params;

        const metadata: any = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        };
        if (parentFolderId) metadata.parents = [parentFolderId];

        const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
        });

        const data = await response.json();

        if (data.error) {
          console.error('Create folder error:', data.error);
          return new Response(JSON.stringify({ error: data.error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, folder: data }), {
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
    console.error('Google Drive function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getValidAccessToken(supabase: any, userId: string, accountId?: string): Promise<string | null> {
  let query = supabase
    .from('google_drive_tokens')
    .select('*')
    .eq('user_id', userId);

  if (accountId) {
    query = query.eq('id', accountId);
  } else {
    query = query.order('is_primary', { ascending: false }).limit(1);
  }

  const { data: tokenData } = await query.single();

  if (!tokenData) return null;

  // Check if token is expired (with 5 min buffer)
  const expiresAt = new Date(tokenData.expires_at);
  if (expiresAt.getTime() - 300000 > Date.now()) {
    return tokenData.access_token;
  }

  // Refresh the token
  console.log('Refreshing Google access token for user:', userId);
  
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

  // Update stored tokens
  await supabase
    .from('google_drive_tokens')
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    .eq('id', tokenData.id);

  return tokens.access_token;
}