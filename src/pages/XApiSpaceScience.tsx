import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Rocket } from "lucide-react";

const apis = [
  { id: "nasa-apod", name: "NASA APOD", description: "Astronomy Picture of the Day", icon: "🌌", baseUrl: "https://api.nasa.gov", sampleEndpoint: "/planetary/apod?api_key=DEMO_KEY", docsUrl: "https://api.nasa.gov", responseType: "json" as const },
  { id: "spacex-launches", name: "SpaceX Launches", description: "Latest SpaceX launch data", icon: "🚀", baseUrl: "https://api.spacexdata.com/v5", sampleEndpoint: "/launches/latest", docsUrl: "https://github.com/r-spacex/SpaceX-API", responseType: "json" as const },
  { id: "iss-location", name: "ISS Location", description: "Real-time ISS position", icon: "🛸", baseUrl: "http://api.open-notify.org", sampleEndpoint: "/iss-now.json", docsUrl: "http://open-notify.org/Open-Notify-API/", responseType: "json" as const },
  { id: "people-in-space", name: "People in Space", description: "Current astronauts in space", icon: "👨‍🚀", baseUrl: "http://api.open-notify.org", sampleEndpoint: "/astros.json", docsUrl: "http://open-notify.org/Open-Notify-API/", responseType: "json" as const },
  { id: "usgs-earthquakes", name: "USGS Earthquakes", description: "Recent earthquake data worldwide", icon: "🌍", baseUrl: "https://earthquake.usgs.gov", sampleEndpoint: "/fdsnws/event/1/query?format=geojson&limit=5", docsUrl: "https://earthquake.usgs.gov/fdsnws/event/1/", responseType: "json" as const },
  { id: "sunrise-sunset", name: "Sunrise & Sunset", description: "Sunrise/sunset times for any location", icon: "🌅", baseUrl: "https://api.sunrise-sunset.org", sampleEndpoint: "/json?lat=36.7201600&lng=-4.4203400", docsUrl: "https://sunrise-sunset.org/api", responseType: "json" as const },
  { id: "solar-system", name: "Solar System", description: "Solar system bodies data", icon: "☀️", baseUrl: "https://api.le-systeme-solaire.net/rest", sampleEndpoint: "/bodies?filter[]=isPlanet,eq,true", docsUrl: "https://api.le-systeme-solaire.net", responseType: "json" as const },
  { id: "space-news", name: "Space News", description: "Latest space flight news", icon: "📰", baseUrl: "https://api.spaceflightnewsapi.net/v4", sampleEndpoint: "/articles/?limit=5", docsUrl: "https://api.spaceflightnewsapi.net", responseType: "json" as const },
  { id: "nasa-mars", name: "NASA Mars Photos", description: "Mars rover photos", icon: "🔴", baseUrl: "https://api.nasa.gov", sampleEndpoint: "/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&page=1&api_key=DEMO_KEY", docsUrl: "https://api.nasa.gov", responseType: "json" as const },
  { id: "nasa-epic", name: "NASA EPIC", description: "Earth Polychromatic Imaging Camera", icon: "🌎", baseUrl: "https://api.nasa.gov", sampleEndpoint: "/EPIC/api/natural?api_key=DEMO_KEY", docsUrl: "https://api.nasa.gov", responseType: "json" as const },
];

export default function XApiSpaceScience() {
  return <CategoryApiPage title="Space & Science APIs" subtitle="Explore the cosmos with live NASA, SpaceX, and earthquake data" icon={<Rocket className="h-8 w-8 text-primary" />} apis={apis} />;
}
