import { DocPage, DocCallout } from "@/components/docs/DocPage";

export default function DocsIntegrations() {
  return (
    <DocPage breadcrumb="Features › Integrations" title="Integrations" description="Connect NiranX with external services and tools for enhanced productivity.">
      <h2>Available Integrations</h2>
      <ul>
        <li><strong>Google Drive</strong> — Sync and access your Drive files</li>
        <li><strong>Google Calendar</strong> — Import schedules and deadlines</li>
        <li><strong>Backblaze B2</strong> — Cloud storage integration</li>
        <li><strong>XOrbit</strong> — Cross-platform sync</li>
        <li><strong>Browser Extension</strong> — Sync data from your browser</li>
      </ul>

      <h2>Integration Hub</h2>
      <p>The Integration Hub provides a unified interface to manage all connected services, view sync status, and configure settings.</p>

      <DocCallout type="tip" title="API Keys">
        Some integrations require API keys. These are stored securely using backend secrets management and never exposed to the client.
      </DocCallout>
    </DocPage>
  );
}
