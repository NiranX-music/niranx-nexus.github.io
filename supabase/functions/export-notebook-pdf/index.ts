import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML escape function to prevent XSS
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return text.replace(/[&<>"'`=/]/g, (match) => htmlEscapes[match] || match);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { entryId } = await req.json();

    // Validate entryId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!entryId || !uuidRegex.test(entryId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid entry ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the notebook entry
    const { data: entry, error } = await supabaseClient
      .from('lab_notebook_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error) throw error;

    // Sanitize all user-controlled content
    const safeExperimentName = escapeHtml(entry.experiment_name);
    const safeLabType = escapeHtml(entry.lab_type);
    const safeObservations = escapeHtml(entry.observations);
    const safeResults = escapeHtml(entry.results);
    const safeData = entry.data ? escapeHtml(JSON.stringify(entry.data, null, 2)) : null;

    // Generate HTML content for PDF with sanitized data
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline';">
          <title>Lab Notebook - ${safeExperimentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              color: #333;
            }
            h1 {
              color: #2563eb;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
            }
            h2 {
              color: #4b5563;
              margin-top: 30px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .meta {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .section {
              margin: 20px 0;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
            }
            .data-table th {
              background: #f3f4f6;
              font-weight: bold;
            }
            pre {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 15px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <h1>Lab Notebook Entry</h1>
          
          <div class="meta">
            <p><strong>Experiment:</strong> ${safeExperimentName}</p>
            <p><strong>Lab Type:</strong> ${safeLabType.charAt(0).toUpperCase() + safeLabType.slice(1)}</p>
            <p><strong>Date:</strong> ${new Date(entry.created_at).toLocaleDateString()}</p>
          </div>

          ${safeObservations ? `
            <div class="section">
              <h2>Observations</h2>
              <p>${safeObservations}</p>
            </div>
          ` : ''}

          ${safeResults ? `
            <div class="section">
              <h2>Results</h2>
              <p>${safeResults}</p>
            </div>
          ` : ''}

          ${safeData ? `
            <div class="section">
              <h2>Experimental Data</h2>
              <pre>${safeData}</pre>
            </div>
          ` : ''}

          <div class="section" style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="text-align: center; color: #6b7280; font-size: 12px;">
              Generated from NiranX StudyVerse Virtual Labs
            </p>
          </div>
        </body>
      </html>
    `;

    // Return HTML content (in production, you'd use a PDF generation library)
    // For now, return HTML that can be printed to PDF by the browser
    return new Response(
      JSON.stringify({
        success: true,
        html: htmlContent,
        message: 'Use browser print to save as PDF',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
