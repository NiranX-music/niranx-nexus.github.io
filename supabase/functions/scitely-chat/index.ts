import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCITELY_BASE = "https://api.scitely.com/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SCITELY_API_KEY = Deno.env.get("SCITELY_API_KEY");
    if (!SCITELY_API_KEY) {
      throw new Error("SCITELY_API_KEY is not configured");
    }

    // Auth check
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { type, messages, model, stream, prompt, size, imageUrl } = body;

    if (type === "image") {
      // Image generation
      const res = await fetch(`${SCITELY_BASE}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SCITELY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "flux",
          prompt,
          size: size || "1024x1024",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Scitely image error:", res.status, errText);
        return new Response(JSON.stringify({ error: `Image generation failed: ${res.status}` }), {
          status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Chat completions (default)
    const shouldStream = stream !== false;

    const chatMessages = [];
    
    // Handle vision/multimodal - if imageUrl provided, format content array
    if (imageUrl && messages?.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const formattedMessages = [
        ...messages.slice(0, -1),
        {
          role: lastMsg.role,
          content: [
            { type: "text", text: lastMsg.content },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ];
      chatMessages.push(...formattedMessages);
    } else {
      chatMessages.push(...(messages || []));
    }

    const res = await fetch(`${SCITELY_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SCITELY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "deepseek-v3.2",
        messages: chatMessages,
        stream: shouldStream,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Scitely chat error:", res.status, errText);
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Scitely API error: ${res.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (shouldStream) {
      return new Response(res.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Scitely error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
