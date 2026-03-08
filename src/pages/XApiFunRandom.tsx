import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Sparkles } from "lucide-react";

const apis = [
  { id: "chuck-norris", name: "Chuck Norris Jokes", description: "Random Chuck Norris jokes", icon: "🥋", baseUrl: "https://api.chucknorris.io", sampleEndpoint: "/jokes/random", docsUrl: "https://api.chucknorris.io", responseType: "json" as const },
  { id: "dad-jokes", name: "Dad Jokes", description: "Random dad jokes", icon: "😂", baseUrl: "https://icanhazdadjoke.com", sampleEndpoint: "/", docsUrl: "https://icanhazdadjoke.com/api", responseType: "json" as const },
  { id: "bored-api", name: "Bored API", description: "Random activity suggestions", icon: "🎯", baseUrl: "https://bored-api.appbrewery.com", sampleEndpoint: "/api/activity", docsUrl: "https://bored-api.appbrewery.com", responseType: "json" as const },
  { id: "advice-slip", name: "Advice Slip", description: "Random life advice", icon: "💡", baseUrl: "https://api.adviceslip.com", sampleEndpoint: "/advice", docsUrl: "https://api.adviceslip.com", responseType: "json" as const },
  { id: "useless-facts", name: "Useless Facts", description: "Random useless facts", icon: "🤓", baseUrl: "https://uselessfacts.jsph.pl", sampleEndpoint: "/api/v2/facts/random", docsUrl: "https://uselessfacts.jsph.pl", responseType: "json" as const },
  { id: "numbers-api", name: "Numbers API", description: "Interesting number facts", icon: "🔢", baseUrl: "http://numbersapi.com", sampleEndpoint: "/random/trivia?json", docsUrl: "http://numbersapi.com", responseType: "json" as const },
  { id: "trivia-api", name: "Open Trivia", description: "Trivia questions database", icon: "❓", baseUrl: "https://opentdb.com", sampleEndpoint: "/api.php?amount=5", docsUrl: "https://opentdb.com/api_config.php", responseType: "json" as const },
  { id: "evil-insult", name: "Evil Insult", description: "Random evil insults", icon: "😈", baseUrl: "https://evilinsult.com", sampleEndpoint: "/generate_insult.php?lang=en&type=json", docsUrl: "https://evilinsult.com/api", responseType: "json" as const },
  { id: "affirmations", name: "Affirmations", description: "Random positive affirmations", icon: "✨", baseUrl: "https://www.affirmations.dev", sampleEndpoint: "/", docsUrl: "https://www.affirmations.dev", responseType: "json" as const },
  { id: "yes-no", name: "Yes or No", description: "Random yes/no answer with GIF", icon: "🎲", baseUrl: "https://yesno.wtf", sampleEndpoint: "/api", docsUrl: "https://yesno.wtf", responseType: "json" as const },
  { id: "random-user", name: "Random User", description: "Generate random user profiles", icon: "👤", baseUrl: "https://randomuser.me", sampleEndpoint: "/api/?results=3", docsUrl: "https://randomuser.me/documentation", responseType: "json" as const },
  { id: "deck-of-cards", name: "Deck of Cards", description: "Shuffle and draw virtual cards", icon: "🃏", baseUrl: "https://deckofcardsapi.com/api", sampleEndpoint: "/deck/new/draw/?count=5", docsUrl: "https://deckofcardsapi.com", responseType: "json" as const },
];

export default function XApiFunRandom() {
  return <CategoryApiPage title="Fun & Random APIs" subtitle="Jokes, trivia, random facts, and entertainment" icon={<Sparkles className="h-8 w-8 text-primary" />} apis={apis} />;
}
