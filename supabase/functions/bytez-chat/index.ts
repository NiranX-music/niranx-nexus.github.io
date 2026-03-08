import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map Bytez model IDs to Lovable AI models
function mapToLovableModel(bytezModel: string): string {
  const modelMap: Record<string, string> = {
    'meta-llama/Llama-3.2-3B-Instruct': 'google/gemini-2.5-flash-lite',
    'meta-llama/Llama-3.1-8B-Instruct': 'google/gemini-2.5-flash',
    'meta-llama/Llama-3.1-70B-Instruct': 'google/gemini-2.5-pro',
    'microsoft/Phi-3-mini-4k-instruct': 'google/gemini-2.5-flash-lite',
    'Qwen/Qwen2.5-7B': 'google/gemini-2.5-flash',
  };
  return modelMap[bytezModel] || 'google/gemini-3-flash-preview';
}

async function callBytezAPI(messages: any[], model: string, stream: boolean, apiKey: string) {
  const formattedMessages = messages.map((msg: any) => {
    if (msg.attachments && msg.attachments.length > 0) {
      const content: any[] = [];
      if (msg.content) {
        content.push({ type: 'text', text: msg.content });
      }
      for (const attachment of msg.attachments) {
        if (attachment.type === 'image') {
          content.push({
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${attachment.data}` }
          });
        } else if (attachment.type === 'document') {
          content.push({
            type: 'text',
            text: `[Document: ${attachment.name}]\n${attachment.data || ''}`
          });
        }
      }
      return { role: msg.role, content };
    }
    return { role: msg.role, content: msg.content };
  });

  const response = await fetch('https://api.bytez.com/models/v2/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
    throw new Error(`BYTEZ API error: ${response.status} - ${errorText}`);
  }

  return response;
}

async function callLovableAI(messages: any[], model: string, stream: boolean) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

  const lovableModel = mapToLovableModel(model);
  console.log('Falling back to Lovable AI with model:', lovableModel);

  const formattedMessages = messages.map((msg: any) => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
  }));

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: lovableModel,
      messages: [
        { role: 'system', content: `You are ${model}, a helpful AI assistant. Respond naturally and helpfully.` },
        ...formattedMessages,
      ],
      max_tokens: 4096,
      stream,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add funds.');
    }
    const errorText = await response.text();
    throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
  }

  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = 'meta-llama/Llama-3.2-3B-Instruct', stream = false } = await req.json();
    console.log('XNexus Chat request:', { model, messageCount: messages?.length, stream });

    let response: Response;
    let usedFallback = false;

    // Try Bytez first
    const BYTEZ_API_KEY = Deno.env.get('BYTEZ_API_KEY');
    if (BYTEZ_API_KEY) {
      try {
        response = await callBytezAPI(messages, model, stream, BYTEZ_API_KEY);
      } catch (bytezError) {
        console.warn('Bytez API failed, falling back to Lovable AI:', bytezError);
        response = await callLovableAI(messages, model, stream);
        usedFallback = true;
      }
    } else {
      console.log('No BYTEZ_API_KEY, using Lovable AI directly');
      response = await callLovableAI(messages, model, stream);
      usedFallback = true;
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
        },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.message || 'No response generated';

    return new Response(JSON.stringify({
      content,
      model: usedFallback ? `${model} (via Lovable AI)` : data.model,
      usage: data.usage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('XNexus chat error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
