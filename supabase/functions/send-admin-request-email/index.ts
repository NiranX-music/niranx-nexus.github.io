import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, reason, requestId }: AdminRequestEmailData = await req.json();

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
              <p style="margin: 10px 0;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Request ID:</strong> ${requestId}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Reason for Request:</h3>
              <p style="color: #4b5563; line-height: 1.6;">${reason}</p>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://tophenwypevlfbznlwil.lovable.app/niranx/admin" 
                 style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Review Request in Admin Dashboard
              </a>
            </div>

            <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Action Required:</strong> Please review this request in your admin dashboard and approve or reject accordingly.
              </p>
            </div>
          </div>
          <div style="background: #e5e7eb; padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 Study Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Admin request email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-admin-request-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
