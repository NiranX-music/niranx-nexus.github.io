import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Webhook secret for signature verification
const WEBHOOK_SECRET = Deno.env.get("EMAIL_WEBHOOK_SECRET");

// HMAC-SHA256 signature verification
async function verifyWebhookSignature(
  signature: string | null,
  body: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Handle different signature formats (with or without prefix)
    const cleanSignature = signature.replace(/^(sha256=|v1=)/, '').toLowerCase();
    return computedSignature === cleanSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Simple rate limiting using in-memory store (per-invocation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Input validation for email fields
function validateEmailInput(data: any): { valid: boolean; error?: string } {
  if (!data.from || typeof data.from !== 'string') {
    return { valid: false, error: "Invalid 'from' field" };
  }
  
  if (!data.to) {
    return { valid: false, error: "Invalid 'to' field" };
  }
  
  // Validate subject length
  if (data.subject && data.subject.length > 998) {
    return { valid: false, error: "Subject too long" };
  }
  
  // Validate body length (10MB max)
  const bodyLength = (data.text?.length || 0) + (data.html?.length || 0);
  if (bodyLength > 10 * 1024 * 1024) {
    return { valid: false, error: "Email body too large" };
  }
  
  return { valid: true };
}

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

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("cf-connecting-ip") || 
                   "unknown";
  
  // Check rate limit (60 requests per minute per IP)
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ success: false, error: "Rate limit exceeded" }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get raw body for signature verification
  const rawBody = await req.text();
  
  // Verify webhook signature if secret is configured
  if (WEBHOOK_SECRET) {
    const signature = req.headers.get("X-Webhook-Signature") || 
                      req.headers.get("X-Mailgun-Signature") ||
                      req.headers.get("X-SendGrid-Signature");
    
    const isValid = await verifyWebhookSignature(signature, rawBody, WEBHOOK_SECRET);
    
    if (!isValid) {
      console.log("Invalid webhook signature - rejecting request");
      await supabase.from("niranx_webhook_logs").insert({
        webhook_type: "inbound_email",
        status: "rejected",
        error_message: "Invalid webhook signature",
      });
      
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } else {
    console.warn("EMAIL_WEBHOOK_SECRET not configured - webhook signature verification disabled");
  }

  try {
    let emailData: InboundEmail;
    
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      emailData = JSON.parse(rawBody);
    } else if (contentType.includes("multipart/form-data")) {
      // Handle SendGrid/Mailgun multipart format - need to re-parse
      const formData = await new Request(req.url, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: rawBody
      }).formData();
      
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
      try {
        emailData = JSON.parse(rawBody);
      } catch {
        throw new Error("Unsupported content type: " + contentType);
      }
    }
    
    // Validate input
    const validation = validateEmailInput(emailData);
    if (!validation.valid) {
      console.log("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
