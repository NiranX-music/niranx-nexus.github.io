import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
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
  email_id?: string; // Reference to the niranx_emails record
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
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

    const resend = new Resend(RESEND_API_KEY);

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
      {
        global: { headers: { Authorization: authHeader } },
      }
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

    // Validate required fields
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
      `Sending email from ${from_address} to ${externalAddresses.join(", ")}`
    );

    // Prepare email options
    const emailOptions: any = {
      from: `NiranX Mail <noreply@niranx.com>`, // Use verified domain
      to: externalAddresses,
      subject: subject || "(No Subject)",
      text: body || "",
      reply_to: from_address, // Allow replies to go to the sender
    };

    // Add HTML body if provided
    if (html_body) {
      emailOptions.html = html_body;
    } else if (body) {
      // Convert plain text to simple HTML
      emailOptions.html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
          <div style="white-space: pre-wrap;">${body.replace(/\n/g, "<br>")}</div>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;">
          <p style="color: #666; font-size: 12px;">
            Sent via <a href="https://niranx.com" style="color: #0066cc;">NiranX Mail</a>
          </p>
        </div>
      `;
    }

    // Add CC if provided
    if (cc_addresses && cc_addresses.length > 0) {
      const externalCC = cc_addresses.filter(
        (addr) => !addr.toLowerCase().endsWith("@niranx.com")
      );
      if (externalCC.length > 0) {
        emailOptions.cc = externalCC;
      }
    }

    // Add priority header
    if (priority === "high") {
      emailOptions.headers = {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      };
    } else if (priority === "low") {
      emailOptions.headers = {
        "X-Priority": "5",
        "X-MSMail-Priority": "Low",
        Importance: "low",
      };
    }

    // Send the email
    const { data: emailResponse, error: sendError } =
      await resend.emails.send(emailOptions);

    if (sendError) {
      console.error("Resend API error:", sendError);
      return new Response(
        JSON.stringify({
          success: false,
          error: sendError.message || "Failed to send email",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Email sent successfully:", emailResponse);

    // Update the email record with external message ID if email_id provided
    if (email_id && emailResponse?.id) {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await serviceClient
        .from("niranx_emails")
        .update({
          external_message_id: emailResponse.id,
          is_external: true,
        })
        .eq("id", email_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${externalAddresses.length} external recipient(s)`,
        sent_to: externalAddresses,
        message_id: emailResponse?.id,
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
