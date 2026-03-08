import { DocPage } from "@/components/docs/DocPage";
export default function DocsPrivacy() {
  return (
    <DocPage breadcrumb="Security › Privacy" title="Privacy Settings" description="Control your data visibility, profile privacy, and what information is shared.">
      <h2>Profile Visibility</h2>
      <p>Choose who can see your profile: public, authenticated users only, or private. Control individual sections like study stats, achievements, and activity feed.</p>
      <h2>Data Export</h2>
      <p>Export all your data in JSON format from the Data Export page. This includes profile, messages, study data, and AI conversation history.</p>
      <h2>Data Deletion</h2>
      <p>Request deletion of specific data types or your entire account. Deletion is permanent and cannot be undone.</p>
    </DocPage>
  );
}
