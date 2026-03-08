import { DocPage, DocCodeBlock } from "@/components/docs/DocPage";
export default function DocsRestAPI() {
  return (
    <DocPage breadcrumb="API › REST API" title="REST API" description="CRUD endpoints for managing tasks, flashcards, notes, profiles, and more.">
      <h2>Endpoints</h2>
      <h3>User Profile</h3>
      <DocCodeBlock language="bash" code={`GET  /api/v1/user/profile
PUT  /api/v1/user/profile`} />

      <h3>Tasks</h3>
      <DocCodeBlock language="bash" code={`GET    /api/v1/tasks
POST   /api/v1/tasks
PUT    /api/v1/tasks/:id
DELETE /api/v1/tasks/:id`} />

      <h3>Flashcards</h3>
      <DocCodeBlock language="bash" code={`GET    /api/v1/flashcards
POST   /api/v1/flashcards/decks
GET    /api/v1/flashcards/decks/:id
POST   /api/v1/flashcards/decks/:id/cards`} />

      <h3>AI Conversations</h3>
      <DocCodeBlock language="bash" code={`GET    /api/v1/ai/conversations
POST   /api/v1/ai/chat
GET    /api/v1/ai/conversations/:id/messages`} />

      <h2>Pagination</h2>
      <p>List endpoints support <code>page</code> and <code>limit</code> query parameters. Default limit is 20, maximum is 100.</p>

      <h2>Filtering</h2>
      <p>Use query parameters for filtering: <code>?status=active&subject=math&sort=created_at:desc</code></p>
    </DocPage>
  );
}
