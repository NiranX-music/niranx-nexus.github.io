import { DocPage, DocFeatureCard } from "@/components/docs/DocPage";
export default function DocsAdminDashboard() {
  return (
    <DocPage breadcrumb="Admin" title="Admin Dashboard" description="Central control panel for platform administration, user management, and content moderation.">
      <h2>Dashboard Overview</h2>
      <p>The Admin Dashboard provides a high-level view of platform health: active users, content stats, pending moderation items, and system notifications.</p>

      <h2>Admin Tools</h2>
      <div className="grid md:grid-cols-2 gap-3 not-prose">
        <DocFeatureCard title="Role Management" description="Assign admin, moderator, teacher roles" link="/docs/admin/roles" />
        <DocFeatureCard title="Content Moderation" description="Review and approve user submissions" link="/docs/admin/moderation" />
        <DocFeatureCard title="Page Management" description="Control page visibility and access" link="/docs/admin/pages" />
        <DocFeatureCard title="Notifications" description="Send platform-wide announcements" />
        <DocFeatureCard title="User Controls" description="Manage user accounts and permissions" />
        <DocFeatureCard title="Analytics" description="View platform usage statistics" />
      </div>
    </DocPage>
  );
}
