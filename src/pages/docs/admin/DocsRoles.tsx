import { DocPage, DocCallout } from "@/components/docs/DocPage";
export default function DocsRoles() {
  return (
    <DocPage breadcrumb="Admin › Roles" title="Role Management" description="Assign and manage user roles for access control across the platform.">
      <h2>Available Roles</h2>
      <ul>
        <li><strong>Admin</strong> — Full platform access, user management, content moderation</li>
        <li><strong>Moderator</strong> — Content review, user reports, community management</li>
        <li><strong>Music Moderator</strong> — XVibe music content review and approval</li>
        <li><strong>Teacher</strong> — Classroom creation, student management, grading</li>
        <li><strong>Guardian</strong> — Student monitoring and parental controls</li>
        <li><strong>User</strong> — Standard authenticated user access</li>
      </ul>
      <h2>Role Assignment</h2>
      <p>Admins can assign roles from the Admin Dashboard → Role Management. Role assignments include reason, expiration date, and audit logging.</p>
      <DocCallout type="warning" title="Security">
        Roles are stored in a dedicated user_roles table with RLS policies. Roles are never stored on the user profile to prevent privilege escalation.
      </DocCallout>
    </DocPage>
  );
}
