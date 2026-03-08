import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Cloud } from "lucide-react";

const apis = [
  { id: "open-meteo", name: "Open-Meteo", description: "Free weather forecast API", icon: "🌤️", baseUrl: "https://api.open-meteo.com/v1", sampleEndpoint: "/forecast?latitude=52.52&longitude=13.41&current_weather=true", docsUrl: "https://open-meteo.com", responseType: "json" as const },
  { id: "ip-api", name: "IP-API", description: "IP geolocation lookup", icon: "📍", baseUrl: "http://ip-api.com", sampleEndpoint: "/json/", docsUrl: "https://ip-api.com/docs", responseType: "json" as const },
  { id: "restcountries", name: "REST Countries", description: "Country information", icon: "🗺️", baseUrl: "https://restcountries.com/v3.1", sampleEndpoint: "/all?fields=name,capital,flags,population", docsUrl: "https://restcountries.com", responseType: "json" as const },
  { id: "zippopotamus", name: "Zippopotam.us", description: "Zip/postal code lookup", icon: "📮", baseUrl: "https://api.zippopotam.us", sampleEndpoint: "/us/10001", docsUrl: "https://www.zippopotam.us", responseType: "json" as const },
  { id: "worldtime", name: "WorldTimeAPI", description: "Current time for any timezone", icon: "🕐", baseUrl: "https://worldtimeapi.org/api", sampleEndpoint: "/timezone/America/New_York", docsUrl: "https://worldtimeapi.org", responseType: "json" as const },
  { id: "universities", name: "Universities", description: "Universities search by country", icon: "🏫", baseUrl: "http://universities.hipolabs.com", sampleEndpoint: "/search?country=United+States&limit=5", docsUrl: "https://github.com/Hipo/university-domains-list-api", responseType: "json" as const },
  { id: "country-flags", name: "Country Flags", description: "Country flag images", icon: "🏳️", baseUrl: "https://flagcdn.com", sampleEndpoint: "/w320/us.png", docsUrl: "https://flagpedia.net/download/api", responseType: "image" as const },
  { id: "geocode-xyz", name: "Geocode.xyz", description: "Forward/reverse geocoding", icon: "🧭", baseUrl: "https://geocode.xyz", sampleEndpoint: "/51.5074,-0.1278?json=1", docsUrl: "https://geocode.xyz/api", responseType: "json" as const },
];

export default function XApiWeatherGeo() {
  return <CategoryApiPage title="Weather & Geo APIs" subtitle="Weather forecasts, geolocation, countries, and timezone data" icon={<Cloud className="h-8 w-8 text-primary" />} apis={apis} />;
}
