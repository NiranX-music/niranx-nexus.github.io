import { CategoryApiPage } from "@/components/CategoryApiPage";
import { BookOpen } from "lucide-react";

const apis = [
  { id: "open-library", name: "Open Library", description: "Search millions of books", icon: "📚", baseUrl: "https://openlibrary.org", sampleEndpoint: "/search.json?q=javascript&limit=5", docsUrl: "https://openlibrary.org/developers/api", responseType: "json" as const },
  { id: "gutenberg", name: "Project Gutenberg", description: "Free public domain eBooks", icon: "📖", baseUrl: "https://gutendex.com", sampleEndpoint: "/books?search=shakespeare&page=1", docsUrl: "https://gutendex.com", responseType: "json" as const },
  { id: "wikipedia", name: "Wikipedia", description: "Wikipedia article search", icon: "📝", baseUrl: "https://en.wikipedia.org/api/rest_v1", sampleEndpoint: "/page/summary/Artificial_intelligence", docsUrl: "https://en.wikipedia.org/api/rest_v1/", responseType: "json" as const },
  { id: "dictionary", name: "Dictionary API", description: "English word definitions", icon: "📕", baseUrl: "https://api.dictionaryapi.dev/api/v2", sampleEndpoint: "/entries/en/hello", docsUrl: "https://dictionaryapi.dev", responseType: "json" as const },
  { id: "urban-dictionary", name: "Urban Dictionary", description: "Slang definitions", icon: "🗣️", baseUrl: "https://api.urbandictionary.com/v0", sampleEndpoint: "/define?term=yeet", docsUrl: "https://urbandictionary.com", responseType: "json" as const },
  { id: "quotable", name: "Quotable", description: "Famous quotes database", icon: "💬", baseUrl: "https://api.quotable.io", sampleEndpoint: "/quotes/random", docsUrl: "https://github.com/lukePeavey/quotable", responseType: "json" as const },
];

export default function XApiBooksEducation() {
  return <CategoryApiPage title="Books & Education APIs" subtitle="Books, dictionaries, Wikipedia, and famous quotes" icon={<BookOpen className="h-8 w-8 text-primary" />} apis={apis} />;
}
