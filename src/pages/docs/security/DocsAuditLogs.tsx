import { DocPage } from "@/components/docs/DocPage";
export default function DocsAuditLogs() {
  return (
    <DocPage breadcrumb="Security › Audit Logs" title="Audit Logs" description="Track all account actions and security events for transparency and compliance.">
      <h2>What's Logged</h2>
      <ul>
        <li>Login and logout events</li>
        <li>Password and email changes</li>
        <li>Role assignments and revocations</li>
        <li>Admin actions (content moderation, user management)</li>
        <li>API key creation and deletion</li>
        <li>Data export requests</li>
      </ul>
      <h2>Viewing Logs</h2>
      <p>Access audit logs from the Security section. Filter by action type, date range, and user. Logs are retained for 90 days.</p>
    </DocPage>
  );
}
