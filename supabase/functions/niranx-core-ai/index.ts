import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SCITELY_BASE = "https://api.scitely.com/v1";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logUsage(
  supabase: ReturnType<typeof createClient>,
  params: {
    keyId: string;
    userId: string;
    endpoint: string;
    model?: string;
    requestType: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    responseTimeMs: number;
    statusCode: number;
    errorMessage?: string;
    ipAddress?: string;
  }
) {
  try {
    await supabase.from("niranx_core_ai_logs").insert({
      api_key_id: params.keyId,
      user_id: params.userId,
      endpoint: params.endpoint,
      model: params.model,
      request_type: params.requestType,
      prompt_tokens: params.promptTokens ?? 0,
      completion_tokens: params.completionTokens ?? 0,
      total_tokens: params.totalTokens ?? 0,
      response_time_ms: params.responseTimeMs,
      status_code: params.statusCode,
      error_message: params.errorMessage,
      ip_address: params.ipAddress,
    });
    if (params.totalTokens && params.totalTokens > 0) {
      await supabase.rpc("validate_niranx_core_ai_key", { p_api_key: "noop" }).then(() => {});
      await supabase
        .from("niranx_core_ai_keys")
        .update({ total_tokens: params.totalTokens })
        .eq("id", params.keyId);
    }
  } catch (e) {
    console.error("logUsage failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  // Path shape received here: /niranx-core-ai/<endpoint...>
  // The user-facing URL will be {app}/ai/u/<endpoint> rewritten via vite proxy or direct call
  const parts = url.pathname.split("/").filter(Boolean);
  // Drop function name segment if present
  const functionIdx = parts.indexOf("niranx-core-ai");
  const endpointParts = functionIdx >= 0 ? parts.slice(functionIdx + 1) : parts;
  const endpoint = "/" + endpointParts.join("/");

  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  // Public health/status endpoint
  if (endpoint === "/status" || endpoint === "/" || endpoint === "") {
    return json({
      service: "NiranX Core AI",
      version: "1.0.0",
      status: "operational",
      provider: "Scitely",
      endpoints: {
        chat: "POST /chat/completions",
        image: "POST /images/generations",
        models: "GET /models",
        status: "GET /status",
      },
      auth: "Send your API key as `x-api-key: nxai_...` header",
    });
  }

  if (!apiKey) {
    return json({ error: "Missing API key. Send `x-api-key` header." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Validate key
  const { data: keyData, error: keyError } = await supabase.rpc("validate_niranx_core_ai_key", {
    p_api_key: apiKey,
  });
  if (keyError || !keyData || keyData.length === 0) {
    return json({ error: "Invalid or expired API key" }, 401);
  }
  const { key_id: keyId, key_user_id: userId, monthly_quota: monthlyQuota, current_month_requests: monthRequests } = keyData[0];

  // Quota enforcement
  if (Number(monthRequests) >= Number(monthlyQuota)) {
    await logUsage(supabase, {
      keyId, userId, endpoint, requestType: "quota_block",
      responseTimeMs: Date.now() - startTime, statusCode: 429,
      errorMessage: "Monthly quota exceeded", ipAddress,
    });
    return json({
      error: "Monthly quota exceeded",
      quota: monthlyQuota,
      used: Number(monthRequests),
    }, 429);
  }

  const SCITELY_API_KEY = Deno.env.get("SCITELY_API_KEY");
  if (!SCITELY_API_KEY) {
    return json({ error: "Provider not configured" }, 500);
  }

  // Models list
  if (endpoint === "/models" && req.method === "GET") {
    const models = [
      { id: "deepseek-v3.2", name: "DeepSeek V3.2", type: "chat", context: 128000 },
      { id: "gpt-4o", name: "GPT-4o", type: "chat", context: 128000 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", type: "chat", context: 128000 },
      { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", type: "chat", context: 200000 },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", type: "chat", context: 1000000 },
      { id: "llama-3.3-70b", name: "Llama 3.3 70B", type: "chat", context: 128000 },
      { id: "flux", name: "FLUX", type: "image" },
      { id: "dall-e-3", name: "DALL-E 3", type: "image" },
    ];
    await logUsage(supabase, {
      keyId, userId, endpoint, requestType: "models",
      responseTimeMs: Date.now() - startTime, statusCode: 200, ipAddress,
    });
    return json({ data: models });
  }

  // Chat completions
  if (endpoint === "/chat/completions" && req.method === "POST") {
    let body: any;
    try { body = await req.json(); } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    const { model = "deepseek-v3.2", messages, stream = false, temperature, max_tokens } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "`messages` array required" }, 400);
    }

    try {
      const upstreamRes = await fetch(`${SCITELY_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SCITELY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, stream, temperature, max_tokens: max_tokens ?? 4000 }),
      });

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        await logUsage(supabase, {
          keyId, userId, endpoint, model, requestType: "chat",
          responseTimeMs: Date.now() - startTime, statusCode: upstreamRes.status,
          errorMessage: errText.slice(0, 500), ipAddress,
        });
        return json({ error: "Upstream error", status: upstreamRes.status, detail: errText.slice(0, 200) }, upstreamRes.status);
      }

      if (stream) {
        // Stream pass-through (no token counting for streamed)
        await logUsage(supabase, {
          keyId, userId, endpoint, model, requestType: "chat_stream",
          responseTimeMs: Date.now() - startTime, statusCode: 200, ipAddress,
        });
        return new Response(upstreamRes.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      }

      const data = await upstreamRes.json();
      const usage = data?.usage || {};
      await logUsage(supabase, {
        keyId, userId, endpoint, model, requestType: "chat",
        promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        responseTimeMs: Date.now() - startTime, statusCode: 200, ipAddress,
      });
      return json(data);
    } catch (e: any) {
      await logUsage(supabase, {
        keyId, userId, endpoint, model, requestType: "chat",
        responseTimeMs: Date.now() - startTime, statusCode: 500,
        errorMessage: e?.message?.slice(0, 500), ipAddress,
      });
      return json({ error: "Request failed", detail: e?.message }, 500);
    }
  }

  // Image generation
  if (endpoint === "/images/generations" && req.method === "POST") {
    let body: any;
    try { body = await req.json(); } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    const { model = "flux", prompt, size = "1024x1024", n = 1 } = body;
    if (!prompt) return json({ error: "`prompt` is required" }, 400);

    try {
      const upstreamRes = await fetch(`${SCITELY_BASE}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SCITELY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, prompt, size, n }),
      });

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        await logUsage(supabase, {
          keyId, userId, endpoint, model, requestType: "image",
          responseTimeMs: Date.now() - startTime, statusCode: upstreamRes.status,
          errorMessage: errText.slice(0, 500), ipAddress,
        });
        return json({ error: "Upstream error", status: upstreamRes.status, detail: errText.slice(0, 200) }, upstreamRes.status);
      }

      const data = await upstreamRes.json();
      await logUsage(supabase, {
        keyId, userId, endpoint, model, requestType: "image",
        responseTimeMs: Date.now() - startTime, statusCode: 200, ipAddress,
      });
      return json(data);
    } catch (e: any) {
      await logUsage(supabase, {
        keyId, userId, endpoint, model, requestType: "image",
        responseTimeMs: Date.now() - startTime, statusCode: 500,
        errorMessage: e?.message?.slice(0, 500), ipAddress,
      });
      return json({ error: "Request failed", detail: e?.message }, 500);
    }
  }

  return json({ error: `Unknown endpoint: ${endpoint}`, hint: "See GET /status for available endpoints" }, 404);
});
