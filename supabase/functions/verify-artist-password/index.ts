import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function hashPassword(
  password: string,
  salt?: string,
): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const actualSalt = salt ||
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const data = encoder.encode(password + actualSalt);
  let hashBuffer = await crypto.subtle.digest("SHA-256", data);
  for (let i = 0; i < 999; i++) {
    hashBuffer = await crypto.subtle.digest("SHA-256", hashBuffer);
  }
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { hash: `${actualSalt}:${hashHex}`, salt: actualSalt };
}

async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const [salt, expectedHash] = storedHash.split(":");
    if (!salt || !expectedHash) return false;
    const { hash } = await hashPassword(password, salt);
    const [, computedHash] = hash.split(":");
    return computedHash === expectedHash;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artistId, password } = await req.json();
    if (!artistId || !password) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase
      .from("artists")
      .select("password_hash, studio_enabled")
      .eq("id", artistId)
      .maybeSingle();

    if (error || !data?.password_hash) {
      return new Response(
        JSON.stringify({ valid: false, error: "Studio not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (data.studio_enabled === false) {
      return new Response(
        JSON.stringify({ valid: false, error: "Studio disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const valid = await verifyPassword(password, data.password_hash);
    return new Response(
      JSON.stringify({ valid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
