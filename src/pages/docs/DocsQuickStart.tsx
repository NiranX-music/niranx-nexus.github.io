import { DocPage, DocCallout, DocCodeBlock } from "@/components/docs/DocPage";

export default function DocsQuickStart() {
  return (
    <DocPage breadcrumb="Introduction" title="Quick Start" description="Get up and running with NiranX in under 5 minutes.">
      <h2>1. Create Your Account</h2>
      <p>Visit the <a href="/auth" className="text-primary hover:underline">authentication page</a> and sign up with your email address. You'll receive a verification email — click the link to activate your account.</p>

      <DocCallout type="info" title="Email Verification">
        Email verification is required before you can access authenticated features. Check your spam folder if you don't see the email.
      </DocCallout>

      <h2>2. Set Up Your Profile</h2>
      <p>After logging in, you'll be guided through the onboarding flow where you can:</p>
      <ul>
        <li>Choose your display name and avatar</li>
        <li>Select your study subjects and interests</li>
        <li>Pick your preferred theme (light/dark)</li>
        <li>Configure notification preferences</li>
      </ul>

      <h2>3. Explore the Dashboard</h2>
      <p>The main dashboard is your command center. It displays widgets for tasks, study progress, AI tools, daily challenges, and quick actions. You can customize which widgets appear via <a href="/niranx/widget-settings" className="text-primary hover:underline">Widget Settings</a>.</p>

      <h2>4. Try AI Features</h2>
      <p>Head to the <a href="/niranx/ai-corner" className="text-primary hover:underline">AI Hub</a> to access 60+ AI models. You can:</p>
      <ul>
        <li>Chat with AI assistants for study help</li>
        <li>Generate flashcards, quizzes, and study plans</li>
        <li>Summarize PDFs and documents</li>
        <li>Generate images and presentations</li>
      </ul>

      <h2>5. Start a Focus Session</h2>
      <p>Use the <a href="/niranx/focus-engine" className="text-primary hover:underline">Focus Engine</a> for timed study sessions with Pomodoro technique, ambient sounds, and distraction blocking.</p>

      <DocCallout type="tip" title="Pro Tip">
        Enable Daily Rewards to earn XP and maintain your study streak. Visit the rewards page daily for bonus items and currency.
      </DocCallout>
    </DocPage>
  );
}
