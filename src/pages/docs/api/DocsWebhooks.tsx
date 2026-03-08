import { DocPage, DocCodeBlock } from "@/components/docs/DocPage";
export default function DocsWebhooks() {
  return (
    <DocPage breadcrumb="API › Webhooks" title="Webhooks" description="Receive real-time notifications when events occur on the platform.">
      <h2>Supported Events</h2>
      <ul>
        <li><code>task.created</code> — New task created</li>
        <li><code>task.completed</code> — Task marked complete</li>
        <li><code>flashcard.studied</code> — Flashcard session completed</li>
        <li><code>achievement.unlocked</code> — New achievement earned</li>
        <li><code>message.received</code> — New chat message</li>
      </ul>

      <h2>Payload Format</h2>
      <DocCodeBlock language="json" code={`{
  "event": "task.completed",
  "timestamp": "2026-03-08T10:30:00Z",
  "data": {
    "id": "abc123",
    "title": "Study Chapter 5",
    "completed_at": "2026-03-08T10:30:00Z"
  }
}`} />

      <h2>Configuration</h2>
      <p>Configure webhook endpoints in Settings → Integrations → Webhooks. Set a secret key for signature verification.</p>
    </DocPage>
  );
}
