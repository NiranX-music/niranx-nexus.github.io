import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { MessageSquare } from "lucide-react";
export default function NexusCommunity() {
  return <NexusShowcase title="Community" subtitle="Connect & Share" description="Connect with creators, learners, and builders. Join forums, debates, and social feeds." icon={<MessageSquare className="h-8 w-8 text-primary" />} gradient="from-green-500/20 via-background to-emerald-500/20" appLink="/niranx/community" highlights={["Forums", "Debates", "XFlow Social", "Study Groups"]} features={[
    { title: "Community Forums", description: "Discuss topics and ask questions", icon: "💬" },
    { title: "Debate Arena", description: "Structured debates with AI scoring", icon: "⚖️" },
    { title: "XFlow Social", description: "Post updates, follow users, DM", icon: "📱" },
    { title: "Study Groups", description: "Collaborate with study partners", icon: "👥" },
    { title: "Activity Feed", description: "See what peers are doing", icon: "📰" },
    { title: "Guilds", description: "Team-based competition and collaboration", icon: "🏰" },
  ]} />;
}
