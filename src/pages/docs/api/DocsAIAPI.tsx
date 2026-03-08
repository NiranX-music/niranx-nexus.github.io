import { DocPage, DocCodeBlock, DocCallout } from "@/components/docs/DocPage";
export default function DocsAIAPI() {
  return (
    <DocPage breadcrumb="API › AI API" title="AI API Reference" description="Use NiranX's AI API for chat completions, image generation, and model management.">
      <h2>Chat Completions</h2>
      <DocCodeBlock language="typescript" code={`const response = await fetch('https://api.niranx.com/v1/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: 'You are a helpful tutor.' },
      { role: 'user', content: 'Explain quantum entanglement.' }
    ],
    stream: true
  })
});`} />

      <h2>Available Models</h2>
      <ul>
        <li><code>google/gemini-2.5-pro</code> — Best for complex reasoning</li>
        <li><code>google/gemini-2.5-flash</code> — Fast, balanced quality</li>
        <li><code>openai/gpt-5</code> — Powerful all-rounder</li>
        <li><code>openai/gpt-5-mini</code> — Cost-effective</li>
      </ul>

      <h2>Image Generation</h2>
      <DocCodeBlock language="typescript" code={`const response = await fetch('https://api.niranx.com/v1/ai/images', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'flux-schnell',
    prompt: 'A futuristic city at sunset',
    size: '1024x1024'
  })
});`} />

      <h2>Streaming</h2>
      <p>Set <code>stream: true</code> to receive Server-Sent Events (SSE). Parse each line as a JSON delta for real-time token delivery.</p>

      <DocCallout type="info" title="Credits">
        AI API calls consume credits based on model and token usage. Monitor usage in Settings → Plans & Credits.
      </DocCallout>
    </DocPage>
  );
}
