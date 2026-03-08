import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { Brain } from "lucide-react";
export default function NexusAIHub() {
  return <NexusShowcase title="AI Hub" subtitle="Artificial Intelligence" description="Your central command center for 60+ AI models. Chat, generate images, solve problems, create presentations, and more — all from one interface." icon={<Brain className="h-8 w-8 text-primary" />} gradient="from-primary/20 via-background to-accent/20" appLink="/niranx/ai-corner" highlights={["60+ AI Models", "Multi-Provider", "Real-time Streaming", "Vision Support"]} features={[
    { title: "XNexus AI", description: "Flagship chat with 60+ models across categories", icon: "🧠" },
    { title: "AI Solver", description: "Upload homework images and get step-by-step solutions", icon: "📝" },
    { title: "Study Buddy", description: "Animated AI companion for study tips and motivation", icon: "🤖" },
    { title: "XBot Agents", description: "Create custom AI personas like Study Sensei or Code Wizard", icon: "🎭" },
    { title: "PDF Summarizer", description: "Upload PDFs and get AI-powered summaries", icon: "📄" },
    { title: "Image Generator", description: "Create images with Flux, SDXL, and more models", icon: "🎨" },
    { title: "Presentation Generator", description: "Auto-generate slide decks from topics", icon: "📊" },
    { title: "Writing Assistant", description: "AI-powered writing for essays and reports", icon: "✍️" },
    { title: "Code Assistant", description: "Xvibing and DeepSeek coding helpers", icon: "💻" },
  ]} />;
}
