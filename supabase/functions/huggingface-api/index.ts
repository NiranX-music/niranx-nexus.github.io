import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    if (!HF_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY is not configured");
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
    const { action, model, inputs, parameters } = body;

    if (action === "search-models") {
      const search = inputs || "";
      const filter = parameters?.filter || "";
      let url = `https://huggingface.co/api/models?search=${encodeURIComponent(search)}&limit=20&sort=downloads&direction=-1`;
      if (filter) url += `&filter=${encodeURIComponent(filter)}`;
      
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "inference") {
      const modelId = model || "google/flan-t5-base";
      const url = `https://api-inference.huggingface.co/models/${modelId}`;

      const payload: any = { inputs };
      if (parameters) payload.parameters = parameters;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("HF inference error:", resp.status, errText);
        return new Response(JSON.stringify({ error: errText }), {
          status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const contentType = resp.headers.get("content-type") || "";
      
      // Image generation returns binary
      if (contentType.includes("image")) {
        const arrayBuffer = await resp.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        return new Response(JSON.stringify({ image: `data:${contentType};base64,${base64}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "chat") {
      const modelId = model || "HuggingFaceH4/zephyr-7b-beta";
      const url = `https://api-inference.huggingface.co/models/${modelId}/v1/chat/completions`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: inputs,
          max_tokens: parameters?.max_tokens || 1024,
          stream: false,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("HF chat error:", resp.status, errText);
        
        // Fallback to Lovable AI
        console.log("Falling back to Lovable AI...");
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          const fallbackResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: inputs,
              max_tokens: parameters?.max_tokens || 1024,
            }),
          });
          if (fallbackResp.ok) {
            const data = await fallbackResp.json();
            return new Response(JSON.stringify({ ...data, fallback: true, fallback_model: "gemini-3-flash" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        
        return new Response(JSON.stringify({ error: errText }), {
          status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: search-models, inference, chat" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("HuggingFace API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
