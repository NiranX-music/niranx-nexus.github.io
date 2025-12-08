import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InboundEmail {
  from: string;
  to: string | string[];
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  messageId?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
  spamScore?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let emailData: InboundEmail;
    
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      emailData = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      // Handle SendGrid/Mailgun multipart format
      const formData = await req.formData();
      emailData = {
        from: formData.get("from") as string || formData.get("sender") as string || "",
        to: formData.get("to") as string || formData.get("recipient") as string || "",
        cc: formData.get("cc") as string || undefined,
        subject: formData.get("subject") as string || "(No Subject)",
        text: formData.get("text") as string || formData.get("body-plain") as string || "",
        html: formData.get("html") as string || formData.get("body-html") as string || "",
        messageId: formData.get("Message-Id") as string || formData.get("message-id") as string,
        spamScore: parseFloat(formData.get("spam_score") as string || "0"),
      };
    } else {
      // Try parsing as JSON anyway
      const text = await req.text();
      try {
        emailData = JSON.parse(text);
      } catch {
        throw new Error("Unsupported content type: " + contentType);
      }
    }

    // Log the webhook
    await supabase.from("niranx_webhook_logs").insert({
      webhook_type: "inbound_email",
      payload: emailData as any,
      status: "processing",
    });

    // Extract recipient email addresses
    const toAddresses = Array.isArray(emailData.to) 
      ? emailData.to 
      : emailData.to.split(",").map((e: string) => e.trim());
    
    // Find matching Xmail mailboxes
    const xmailAddresses = toAddresses.filter((addr: string) => 
      addr.toLowerCase().includes("@niranx.com")
    );

    if (xmailAddresses.length === 0) {
      console.log("No @niranx.com addresses found in recipients");
      return new Response(
        JSON.stringify({ success: false, message: "No valid Xmail recipients" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process each recipient
    const results = [];
    for (const toAddress of xmailAddresses) {
      // Extract just the email part
      const emailMatch = toAddress.match(/<([^>]+)>/) || [null, toAddress];
      const cleanEmail = (emailMatch[1] || toAddress).toLowerCase().trim();
      
      // Find the mailbox
      const { data: mailbox, error: mailboxError } = await supabase
        .from("niranx_mailboxes")
        .select("id, user_id")
        .eq("email_address", cleanEmail)
        .single();

      if (mailboxError || !mailbox) {
        console.log(`Mailbox not found for ${cleanEmail}`);
        results.push({ email: cleanEmail, status: "mailbox_not_found" });
        continue;
      }

      // Extract sender email
      const fromMatch = emailData.from.match(/<([^>]+)>/) || [null, emailData.from];
      const fromEmail = (fromMatch[1] || emailData.from).trim();

      // Check if sender is blocked
      const { data: blocked } = await supabase
        .from("niranx_blocked_senders")
        .select("id")
        .eq("mailbox_id", mailbox.id)
        .eq("sender_address", fromEmail.toLowerCase())
        .single();

      if (blocked) {
        console.log(`Sender ${fromEmail} is blocked for ${cleanEmail}`);
        results.push({ email: cleanEmail, status: "sender_blocked" });
        continue;
      }

      // Generate unique slug for the email
      const slug = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

      // Create the email
      const { data: newEmail, error: insertError } = await supabase
        .from("niranx_emails")
        .insert({
          mailbox_id: mailbox.id,
          from_address: emailData.from,
          to_addresses: [cleanEmail],
          cc_addresses: emailData.cc ? emailData.cc.split(",").map((e: string) => e.trim()) : [],
          subject: emailData.subject || "(No Subject)",
          body: emailData.text || "",
          html_body: emailData.html || emailData.text || "",
          is_read: false,
          is_sent: false,
          folder: (emailData.spamScore || 0) > 5 ? "spam" : "inbox",
          is_spam: (emailData.spamScore || 0) > 5,
          is_external: true,
          external_message_id: emailData.messageId,
          external_headers: emailData.headers || {},
          spam_score: emailData.spamScore || 0,
          slug: slug,
          attachments: emailData.attachments || [],
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting email:", insertError);
        results.push({ email: cleanEmail, status: "insert_error", error: insertError.message });
        continue;
      }

      // Create notification for the user
      await supabase.from("notifications").insert({
        user_id: mailbox.user_id,
        type: "email",
        title: "New Email",
        message: `New email from ${emailData.from}: ${emailData.subject}`,
        data: { email_id: newEmail.id, from: emailData.from },
      });

      results.push({ email: cleanEmail, status: "delivered", email_id: newEmail.id });
    }

    // Update webhook log
    await supabase
      .from("niranx_webhook_logs")
      .update({ status: "completed", payload: { ...emailData, results } })
      .eq("webhook_type", "inbound_email")
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing inbound email:", error);
    
    // Log error
    await supabase.from("niranx_webhook_logs").insert({
      webhook_type: "inbound_email",
      status: "error",
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
