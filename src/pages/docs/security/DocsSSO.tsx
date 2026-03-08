import { DocPage, DocCallout } from "@/components/docs/DocPage";
export default function DocsSSO() {
  return (
    <DocPage breadcrumb="Security › SSO" title="SSO & SCIM Provisioning" badge="Enterprise" description="Single Sign-On and automated user provisioning for enterprise deployments.">
      <h2>SAML SSO</h2>
      <p>Enterprise customers can configure SAML-based SSO with their identity provider (Okta, Azure AD, Google Workspace, etc.) for centralized authentication.</p>
      <h2>SCIM Provisioning</h2>
      <p>Automate user lifecycle management with SCIM 2.0. Create, update, and deactivate users automatically when they join or leave your organization.</p>
      <DocCallout type="info" title="Enterprise Feature">
        SSO and SCIM are available on Enterprise plans. Contact your administrator for setup.
      </DocCallout>
    </DocPage>
  );
}
