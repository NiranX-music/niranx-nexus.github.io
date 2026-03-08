import { DocPage } from "@/components/docs/DocPage";
export default function Docs2FA() {
  return (
    <DocPage breadcrumb="Security › 2FA" title="Two-Factor Authentication" description="Add an extra layer of security to your account with time-based one-time passwords.">
      <h2>Setup</h2>
      <p>Enable 2FA from Settings → Security → Two-Factor Auth. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.) and enter the verification code.</p>
      <h2>Backup Codes</h2>
      <p>Save your backup codes securely. These one-time codes can be used if you lose access to your authenticator app.</p>
      <h2>Recovery</h2>
      <p>If you lose both your authenticator and backup codes, contact support for account recovery verification.</p>
    </DocPage>
  );
}
