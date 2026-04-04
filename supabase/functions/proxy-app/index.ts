import { corsHeaders } from '../_shared/cors'

const REBRAND_RULES: Record<string, { find: RegExp; replace: string }[]> = {
  'kworb.net': [
    { find: /kworb\.net!?/gi, replace: 'NiranX Stats' },
    { find: /knworb/gi, replace: 'NiranX Stats' },
  ],
};

const DARK_MODE_CSS = `
  <style id="niranx-dark-override">
    :root { color-scheme: dark; }
    body, html {
      background-color: #0a0a0f !important;
      color: #e0e0e6 !important;
    }
    * {
      border-color: rgba(255,255,255,0.1) !important;
    }
    a { color: #00e5ff !important; }
    a:hover { color: #69f0ae !important; }
    table, th, td {
      background-color: #12121a !important;
      color: #e0e0e6 !important;
    }
    tr:nth-child(even) { background-color: #1a1a2e !important; }
    tr:hover { background-color: #252540 !important; }
    img { filter: brightness(0.9); }
    input, select, textarea {
      background-color: #1a1a2e !important;
      color: #e0e0e6 !important;
      border: 1px solid rgba(0,229,255,0.3) !important;
    }
    h1, h2, h3, h4, h5, h6 { color: #00e5ff !important; }
    .header, header, nav, #header, .navbar {
      background-color: #0d0d1a !important;
    }
    footer, .footer {
      background-color: #0d0d1a !important;
    }
  </style>
`;

const NIRANX_BRANDING = `
  <style id="niranx-branding">
    body { font-family: 'Space Grotesk', 'Segoe UI', sans-serif !important; }
    ::selection { background: rgba(0,229,255,0.3); }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0f; }
    ::-webkit-scrollbar-thumb { background: #00e5ff40; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #00e5ff80; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL
    let parsedTarget: URL;
    try {
      parsedTarget = new URL(targetUrl);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the external page
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const contentType = response.headers.get('content-type') || '';

    // For non-HTML content (CSS, JS, images), pass through
    if (!contentType.includes('text/html')) {
      const body = await response.arrayBuffer();
      
      // For CSS files, apply dark mode overrides
      if (contentType.includes('text/css')) {
        let css = new TextDecoder().decode(body);
        // Darken background colors in CSS
        css = css.replace(/background(-color)?:\s*(white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))/gi, 'background$1: #0a0a0f');
        css = css.replace(/color:\s*(black|#000|#000000|rgb\(0,\s*0,\s*0\))/gi, 'color: #e0e0e6');
        return new Response(css, {
          headers: { ...corsHeaders, 'Content-Type': contentType },
        });
      }
      
      return new Response(body, {
        headers: { ...corsHeaders, 'Content-Type': contentType },
      });
    }

    let html = await response.text();
    const hostname = parsedTarget.hostname;

    // Apply rebranding rules
    const rules = REBRAND_RULES[hostname] || [];
    for (const rule of rules) {
      html = html.replace(rule.find, rule.replace);
    }

    // Rewrite relative URLs to go through proxy
    const baseUrl = `${parsedTarget.protocol}//${parsedTarget.host}`;
    const proxyBase = url.origin + url.pathname;

    // Rewrite href and src attributes to absolute URLs through proxy
    html = html.replace(/(href|src|action)="(?!https?:\/\/|mailto:|tel:|javascript:|#|data:)([^"]*?)"/gi, (match, attr, path) => {
      const absoluteUrl = path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
      return `${attr}="${proxyBase}?url=${encodeURIComponent(absoluteUrl)}"`;
    });

    // Inject dark mode + branding before </head>
    html = html.replace('</head>', `${DARK_MODE_CSS}${NIRANX_BRANDING}</head>`);

    // Add base target to keep navigation within iframe
    if (!html.includes('<base')) {
      html = html.replace('<head>', `<head><base target="_self">`);
    }

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
