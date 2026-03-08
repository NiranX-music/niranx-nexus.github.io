import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Heart } from "lucide-react";

const apis = [
  { id: "disease-sh", name: "Disease.sh", description: "COVID-19 and disease tracking", icon: "🦠", baseUrl: "https://disease.sh/v3", sampleEndpoint: "/covid-19/all", docsUrl: "https://disease.sh/docs/", responseType: "json" as const },
  { id: "openfda", name: "OpenFDA", description: "FDA drug and device data", icon: "💊", baseUrl: "https://api.fda.gov", sampleEndpoint: "/drug/event.json?limit=3", docsUrl: "https://open.fda.gov/apis/", responseType: "json" as const },
  { id: "who-gho", name: "WHO GHO", description: "World Health Organization data", icon: "🏥", baseUrl: "https://ghoapi.azureedge.net/api", sampleEndpoint: "/Indicator?$filter=contains(IndicatorName,'life expectancy')&$top=5", docsUrl: "https://www.who.int/data/gho", responseType: "json" as const },
  { id: "health-gov", name: "Health.gov", description: "Health topics and guidelines", icon: "❤️", baseUrl: "https://health.gov/myhealthfinder/api/v3", sampleEndpoint: "/topicsearch.json?TopicId=30", docsUrl: "https://health.gov/our-work/national-health-initiatives/health-literacy/consumer-health-content/free-web-content/apis-developers", responseType: "json" as const },
];

export default function XApiHealth() {
  return <CategoryApiPage title="Health APIs" subtitle: "Disease tracking, FDA data, and health guidelines" icon={<Heart className="h-8 w-8 text-primary" />} apis={apis} />;
}
