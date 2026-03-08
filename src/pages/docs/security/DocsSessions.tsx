import { DocPage } from "@/components/docs/DocPage";
export default function DocsSessions() {
  return (
    <DocPage breadcrumb="Security › Sessions" title="Session Management" description="View and manage active sessions across all your devices.">
      <h2>Active Sessions</h2>
      <p>View all active sessions with device type, browser, IP address, and last activity time. Revoke sessions you don't recognize.</p>
      <h2>Session Security</h2>
      <p>Sessions expire automatically after inactivity. Sensitive actions require re-authentication. You can force sign-out of all devices from the Security page.</p>
    </DocPage>
  );
}
