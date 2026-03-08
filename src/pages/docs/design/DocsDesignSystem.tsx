import { DocPage } from "@/components/docs/DocPage";
export default function DocsDesignSystem() {
  return (
    <DocPage breadcrumb="Design › Design System" title="Design System" description="NiranX's design system: semantic tokens, component variants, and typography guidelines.">
      <h2>Color Tokens</h2>
      <p>All colors use HSL-based semantic tokens defined in index.css. Primary, secondary, accent, muted, and destructive palettes are available with foreground variants.</p>
      <h2>Typography</h2>
      <p>Headings use Orbitron for the futuristic aesthetic. Body text uses Space Grotesk for readability. Monospace elements use JetBrains Mono.</p>
      <h2>Components</h2>
      <p>UI is built on shadcn/ui with custom variants for glassmorphic cards, neon borders, HUD-style badges, and animated buttons. All components are fully responsive.</p>
      <h2>Animation</h2>
      <p>Framer Motion powers page transitions, card hover effects, and micro-interactions. CSS animations handle pulsing glows, scanning lines, and gradient shifts.</p>
    </DocPage>
  );
}
