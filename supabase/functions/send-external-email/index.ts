import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendEmailRequest {
  from_address: string;
  to_addresses: string[];
  cc_addresses?: string[];
  subject: string;
  body: string;
  html_body?: string;
  reply_to?: string;
  priority?: string;
  email_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAILEROO_API_KEY = Deno.env.get("MAILEROO_API_KEY");

    if (!MAILEROO_API_KEY) {
      console.error("MAILEROO_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service not configured. Please contact support.",
          fallback: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestData: SendEmailRequest = await req.json();
    const {
      from_address,
      to_addresses,
      cc_addresses,
      subject,
      body,
      html_body,
      reply_to,
      priority,
      email_id,
    } = requestData;

    if (!from_address || !to_addresses || to_addresses.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: from_address and to_addresses",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Filter external addresses (non-niranx.com)
    const externalAddresses = to_addresses.filter(
      (addr) => !addr.toLowerCase().endsWith("@niranx.com")
    );

    if (externalAddresses.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No external addresses to send to",
          sent_to: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `Sending email via Maileroo from ${from_address} to ${externalAddresses.join(", ")}`
    );

    // Build HTML body
    const emailHtml = html_body || (body
      ? `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
          <div style="white-space: pre-wrap;">${body.replace(/\n/g, "<br>")}</div>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;">
          <p style="color: #666; font-size: 12px;">Sent via <a href="https://niranx.com" style="color: #0066cc;">NiranX Mail</a></p>
        </div>`
      : "");

    // Build Maileroo API payload
    const fromEmail = Deno.env.get("MAILEROO_FROM_EMAIL") || from_address;

    const formData = new FormData();
    formData.append("from", fromEmail);
    formData.append("to", externalAddresses.join(","));
    formData.append("subject", subject || "(No Subject)");
    formData.append("plain", body || "");
    formData.append("html", emailHtml);

    if (reply_to || from_address) {
      formData.append("reply_to", reply_to || from_address);
    }

    if (cc_addresses && cc_addresses.length > 0) {
      const externalCC = cc_addresses.filter(
        (addr) => !addr.toLowerCase().endsWith("@niranx.com")
      );
      if (externalCC.length > 0) {
        formData.append("cc", externalCC.join(","));
      }
    }

    // Send via Maileroo API
    const response = await fetch("https://smtp.maileroo.com/send", {
      method: "POST",
      headers: {
        "X-API-Key": MAILEROO_API_KEY,
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Maileroo API error:", responseData);
      return new Response(
        JSON.stringify({
          success: false,
          error: responseData.message || "Failed to send email via Maileroo",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Email sent successfully via Maileroo:", responseData);

    // Update email record if email_id provided
    if (email_id && responseData?.data?.message_id) {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await serviceClient
        .from("niranx_emails")
        .update({
          external_message_id: responseData.data.message_id,
          is_external: true,
        })
        .eq("id", email_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${externalAddresses.length} external recipient(s)`,
        sent_to: externalAddresses,
        message_id: responseData?.data?.message_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-external-email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
