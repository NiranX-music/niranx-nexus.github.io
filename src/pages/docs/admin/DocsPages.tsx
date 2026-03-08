import { DocPage } from "@/components/docs/DocPage";
export default function DocsPages() {
  return (
    <DocPage breadcrumb="Admin › Pages" title="Page Management" description="Control which pages are visible in the sidebar and accessible to users.">
      <h2>Page Archive</h2>
      <p>The Page Archive allows admins to enable or disable pages for specific user roles. Disabled pages are hidden from navigation and return 404 for unauthorized users.</p>
      <h2>Sidebar Management</h2>
      <p>Admins can manage sidebar groups and pages from the Admin Dashboard. Create custom groups, reorder items, and toggle visibility.</p>
      <h2>User Customization</h2>
      <p>Individual users can also customize their sidebar using the pencil icon (Shortcut Editor). User preferences are saved to local storage and synced via cloud.</p>
      <h2>Custom Sidebar Groups</h2>
      <p>Admins can create dynamic sidebar groups that pull pages from the allPages registry. Groups can be categorized, colored, and ordered.</p>
    </DocPage>
  );
}
