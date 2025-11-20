import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminDecisionRequest {
  email: string;
  fullName: string;
  status: 'approved' | 'rejected';
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, status, reason }: AdminDecisionRequest = await req.json();

    console.log("Sending admin decision email:", { email, fullName, status });

    const subject = status === 'approved' 
      ? "Admin Request Approved - NiranX StudyVerse" 
      : "Admin Request Update - NiranX StudyVerse";

    const message = status === 'approved'
      ? `
        <h2>Great News, ${fullName}! 🎉</h2>
        <p>Your admin request has been <strong>approved</strong>.</p>
        <p>You now have admin privileges on NiranX StudyVerse. You can access the Admin Dashboard to manage users, feedback, and platform statistics.</p>
        <p>Please use your new privileges responsibly.</p>
        <p>Best regards,<br/>The NiranX Team</p>
      `
      : `
        <h2>Admin Request Update</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for your interest in becoming an admin on NiranX StudyVerse.</p>
        <p>After careful review, we have decided not to approve your admin request at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have any questions or would like to discuss this decision, please feel free to reach out.</p>
        <p>Best regards,<br/>The NiranX Team</p>
      `;

    const emailResponse = await resend.emails.send({
      from: "NiranX StudyVerse <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: message,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-decision-email function:", error);
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
