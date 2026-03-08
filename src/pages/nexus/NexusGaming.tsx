import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { Gamepad2 } from "lucide-react";
export default function NexusGaming() {
  return <NexusShowcase title="Gaming" subtitle="Play & Compete" description="Play games, compete with friends, and earn XP through gaming challenges on the platform." icon={<Gamepad2 className="h-8 w-8 text-primary" />} gradient="from-orange-500/20 via-background to-red-500/20" appLink="/niranx/xgames" highlights={["Browser Games", "Board Games", "Leaderboards", "XP Rewards"]} features={[
    { title: "XGames Hub", description: "Collection of browser-based games", icon: "🎮" },
    { title: "Board Games", description: "Classic board games with multiplayer", icon: "♟️" },
    { title: "Typing Speed Test", description: "Test and improve your typing speed", icon: "⌨️" },
    { title: "Daily Challenges", description: "Daily gaming challenges for bonus XP", icon: "🏆" },
    { title: "Genrenator", description: "Music genre guessing game", icon: "🎵" },
    { title: "Scryfall Search", description: "Magic: The Gathering card explorer", icon: "🃏" },
  ]} />;
}
