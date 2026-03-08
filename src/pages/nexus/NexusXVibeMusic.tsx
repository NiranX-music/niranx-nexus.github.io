import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { Music } from "lucide-react";
export default function NexusXVibeMusic() {
  return <NexusShowcase title="XVibe Music" subtitle="Music Streaming" description="A full-featured music streaming platform with artist tools, albums, playlists, and a curated discovery experience." icon={<Music className="h-8 w-8 text-primary" />} gradient="from-rose-500/20 via-background to-orange-500/20" appLink="/xvibe" highlights={["Unlimited Streaming", "Artist Dashboard", "Album Management", "Community Radio"]} features={[
    { title: "Music Library", description: "Browse and stream thousands of tracks", icon: "🎵" },
    { title: "Artist Dashboard", description: "Upload tracks, manage albums, view analytics", icon: "🎤" },
    { title: "Playlist Creator", description: "Create and share custom playlists", icon: "📋" },
    { title: "Album Pages", description: "Full album view with track listings", icon: "💿" },
    { title: "Search & Discover", description: "Find music by genre, artist, or mood", icon: "🔍" },
    { title: "AI Song Generator", description: "Create music with AI", icon: "🤖" },
  ]} />;
}
