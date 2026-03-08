import { DocPage, DocCallout, DocFeatureCard } from "@/components/docs/DocPage";

export default function DocsWelcome() {
  return (
    <DocPage breadcrumb="Introduction" title="Welcome to NiranX" description="The all-in-one learning, productivity, and creative platform. Everything you need to study smarter, build faster, and collaborate better.">
      <DocCallout type="tip" title="Getting Started">
        New to NiranX? Start with the <a href="/docs/quick-start" className="text-primary hover:underline">Quick Start guide</a> to set up your account and explore the dashboard.
      </DocCallout>

      <h2>What is NiranX?</h2>
      <p>NiranX is a comprehensive platform that combines AI-powered study tools, music streaming (XVibe), collaborative classrooms, developer tools, and a gamified learning experience — all in one place.</p>

      <h2>Core Capabilities</h2>
      <div className="grid md:grid-cols-2 gap-3 not-prose">
        <DocFeatureCard title="AI Hub" description="60+ AI models for chat, image generation, code assistance, and more" link="/docs/features/ai-hub" />
        <DocFeatureCard title="Focus Engine" description="Pomodoro timer, distraction blocker, and ambient sounds" link="/docs/features/focus-engine" />
        <DocFeatureCard title="Virtual Labs" description="Chemistry, Physics, Biology, and Math interactive simulations" link="/docs/features/virtual-labs" />
        <DocFeatureCard title="XVibe Music" description="Full music streaming platform with artist tools" link="/nexus/xvibe-music" />
        <DocFeatureCard title="Classrooms" description="Teacher-student interaction with live sessions" link="/docs/collaborate/classrooms" />
        <DocFeatureCard title="Developer API" description="REST API, AI API, and webhook integrations" link="/docs/api/overview" />
      </div>

      <h2>Platform Architecture</h2>
      <p>NiranX is built on React + Vite with TypeScript, styled using Tailwind CSS. The backend is powered by Lovable Cloud, which provides authentication, database, file storage, edge functions, and real-time capabilities.</p>

      <h3>Key Technologies</h3>
      <ul>
        <li><strong>Frontend</strong>: React 18, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui</li>
        <li><strong>Backend</strong>: Lovable Cloud (edge functions, database, auth, storage)</li>
        <li><strong>AI</strong>: Lovable AI Gateway, OpenRouter, Groq, XGenesis API</li>
        <li><strong>Real-time</strong>: WebSocket subscriptions for chat, notifications, live classes</li>
      </ul>

      <h2>Explore the Docs</h2>
      <div className="grid md:grid-cols-2 gap-3 not-prose">
        <DocFeatureCard title="Features Guide" description="Deep dive into every platform feature" link="/docs/features/ai-hub" />
        <DocFeatureCard title="API Reference" description="Build integrations with NiranX APIs" link="/docs/api/overview" />
        <DocFeatureCard title="Security" description="Authentication, privacy, and data protection" link="/docs/security/overview" />
        <DocFeatureCard title="Admin Guide" description="Manage users, content, and platform settings" link="/docs/admin/dashboard" />
      </div>
    </DocPage>
  );
}
