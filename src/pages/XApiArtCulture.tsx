import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Palette } from "lucide-react";

const apis = [
  { id: "art-institute", name: "Art Institute Chicago", description: "Art Institute of Chicago collection", icon: "🖼️", baseUrl: "https://api.artic.edu/api/v1", sampleEndpoint: "/artworks?limit=5&fields=id,title,artist_display,image_id", docsUrl: "https://api.artic.edu/docs/", responseType: "json" as const },
  { id: "met-museum", name: "Metropolitan Museum", description: "Met Museum open-access collection", icon: "🏛️", baseUrl: "https://collectionapi.metmuseum.org/public/collection/v1", sampleEndpoint: "/search?q=sunflowers&isHighlight=true", docsUrl: "https://metmuseum.github.io", responseType: "json" as const },
  { id: "rijksmuseum", name: "Rijksmuseum", description: "Rijksmuseum collection data", icon: "🎨", baseUrl: "https://www.rijksmuseum.nl/api/en", sampleEndpoint: "/collection?key=0fiuZFh4&ps=5", docsUrl: "https://data.rijksmuseum.nl", responseType: "json" as const },
  { id: "lorem-picsum", name: "Lorem Picsum", description: "Random placeholder photos", icon: "📸", baseUrl: "https://picsum.photos", sampleEndpoint: "/v2/list?page=1&limit=6", docsUrl: "https://picsum.photos", responseType: "json" as const },
  { id: "color-api", name: "The Color API", description: "Color scheme generation", icon: "🎨", baseUrl: "https://www.thecolorapi.com", sampleEndpoint: "/id?hex=0047AB&format=json", docsUrl: "https://www.thecolorapi.com/docs", responseType: "json" as const },
  { id: "icon-horse", name: "Icon Horse", description: "Favicons for any website", icon: "🐴", baseUrl: "https://icon.horse", sampleEndpoint: "/icon/google.com", docsUrl: "https://icon.horse", responseType: "image" as const },
  { id: "placeholder", name: "Placeholder.com", description: "Dynamic placeholder images", icon: "🖼️", baseUrl: "https://via.placeholder.com", sampleEndpoint: "/300x200/09f/fff.png?text=Hello", docsUrl: "https://placeholder.com", responseType: "image" as const },
  { id: "colormind", name: "Colormind", description: "AI color palette generator", icon: "🌈", baseUrl: "http://colormind.io/api", sampleEndpoint: "/", docsUrl: "http://colormind.io/api-access/", responseType: "json" as const },
];

export default function XApiArtCulture() {
  return <CategoryApiPage title="Art & Culture APIs" subtitle="Museum collections, color palettes, and placeholder images" icon={<Palette className="h-8 w-8 text-primary" />} apis={apis} />;
}
