import { DocPage, DocCallout } from "@/components/docs/DocPage";

export default function DocsCustomPages() {
  return (
    <DocPage breadcrumb="Features › Custom Pages" title="Custom Pages" description="Create and deploy custom pages using HTML, CSS, and JavaScript with support for multiple programming paradigms.">
      <h2>Overview</h2>
      <p>The Custom Pages engine (accessible through Xstellar) allows admins and users to build and deploy web applications directly on the platform. Pages support HTML, CSS, JS, and render via secured iframes.</p>

      <h2>Creating Pages</h2>
      <ul>
        <li>Write code using the built-in editor with syntax highlighting</li>
        <li>Preview changes in real-time</li>
        <li>Toggle "Show in Sidebar" to make pages accessible from navigation</li>
        <li>Assign pages to sidebar groups for organization</li>
      </ul>

      <h2>User Submissions</h2>
      <p>Users can submit custom apps for admin review via the Submit App page. Approved apps appear in the public Nexus Portal library.</p>

      <DocCallout type="warning" title="Security">
        All custom pages run in sandboxed iframes to prevent XSS and other attacks. Admin moderation is required for public pages.
      </DocCallout>
    </DocPage>
  );
}
