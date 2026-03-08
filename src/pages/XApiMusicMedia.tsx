import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Music } from "lucide-react";

const apis = [
  { id: "itunes-search", name: "iTunes Search", description: "Search Apple iTunes content", icon: "🎵", baseUrl: "https://itunes.apple.com", sampleEndpoint: "/search?term=radiohead&limit=5", docsUrl: "https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/", responseType: "json" as const },
  { id: "musicbrainz", name: "MusicBrainz", description: "Open music encyclopedia", icon: "🎶", baseUrl: "https://musicbrainz.org/ws/2", sampleEndpoint: "/artist/?query=radiohead&fmt=json&limit=5", docsUrl: "https://musicbrainz.org/doc/MusicBrainz_API", responseType: "json" as const },
  { id: "deezer", name: "Deezer", description: "Search Deezer music catalog", icon: "🎧", baseUrl: "https://api.deezer.com", sampleEndpoint: "/search?q=eminem&limit=5", docsUrl: "https://developers.deezer.com/api", responseType: "json" as const },
  { id: "radio-browser", name: "Radio Browser", description: "Internet radio stations", icon: "📻", baseUrl: "https://de1.api.radio-browser.info/json", sampleEndpoint: "/stations/topvote?limit=5", docsUrl: "https://api.radio-browser.info", responseType: "json" as const },
  { id: "binary-jazz", name: "Binary Jazz", description: "Random music genre generator", icon: "🎷", baseUrl: "https://binaryjazz.us/wp-json/genrenator/v1", sampleEndpoint: "/genre/5", docsUrl: "https://binaryjazz.us/genrenator-api/", responseType: "json" as const },
  { id: "lyrics-ovh", name: "Lyrics.ovh", description: "Get song lyrics", icon: "🎤", baseUrl: "https://api.lyrics.ovh/v1", sampleEndpoint: "/coldplay/yellow", docsUrl: "https://lyricsovh.docs.apiary.io", responseType: "json" as const },
];

export default function XApiMusicMedia() {
  return <CategoryApiPage title="Music & Media APIs" subtitle="Search music, get lyrics, discover radio stations and genres" icon={<Music className="h-8 w-8 text-primary" />} apis={apis} />;
}
