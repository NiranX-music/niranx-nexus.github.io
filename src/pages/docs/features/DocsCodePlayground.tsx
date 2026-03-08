import { DocPage, DocCallout } from "@/components/docs/DocPage";

export default function DocsCodePlayground() {
  return (
    <DocPage breadcrumb="Features › Code Playground" title="Code Playground" description="Write, run, and share code in multiple languages directly in your browser.">
      <h2>Overview</h2>
      <p>The Code Playground is an integrated development environment supporting HTML, CSS, JavaScript, Python, and more. Write code, see live previews, and save your projects.</p>

      <h2>Features</h2>
      <ul>
        <li>Syntax highlighting and auto-completion</li>
        <li>Live preview for web code (HTML/CSS/JS)</li>
        <li>Console output panel for debugging</li>
        <li>Save and share code snippets</li>
        <li>AI-powered code suggestions via Xvibing</li>
      </ul>

      <DocCallout type="info" title="Execution">
        Code runs in a sandboxed iframe for security. Python execution uses a WASM-based runtime.
      </DocCallout>
    </DocPage>
  );
}
