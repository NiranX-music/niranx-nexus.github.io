import { DocPage } from "@/components/docs/DocPage";
export default function DocsChangelog() {
  return (
    <DocPage breadcrumb="Changelog" title="Changelog" description="Latest updates, new features, and improvements to the NiranX platform.">
      <h2>March 2026</h2>
      <h3>XGenesis AI (v2.0)</h3>
      <ul>
        <li>Renamed from Scitely AI to XGenesis AI</li>
        <li>Added 50+ frontier AI models for chat, vision, and image generation</li>
        <li>Real-time streaming support</li>
        <li>Image upload for vision models</li>
      </ul>

      <h3>3D Platform Overhaul</h3>
      <ul>
        <li>Liquid animated background across all pages</li>
        <li>Glassmorphic sidebar with futuristic design</li>
        <li>Reorganized sidebar into 20+ categories</li>
      </ul>

      <h3>Documentation Platform</h3>
      <ul>
        <li>Full docs platform with categorized sidebar navigation</li>
        <li>Feature guides, API reference, security docs</li>
        <li>Searchable and mobile-responsive</li>
      </ul>

      <h2>February 2026</h2>
      <h3>XVibe Music Platform</h3>
      <ul>
        <li>Complete music streaming platform with artist tools</li>
        <li>Album management and release pipeline</li>
        <li>Music moderation workflow</li>
      </ul>

      <h3>Debate Arena</h3>
      <ul>
        <li>Structured debate system with AI scoring</li>
        <li>Categories, tournaments, and live debate rooms</li>
        <li>Award system with debate XP</li>
      </ul>
    </DocPage>
  );
}
