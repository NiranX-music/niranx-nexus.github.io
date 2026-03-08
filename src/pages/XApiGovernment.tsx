import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Landmark } from "lucide-react";

const apis = [
  { id: "data-usa", name: "Data USA", description: "US census and economic data", icon: "🇺🇸", baseUrl: "https://datausa.io/api", sampleEndpoint: "/data?drilldowns=Nation&measures=Population&year=latest", docsUrl: "https://datausa.io/about/api/", responseType: "json" as const },
  { id: "fbi-wanted", name: "FBI Wanted", description: "FBI most wanted list", icon: "🔍", baseUrl: "https://api.fbi.gov", sampleEndpoint: "/@wanted?pageSize=5", docsUrl: "https://api.fbi.gov/docs", responseType: "json" as const },
  { id: "federal-register", name: "Federal Register", description: "US government documents", icon: "📜", baseUrl: "https://www.federalregister.gov/api/v1", sampleEndpoint: "/documents.json?per_page=5", docsUrl: "https://www.federalregister.gov/developers/documentation/api/v1", responseType: "json" as const },
  { id: "open-fec", name: "OpenFEC", description: "US campaign finance data", icon: "🗳️", baseUrl: "https://api.open.fec.gov/v1", sampleEndpoint: "/candidates?api_key=DEMO_KEY&per_page=5", docsUrl: "https://api.open.fec.gov/developers/", responseType: "json" as const },
];

export default function XApiGovernment() {
  return <CategoryApiPage title="Government APIs" subtitle="Census data, FBI wanted list, and federal documents" icon={<Landmark className="h-8 w-8 text-primary" />} apis={apis} />;
}
