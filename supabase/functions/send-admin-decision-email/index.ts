import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

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

    const { email, fullName, status, reason }: AdminDecisionRequest = await req.json();

    const safeName = escapeHtml(fullName || '');
    const safeReason = reason ? escapeHtml(reason) : '';

    console.log("Sending admin decision email:", { email, fullName: safeName, status });

    const subject = status === 'approved' 
      ? "Admin Request Approved - NiranX StudyVerse" 
      : "Admin Request Update - NiranX StudyVerse";

    const message = status === 'approved'
      ? `
        <h2>Great News, ${safeName}! 🎉</h2>
        <p>Your admin request has been <strong>approved</strong>.</p>
        <p>You now have admin privileges on NiranX StudyVerse.</p>
        <p>Best regards,<br/>The NiranX Team</p>
      `
      : `
        <h2>Admin Request Update</h2>
        <p>Dear ${safeName},</p>
        <p>After careful review, we have decided not to approve your admin request at this time.</p>
        ${safeReason ? `<p><strong>Reason:</strong> ${safeReason}</p>` : ''}
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
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-decision-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
