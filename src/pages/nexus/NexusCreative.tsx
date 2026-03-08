import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { Palette } from "lucide-react";
export default function NexusCreative() {
  return <NexusShowcase title="Creative" subtitle="Design & Art" description="Design tools, AI art generation, theme customization, and creative content creation." icon={<Palette className="h-8 w-8 text-primary" />} gradient="from-pink-500/20 via-background to-violet-500/20" appLink="/niranx/lovable-image-gen" highlights={["AI Image Gen", "Theme Designer", "Whiteboard", "Presentations"]} features={[
    { title: "AI Image Generator", description: "Create images with Flux and AI models", icon: "🎨" },
    { title: "Theme Customization", description: "Design custom color themes", icon: "🎭" },
    { title: "Collaborative Whiteboard", description: "Draw and brainstorm together", icon: "🖌️" },
    { title: "AI Presentations", description: "Generate beautiful slide decks", icon: "📊" },
    { title: "Mind Map Builder", description: "Visual knowledge organization", icon: "🗺️" },
    { title: "AI Writing", description: "Creative writing with AI assistance", icon: "✍️" },
  ]} />;
}
