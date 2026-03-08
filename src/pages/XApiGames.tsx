import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Gamepad2 } from "lucide-react";

const apis = [
  { id: "pokeapi", name: "PokéAPI", description: "Pokémon game data", icon: "⚡", baseUrl: "https://pokeapi.co/api/v2", sampleEndpoint: "/pokemon?limit=10", docsUrl: "https://pokeapi.co/docs/v2", responseType: "json" as const },
  { id: "open-trivia", name: "Open Trivia DB", description: "Trivia questions database", icon: "🧠", baseUrl: "https://opentdb.com", sampleEndpoint: "/api.php?amount=5&type=multiple", docsUrl: "https://opentdb.com/api_config.php", responseType: "json" as const },
  { id: "dnd-api", name: "D&D 5e API", description: "Dungeons & Dragons SRD data", icon: "🐉", baseUrl: "https://www.dnd5eapi.co/api", sampleEndpoint: "/classes", docsUrl: "https://www.dnd5eapi.co", responseType: "json" as const },
  { id: "chess-com", name: "Chess.com", description: "Chess player data and puzzles", icon: "♟️", baseUrl: "https://api.chess.com/pub", sampleEndpoint: "/puzzle/random", docsUrl: "https://www.chess.com/news/view/published-data-api", responseType: "json" as const },
  { id: "jservice", name: "JService", description: "Jeopardy trivia clues", icon: "📺", baseUrl: "https://jservice.io", sampleEndpoint: "/api/random?count=5", docsUrl: "https://jservice.io", responseType: "json" as const },
  { id: "pokemon-tcg", name: "Pokémon TCG", description: "Pokémon Trading Card Game data", icon: "🎴", baseUrl: "https://api.pokemontcg.io/v2", sampleEndpoint: "/cards?pageSize=5", docsUrl: "https://docs.pokemontcg.io", responseType: "json" as const },
  { id: "free-to-play", name: "Free-To-Play Games", description: "Free-to-play games database", icon: "🎮", baseUrl: "https://www.freetogame.com/api", sampleEndpoint: "/games?sort-by=popularity&platform=pc", docsUrl: "https://www.freetogame.com/api-doc", responseType: "json" as const },
  { id: "cheapshark", name: "CheapShark", description: "Game deals and prices", icon: "🏷️", baseUrl: "https://www.cheapshark.com/api/1.0", sampleEndpoint: "/deals?storeID=1&upperPrice=15&pageSize=5", docsUrl: "https://apidocs.cheapshark.com", responseType: "json" as const },
];

export default function XApiGames() {
  return <CategoryApiPage title="Games APIs" subtitle="Pokémon, D&D, trivia, chess, and game deals" icon={<Gamepad2 className="h-8 w-8 text-primary" />} apis={apis} />;
}
