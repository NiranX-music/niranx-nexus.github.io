import { DocPage, DocCodeBlock, DocCallout } from "@/components/docs/DocPage";
export default function DocsAPIOverview() {
  return (
    <DocPage breadcrumb="API" title="API Overview" description="Build integrations with NiranX using our REST and AI APIs. Authentication, endpoints, and best practices.">
      <h2>Authentication</h2>
      <p>All API requests require authentication via Bearer token. Obtain your API key from Settings → API Keys.</p>
      <DocCodeBlock language="bash" code={`curl -X GET 'https://api.niranx.com/v1/user/profile' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`} />

      <h2>Base URL</h2>
      <p>All API endpoints are served from <code>https://api.niranx.com/v1/</code></p>

      <h2>Response Format</h2>
      <p>All responses are JSON with consistent structure:</p>
      <DocCodeBlock language="json" code={`{
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "total": 100,
    "limit": 20
  }
}`} />

      <h2>Available APIs</h2>
      <ul>
        <li><a href="/docs/api/ai-api" className="text-primary hover:underline">AI API</a> — Chat completions, image generation, embeddings</li>
        <li><a href="/docs/api/rest-api" className="text-primary hover:underline">REST API</a> — CRUD operations for all platform resources</li>
        <li><a href="/docs/api/webhooks" className="text-primary hover:underline">Webhooks</a> — Real-time event notifications</li>
        <li><a href="/docs/api/rate-limits" className="text-primary hover:underline">Rate Limits</a> — Usage quotas and throttling</li>
      </ul>

      <DocCallout type="warning" title="Rate Limits">
        API requests are rate-limited to 1000 requests per minute on standard plans. See the Rate Limits page for details.
      </DocCallout>
    </DocPage>
  );
}
