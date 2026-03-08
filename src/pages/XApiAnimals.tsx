import { CategoryApiPage } from "@/components/CategoryApiPage";
import { PawPrint } from "lucide-react";

const apis = [
  { id: "dog-api", name: "Dog API", description: "Random dog images", icon: "🐕", baseUrl: "https://dog.ceo/api", sampleEndpoint: "/breeds/image/random", docsUrl: "https://dog.ceo/dog-api/", responseType: "json" as const },
  { id: "cat-facts", name: "Cat Facts", description: "Random cat facts", icon: "🐱", baseUrl: "https://catfact.ninja", sampleEndpoint: "/fact", docsUrl: "https://catfact.ninja", responseType: "json" as const },
  { id: "shibe-online", name: "Shibe.online", description: "Random shiba inu images", icon: "🐕‍🦺", baseUrl: "https://shibe.online/api", sampleEndpoint: "/shibes?count=4", docsUrl: "https://shibe.online", responseType: "json" as const },
  { id: "random-dog", name: "Random Dog", description: "Random dog images & videos", icon: "🦮", baseUrl: "https://random.dog", sampleEndpoint: "/woof.json", docsUrl: "https://random.dog", responseType: "json" as const },
  { id: "random-fox", name: "Random Fox", description: "Random fox images", icon: "🦊", baseUrl: "https://randomfox.ca", sampleEndpoint: "/floof/", docsUrl: "https://randomfox.ca", responseType: "json" as const },
  { id: "http-cat", name: "HTTP Cat", description: "Cat images for HTTP status codes", icon: "😸", baseUrl: "https://http.cat", sampleEndpoint: "/200", docsUrl: "https://http.cat", responseType: "image" as const },
  { id: "dog-ceo-list", name: "Dog Breeds", description: "List all dog breeds", icon: "🐩", baseUrl: "https://dog.ceo/api", sampleEndpoint: "/breeds/list/all", docsUrl: "https://dog.ceo/dog-api/", responseType: "json" as const },
  { id: "placebear", name: "PlaceBear", description: "Placeholder bear images", icon: "🐻", baseUrl: "https://placebear.com", sampleEndpoint: "/300/300", docsUrl: "https://placebear.com", responseType: "image" as const },
];

export default function XApiAnimals() {
  return <CategoryApiPage title="Animals APIs" subtitle="Dogs, cats, foxes, and bears — random animal images and facts" icon={<PawPrint className="h-8 w-8 text-primary" />} apis={apis} />;
}
