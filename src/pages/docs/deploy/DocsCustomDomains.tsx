import { DocPage, DocCallout } from "@/components/docs/DocPage";
export default function DocsCustomDomains() {
  return (
    <DocPage breadcrumb="Deploy › Custom Domains" title="Custom Domains" description="Connect your own domain to your published NiranX content.">
      <h2>How It Works</h2>
      <p>Published pages and websites can be mapped to custom domains. Configure DNS settings to point your domain to NiranX's servers.</p>
      <DocCallout type="warning" title="Coming Soon">
        Custom domain support is currently in development. Published content is available via NiranX subdomains.
      </DocCallout>
    </DocPage>
  );
}
