import { DocPage, DocFeatureCard, DocCallout } from "@/components/docs/DocPage";

export default function DocsOverview() {
  return (
    <DocPage breadcrumb="Introduction" title="Platform Overview" description="A comprehensive look at the NiranX ecosystem — every module, feature, and integration at a glance.">
      <h2>Platform Structure</h2>
      <p>NiranX is organized into several major modules, each accessible from the sidebar navigation:</p>

      <h3>AI Corner</h3>
      <p>The AI module provides access to multiple AI providers and models for various tasks including chat, image generation, code assistance, document analysis, and more. Key tools include XGenesis AI (50+ models), AI Solver, Study Buddy, and XBot custom agents.</p>

      <h3>Study & Focus</h3>
      <p>A comprehensive suite of study tools: task management, focus timer (Pomodoro), flashcards with spaced repetition, virtual labs (Chemistry, Physics, Biology, Math), exam simulator, and collaborative study groups.</p>

      <h3>Progress & Gamification</h3>
      <p>Track your learning with analytics dashboards, XP system, daily challenges, streaks, leaderboards, achievements, and a reward store. Stay motivated with the guild system and accountability partners.</p>

      <h3>Creative & Media</h3>
      <p>XVibe Music streaming platform, AI song generator, AI image generator, AI presentation maker, video library, and content publishing tools.</p>

      <h3>Communication</h3>
      <p>Built-in messaging, chat rooms, XFlow social platform, XMail, community forums, and debate arena. Real-time collaboration powered by WebSocket subscriptions.</p>

      <h3>Developer Tools</h3>
      <p>Code Playground, REST API docs, API console, integration hub, and the Nexus Portal for discovering and building apps on the platform.</p>

      <h3>Administration</h3>
      <p>Admin dashboard with role management, content moderation, page archive controls, user controls, analytics, and notification management.</p>

      <DocCallout type="info" title="Navigation">
        Use the sidebar to browse detailed documentation for each feature. Every page includes usage instructions, configuration options, and tips.
      </DocCallout>
    </DocPage>
  );
}
