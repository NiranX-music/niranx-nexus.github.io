import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { Rocket } from "lucide-react";
export default function NexusProjects() {
  return <NexusShowcase title="Projects" subtitle="Build & Create" description="Build and showcase your work with code playgrounds, website generators, and the Xstellar custom page engine." icon={<Rocket className="h-8 w-8 text-primary" />} gradient="from-violet-500/20 via-background to-purple-500/20" appLink="/niranx/code-playground" highlights={["Code Playground", "Website Generator", "Custom Pages", "App Library"]} features={[
    { title: "Code Playground", description: "Write and run code in multiple languages", icon: "💻" },
    { title: "AI Website Generator", description: "Generate full websites with AI", icon: "🌐" },
    { title: "Xstellar Custom Pages", description: "Build and deploy custom web apps", icon: "⚡" },
    { title: "App Library", description: "Browse and install community apps", icon: "📦" },
    { title: "XForge", description: "Advanced project creation tools", icon: "🔨" },
    { title: "Submit Your App", description: "Share your creations with the community", icon: "🚀" },
  ]} />;
}
