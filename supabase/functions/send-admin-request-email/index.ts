import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminRequestEmailData {
  fullName: string;
  email: string;
  reason: string;
  requestId: string;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { fullName, email, reason, requestId }: AdminRequestEmailData = await req.json();

    const safeName = escapeHtml(fullName || '');
    const safeEmail = escapeHtml(email || '');
    const safeReason = escapeHtml(reason || '');
    const safeRequestId = escapeHtml(requestId || '');

    const emailResponse = await resend.emails.send({
      from: "Study Platform <onboarding@resend.dev>",
      to: ["barhateniranjan725@gmail.com"],
      subject: "New Admin Access Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Admin Request</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Admin Access Request Details</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${safeName}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${safeEmail}</p>
              <p style="margin: 10px 0;"><strong>Request ID:</strong> ${safeRequestId}</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Reason for Request:</h3>
              <p style="color: #4b5563; line-height: 1.6;">${safeReason}</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Admin request email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-admin-request-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
