import { DocPage, DocCallout } from "@/components/docs/DocPage";
export default function DocsSecurityOverview() {
  return (
    <DocPage breadcrumb="Security" title="Security Overview" description="How NiranX protects your data, accounts, and privacy across the platform.">
      <h2>Authentication</h2>
      <p>NiranX uses industry-standard authentication with email verification, password hashing, and session management. Two-factor authentication is available for additional security.</p>
      <h2>Row-Level Security</h2>
      <p>All database tables use Row-Level Security (RLS) policies to ensure users can only access their own data. Admin and moderator access is controlled via role-based policies.</p>
      <h2>Data Encryption</h2>
      <p>All data is encrypted in transit (TLS) and at rest. API keys and secrets are stored in secure vault storage, never exposed to clients.</p>
      <h2>Content Sandboxing</h2>
      <p>User-generated content (custom pages, code playground) runs in sandboxed iframes to prevent cross-site scripting and other attacks.</p>
      <DocCallout type="info" title="Security Center">
        Access the Security Center from the sidebar to view active sessions, manage 2FA, review audit logs, and configure privacy settings.
      </DocCallout>
    </DocPage>
  );
}
