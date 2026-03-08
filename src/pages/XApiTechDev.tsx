import { CategoryApiPage } from "@/components/CategoryApiPage";
import { Code } from "lucide-react";

const apis = [
  { id: "github-users", name: "GitHub Users", description: "GitHub public user profiles", icon: "🐙", baseUrl: "https://api.github.com", sampleEndpoint: "/users?per_page=5", docsUrl: "https://docs.github.com/rest", responseType: "json" as const },
  { id: "jsonplaceholder", name: "JSONPlaceholder", description: "Fake REST API for testing", icon: "🧪", baseUrl: "https://jsonplaceholder.typicode.com", sampleEndpoint: "/posts?_limit=5", docsUrl: "https://jsonplaceholder.typicode.com", responseType: "json" as const },
  { id: "reqres", name: "ReqRes", description: "Hosted REST-API for testing", icon: "🔄", baseUrl: "https://reqres.in", sampleEndpoint: "/api/users?page=1", docsUrl: "https://reqres.in", responseType: "json" as const },
  { id: "httpbin", name: "HTTPBin", description: "HTTP request/response testing", icon: "🌐", baseUrl: "https://httpbin.org", sampleEndpoint: "/get", docsUrl: "https://httpbin.org", responseType: "json" as const },
  { id: "ipify", name: "IPify", description: "Get your public IP address", icon: "🔗", baseUrl: "https://api.ipify.org", sampleEndpoint: "/?format=json", docsUrl: "https://www.ipify.org", responseType: "json" as const },
  { id: "hacker-news", name: "Hacker News", description: "Top tech news stories", icon: "🔶", baseUrl: "https://hacker-news.firebaseio.com/v0", sampleEndpoint: "/topstories.json?limitToFirst=10&orderBy=%22$key%22", docsUrl: "https://github.com/HackerNews/API", responseType: "json" as const },
  { id: "devto", name: "DEV.to", description: "Dev community articles", icon: "👩‍💻", baseUrl: "https://dev.to/api", sampleEndpoint: "/articles?per_page=5", docsUrl: "https://developers.forem.com/api", responseType: "json" as const },
  { id: "public-apis", name: "Public APIs List", description: "List of free public APIs", icon: "📋", baseUrl: "https://api.publicapis.org", sampleEndpoint: "/entries?category=Animals&https=true", docsUrl: "https://api.publicapis.org", responseType: "json" as const },
];

export default function XApiTechDev() {
  return <CategoryApiPage title="Tech & Dev APIs" subtitle="GitHub, testing endpoints, Hacker News, and developer tools" icon={<Code className="h-8 w-8 text-primary" />} apis={apis} />;
}
