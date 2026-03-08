import { DocPage } from "@/components/docs/DocPage";
export default function DocsRateLimits() {
  return (
    <DocPage breadcrumb="API › Rate Limits" title="Rate Limits" description="API usage quotas and throttling policies for fair usage.">
      <h2>Default Limits</h2>
      <ul>
        <li><strong>Standard</strong>: 1,000 requests per minute</li>
        <li><strong>AI endpoints</strong>: 60 requests per minute</li>
        <li><strong>File uploads</strong>: 100 per hour</li>
        <li><strong>Search</strong>: 30 requests per minute</li>
      </ul>

      <h2>Rate Limit Headers</h2>
      <p>Responses include rate limit headers:</p>
      <ul>
        <li><code>X-RateLimit-Limit</code> — Maximum requests allowed</li>
        <li><code>X-RateLimit-Remaining</code> — Requests remaining in window</li>
        <li><code>X-RateLimit-Reset</code> — When the limit resets (Unix timestamp)</li>
      </ul>

      <h2>Handling 429 Errors</h2>
      <p>When rate limited, you'll receive a 429 status code. Implement exponential backoff and respect the <code>Retry-After</code> header.</p>
    </DocPage>
  );
}
