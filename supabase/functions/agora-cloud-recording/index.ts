import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, classId, channelName, uid } = await req.json();
    
    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');
    
    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    // Agora Cloud Recording REST API
    const customerKey = Deno.env.get('AGORA_CUSTOMER_KEY');
    const customerSecret = Deno.env.get('AGORA_CUSTOMER_SECRET');
    
    if (!customerKey || !customerSecret) {
      console.error('Missing Agora customer credentials');
      throw new Error('Agora Cloud Recording credentials not configured. Please add AGORA_CUSTOMER_KEY and AGORA_CUSTOMER_SECRET secrets.');
    }

    console.log('Using credentials for appId:', appId);
    const auth = btoa(`${customerKey}:${customerSecret}`);
    const baseUrl = `https://api.agora.io/v1/apps/${appId}/cloud_recording`;

    if (action === 'start') {
      // Acquire resource ID
      const acquireResponse = await fetch(`${baseUrl}/acquire`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid.toString(),
          clientRequest: {
            resourceExpiredHour: 24,
            scene: 0,
          },
        }),
      });

      const acquireData = await acquireResponse.json();
      console.log('Acquire response:', acquireData);
      
      if (!acquireData.resourceId) {
        throw new Error('Failed to acquire resource ID');
      }

      const resourceId = acquireData.resourceId;

      // Start recording
      const startResponse = await fetch(`${baseUrl}/resourceid/${resourceId}/mode/mix/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid.toString(),
          clientRequest: {
            recordingConfig: {
              channelType: 0,
              streamTypes: 2, // Audio and video
              maxIdleTime: 30,
              transcodingConfig: {
                width: 1920,
                height: 1080,
                fps: 30,
                bitrate: 2000,
                mixedVideoLayout: 1,
              },
            },
            storageConfig: {
              vendor: 1, // Agora storage
              region: 0,
            },
          },
        }),
      });

      const startData = await startResponse.json();
      console.log('Start recording response:', startData);

      if (!startData.sid) {
        throw new Error('Failed to start recording');
      }

      // Store recording metadata
      await supabase.from('class_recordings').insert({
        class_id: classId,
        recording_url: `pending_${startData.sid}`,
        ai_timestamps: { resourceId, sid: startData.sid },
      });

      return new Response(
        JSON.stringify({
          success: true,
          resourceId,
          sid: startData.sid,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'stop') {
      const { resourceId, sid } = await req.json();

      const stopResponse = await fetch(`${baseUrl}/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cname: channelName,
          uid: uid.toString(),
          clientRequest: {},
        }),
      });

      const stopData = await stopResponse.json();
      console.log('Stop recording response:', stopData);

      // The recording file info from Agora
      const fileList = stopData.serverResponse?.fileList || [];
      let recordingUrl = 'https://agora-recording-files.s3.amazonaws.com/';
      
      if (fileList.length > 0) {
        // Construct the recording URL from Agora's response
        const fileName = fileList[0].fileName;
        recordingUrl = `https://download.agora.io/recording/${appId}/${channelName}/${fileName}`;
      } else {
        recordingUrl = `processing_${sid}`;
      }
      
      // Update recording with actual URL
      await supabase
        .from('class_recordings')
        .update({ 
          recording_url: recordingUrl,
          duration: stopData.serverResponse?.uploadingStatus === 'uploaded' 
            ? Math.round((new Date().getTime() - new Date(stopData.serverResponse?.startTime || Date.now()).getTime()) / 1000)
            : null
        })
        .eq('class_id', classId)
        .like('recording_url', `pending_${sid}`);

      return new Response(
        JSON.stringify({ success: true, recordingUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
