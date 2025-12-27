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
    const BYTEZ_API_KEY = Deno.env.get('BYTEZ_API_KEY');
    if (!BYTEZ_API_KEY) {
      throw new Error('BYTEZ_API_KEY is not configured');
    }

    const { messages, model = 'Qwen/Qwen2.5-VL-7B-Instruct', stream = false } = await req.json();

    console.log('BYTEZ Chat request:', { model, messageCount: messages?.length, stream });

    // Format messages for BYTEZ API (OpenAI-compatible format)
    const formattedMessages = messages.map((msg: any) => {
      if (msg.attachments && msg.attachments.length > 0) {
        // Handle multimodal messages with attachments
        const content: any[] = [];
        
        // Add text content first
        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }
        
        // Add image/document attachments
        for (const attachment of msg.attachments) {
          if (attachment.type === 'image') {
            content.push({
              type: 'image_url',
              image_url: { url: attachment.url }
            });
          } else if (attachment.type === 'document') {
            // For documents, include the text content
            content.push({
              type: 'text',
              text: `[Document: ${attachment.name}]\n${attachment.content || ''}`
            });
          }
        }
        
        return { role: msg.role, content };
      }
      
      return { role: msg.role, content: msg.content };
    });

    // Call BYTEZ API (OpenAI-compatible endpoint)
    const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': BYTEZ_API_KEY,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        max_tokens: 4096,
        temperature: 0.7,
        stream,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BYTEZ API Error:', response.status, errorText);
      throw new Error(`BYTEZ API error: ${response.status} - ${errorText}`);
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
        },
      });
    }

    const data = await response.json();
    console.log('BYTEZ response received successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('BYTEZ chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
