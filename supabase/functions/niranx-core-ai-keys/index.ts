// Management API for NiranX Core AI keys (create / revoke / rotate)
// Authenticated as the user via Bearer JWT.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function genKey() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `nxai_${b64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceKey);

  try {
    if (req.method === "GET") {
      const { data, error } = await admin
        .from("niranx_core_ai_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ keys: data });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const keyName = (body.key_name || "NiranX Core AI Key").toString().slice(0, 80);
      const apiKey = genKey();
      const prefix = apiKey.slice(0, 12);

      const { data, error } = await admin
        .from("niranx_core_ai_keys")
        .insert({
          user_id: user.id,
          key_name: keyName,
          api_key: apiKey,
          key_prefix: prefix,
        })
        .select()
        .single();
      if (error) throw error;
      return json({ key: data, secret: apiKey });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const keyId = url.searchParams.get("id");
      if (!keyId) return json({ error: "Missing id" }, 400);
      const { error } = await admin
        .from("niranx_core_ai_keys")
        .delete()
        .eq("id", keyId)
        .eq("user_id", user.id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e: any) {
    return json({ error: e?.message ?? "Failed" }, 500);
  }
});
