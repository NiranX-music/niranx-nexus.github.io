import { DocPage } from "@/components/docs/DocPage";
export default function DocsModeration() {
  return (
    <DocPage breadcrumb="Admin › Moderation" title="Content Moderation" description="Review, approve, and manage user-generated content across the platform.">
      <h2>Moderation Queues</h2>
      <ul>
        <li><strong>Custom Pages</strong> — User-submitted apps and pages</li>
        <li><strong>Music</strong> — Uploaded tracks and albums</li>
        <li><strong>XFlow Posts</strong> — Social media content</li>
        <li><strong>Blog Posts</strong> — Community blog submissions</li>
        <li><strong>Debate Comments</strong> — Flagged debate content</li>
      </ul>
      <h2>Actions</h2>
      <p>Moderators can approve, reject (with reason), or flag content for admin review. All moderation actions are logged in the audit trail.</p>
      <h2>Automated Moderation</h2>
      <p>Content is automatically scanned for prohibited terms and suspicious patterns. Flagged content is queued for human review.</p>
    </DocPage>
  );
}
