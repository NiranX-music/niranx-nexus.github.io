import { DocPage } from "@/components/docs/DocPage";
export default function DocsThemes() {
  return (
    <DocPage breadcrumb="Design › Themes" title="Theme Customization" description="Customize colors, fonts, and visual styles. Create and share custom themes.">
      <h2>Built-in Themes</h2>
      <p>NiranX ships with multiple themes including Dark (default), Light, Cyberpunk, Ocean, Forest, and more. Switch themes from Settings → Appearance.</p>
      <h2>Custom Themes</h2>
      <p>Create your own theme by customizing primary, accent, background, and foreground colors. Custom themes are saved to your account and can be shared via share tokens.</p>
      <h2>Community Themes</h2>
      <p>Browse and install themes created by other users. Popular themes are featured on the Theme Gallery page.</p>
    </DocPage>
  );
}
