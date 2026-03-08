import { DocPage, DocCallout, DocFeatureCard } from "@/components/docs/DocPage";

export default function DocsAIHub() {
  return (
    <DocPage breadcrumb="Features › AI Hub" title="AI Hub" description="Access 60+ AI models for chat, vision, code, image generation, and more from a single unified interface.">
      <h2>Overview</h2>
      <p>The AI Hub (AI Corner) is NiranX's central AI command center. It aggregates multiple AI providers — Lovable AI, OpenRouter, Groq, XGenesis, and more — into a seamless experience.</p>

      <h2>Available Tools</h2>
      <div className="grid md:grid-cols-2 gap-3 not-prose">
        <DocFeatureCard title="XNexus AI" description="60+ models across Vision, Audio, and Multilingual categories" />
        <DocFeatureCard title="Xvibing" description="Dedicated coding assistant with model selection" />
        <DocFeatureCard title="Study Buddy" description="Animated AI companion with study tips and metrics" />
        <DocFeatureCard title="XBot" description="Custom AI agent platform for specialized personas" />
        <DocFeatureCard title="AI Solver" description="Homework solver with image upload support" />
        <DocFeatureCard title="PDF Summarizer" description="Upload and summarize PDFs with AI" />
        <DocFeatureCard title="Smart PDF Chat" description="Chat with your PDF documents" />
        <DocFeatureCard title="AI Writing Assistant" description="Generate essays, reports, and creative writing" />
        <DocFeatureCard title="Image Generator" description="Create images using Flux and other models" />
        <DocFeatureCard title="Presentation Generator" description="Create slide decks with AI" />
      </div>

      <h2>Supported Providers</h2>
      <ul>
        <li><strong>Lovable AI Gateway</strong> — Gemini 2.5 Pro/Flash, GPT-5, GPT-5-mini</li>
        <li><strong>XGenesis AI</strong> — 50+ models including DeepSeek, Qwen, Kimi</li>
        <li><strong>Groq</strong> — Ultra-fast inference for LLaMA and Mixtral models</li>
        <li><strong>OpenRouter</strong> — Access to hundreds of models</li>
      </ul>

      <DocCallout type="info" title="Usage Limits">
        AI features use credits based on model and token usage. Free users get limited daily credits. Check your usage in Settings → Plans & Credits.
      </DocCallout>

      <h2>How It Works</h2>
      <p>All AI requests are routed through secure backend edge functions. Your conversations are saved automatically and can be accessed from the AI Chat History page. You can also export and share AI-generated content.</p>
    </DocPage>
  );
}
