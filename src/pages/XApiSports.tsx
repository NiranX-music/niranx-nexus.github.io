import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Trophy } from "lucide-react";

const apis = [
  { id: "thesportsdb", name: "TheSportsDB", description: "Sports data and images", icon: "⚽", baseUrl: "https://www.thesportsdb.com/api/v1/json/3", sampleEndpoint: "/searchteams.php?t=Arsenal", docsUrl: "https://www.thesportsdb.com/api.php", responseType: "json" as const },
  { id: "f1-ergast", name: "F1 Ergast", description: "Formula 1 race data", icon: "🏎️", baseUrl: "https://ergast.com/api/f1", sampleEndpoint: "/current.json", docsUrl: "https://ergast.com/mrd/", responseType: "json" as const },
  { id: "balldontlie", name: "BallDontLie", description: "NBA basketball stats", icon: "🏀", baseUrl: "https://api.balldontlie.io/v1", sampleEndpoint: "/teams", docsUrl: "https://www.balldontlie.io", responseType: "json" as const },
  { id: "nhl-api", name: "NHL API", description: "National Hockey League data", icon: "🏒", baseUrl: "https://statsapi.web.nhl.com/api/v1", sampleEndpoint: "/teams", docsUrl: "https://statsapi.web.nhl.com/api/v1", responseType: "json" as const },
  { id: "football-data", name: "Football Data", description: "European football leagues", icon: "🏟️", baseUrl: "https://api.football-data.org/v4", sampleEndpoint: "/competitions", docsUrl: "https://www.football-data.org/documentation", responseType: "json" as const },
  { id: "cricketdata", name: "CricAPI", description: "Cricket match data", icon: "🏏", baseUrl: "https://api.cricapi.com/v1", sampleEndpoint: "/currentMatches?apikey=test&offset=0", docsUrl: "https://www.cricapi.com", responseType: "json" as const },
];

export default function XApiSports() {
  return <CategoryApiPage title="Sports APIs" subtitle="Football, F1, NBA, NHL, and cricket data" icon={<Trophy className="h-8 w-8 text-primary" />} apis={apis} />;
}
