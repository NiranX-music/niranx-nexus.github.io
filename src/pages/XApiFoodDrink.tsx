import { CategoryApiPage } from "@/components/CategoryApiPage";
import { UtensilsCrossed } from "lucide-react";

const apis = [
  { id: "mealdb", name: "TheMealDB", description: "Random meals and recipes", icon: "🍕", baseUrl: "https://www.themealdb.com/api/json/v1/1", sampleEndpoint: "/random.php", docsUrl: "https://www.themealdb.com/api.php", responseType: "json" as const },
  { id: "cocktaildb", name: "TheCocktailDB", description: "Cocktail recipes", icon: "🍹", baseUrl: "https://www.thecocktaildb.com/api/json/v1/1", sampleEndpoint: "/random.php", docsUrl: "https://www.thecocktaildb.com/api.php", responseType: "json" as const },
  { id: "open-food", name: "Open Food Facts", description: "World food products database", icon: "🛒", baseUrl: "https://world.openfoodfacts.org/api/v0", sampleEndpoint: "/product/737628064502.json", docsUrl: "https://world.openfoodfacts.org/data", responseType: "json" as const },
  { id: "open-brewery", name: "Open Brewery DB", description: "Breweries around the world", icon: "🍺", baseUrl: "https://api.openbrewerydb.org/v1", sampleEndpoint: "/breweries?per_page=5", docsUrl: "https://www.openbrewerydb.org", responseType: "json" as const },
  { id: "coffee-api", name: "Coffee API", description: "Random coffee images", icon: "☕", baseUrl: "https://coffee.alexflipnote.dev", sampleEndpoint: "/random.json", docsUrl: "https://coffee.alexflipnote.dev", responseType: "json" as const },
  { id: "punkapi", name: "Punk API", description: "BrewDog beer catalogue", icon: "🍻", baseUrl: "https://api.punkapi.com/v2", sampleEndpoint: "/beers/random", docsUrl: "https://punkapi.com/documentation/v2", responseType: "json" as const },
];

export default function XApiFoodDrink() {
  return <CategoryApiPage title="Food & Drink APIs" subtitle="Meals, cocktails, breweries, and food product data" icon={<UtensilsCrossed className="h-8 w-8 text-primary" />} apis={apis} />;
}
