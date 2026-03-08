import { CategoryApiPage } from "@/components/CategoryApiPage";
import { TrendingUp } from "lucide-react";

const apis = [
  { id: "coingecko", name: "CoinGecko", description: "Cryptocurrency prices and data", icon: "💰", baseUrl: "https://api.coingecko.com/api/v3", sampleEndpoint: "/coins/markets?vs_currency=usd&per_page=5", docsUrl: "https://www.coingecko.com/api/documentation", responseType: "json" as const },
  { id: "coincap", name: "CoinCap", description: "Real-time crypto market data", icon: "📈", baseUrl: "https://api.coincap.io/v2", sampleEndpoint: "/assets?limit=5", docsUrl: "https://docs.coincap.io", responseType: "json" as const },
  { id: "genderize", name: "Genderize", description: "Predict gender from a name", icon: "🧬", baseUrl: "https://api.genderize.io", sampleEndpoint: "/?name=james", docsUrl: "https://genderize.io", responseType: "json" as const },
  { id: "agify", name: "Agify", description: "Predict age from a name", icon: "🎂", baseUrl: "https://api.agify.io", sampleEndpoint: "/?name=michael", docsUrl: "https://agify.io", responseType: "json" as const },
  { id: "nationalize", name: "Nationalize", description: "Predict nationality from a name", icon: "🌐", baseUrl: "https://api.nationalize.io", sampleEndpoint: "/?name=nathaniel", docsUrl: "https://nationalize.io", responseType: "json" as const },
  { id: "exchange-rate", name: "Exchange Rates", description: "Currency exchange rates", icon: "💱", baseUrl: "https://open.er-api.com/v6", sampleEndpoint: "/latest/USD", docsUrl: "https://www.exchangerate-api.com", responseType: "json" as const },
];

export default function XApiFinance() {
  return <CategoryApiPage title="Finance APIs" subtitle="Crypto prices, exchange rates, and name prediction tools" icon={<TrendingUp className="h-8 w-8 text-primary" />} apis={apis} />;
}
