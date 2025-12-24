import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple but secure password hashing using Web Crypto API
async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  
  // Generate salt if not provided
  const saltBytes = salt 
    ? Uint8Array.from(atob(salt), c => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));
  
  // Derive key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltBase64 = btoa(String.fromCharCode(...saltBytes));
  
  return {
    hash: `${saltBase64}:${hashHex}`,
    salt: saltBase64
  };
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, expectedHash] = storedHash.split(':');
    if (!salt || !expectedHash) return false;
    
    const { hash } = await hashPassword(password, salt);
    const [, computedHash] = hash.split(':');
    
    return computedHash === expectedHash;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, password, storedHash } = await req.json();
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: "Action is required (hash or verify)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "hash") {
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Password is required for hashing" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const { hash } = await hashPassword(password);
      console.log("Password hashed successfully");
      
      return new Response(
        JSON.stringify({ hash }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "verify") {
      if (!password || !storedHash) {
        return new Response(
          JSON.stringify({ error: "Password and storedHash are required for verification" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const isValid = await verifyPassword(password, storedHash);
      console.log("Password verification completed:", isValid ? "valid" : "invalid");
      
      return new Response(
        JSON.stringify({ isValid }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'hash' or 'verify'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: any) {
    console.error("Error in hash-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});