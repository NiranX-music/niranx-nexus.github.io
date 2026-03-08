import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { Video } from "lucide-react";
export default function NexusStreaming() {
  return <NexusShowcase title="Streaming" subtitle="Watch & Create" description="Stream video content, manage video libraries, and share multimedia with the community." icon={<Video className="h-8 w-8 text-primary" />} gradient="from-red-500/20 via-background to-pink-500/20" appLink="/niranx/stream-sphere" highlights={["Video Library", "StreamSphere", "Video Share", "Picture Share"]} features={[
    { title: "StreamSphere", description: "Watch and stream video content", icon: "📺" },
    { title: "Video Library", description: "Curated educational video collection", icon: "🎬" },
    { title: "Video Share", description: "Upload and share your own videos", icon: "📤" },
    { title: "YouTube Library", description: "Save and organize YouTube videos", icon: "▶️" },
    { title: "Picture Share", description: "Share images with the community", icon: "📸" },
    { title: "XClip", description: "Short-form video clips", icon: "✂️" },
  ]} />;
}
