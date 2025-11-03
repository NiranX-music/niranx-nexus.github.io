import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

export default function WebSearch() {
  const [query, setQuery] = useState("");
  const [activeEngine, setActiveEngine] = useState("google");
  const [searchUrl, setSearchUrl] = useState("");

  const searchEngines = {
    google: "https://www.google.com/search?igu=1&q=",
    bing: "https://www.bing.com/search?q=",
    yahoo: "https://search.yahoo.com/search?p=",
    perplexity: "https://www.perplexity.ai/search?q=",
    duckduckgo: "https://duckduckgo.com/?q=",
  };

  const handleSearch = () => {
    if (query.trim()) {
      const baseUrl = searchEngines[activeEngine as keyof typeof searchEngines];
      setSearchUrl(baseUrl + encodeURIComponent(query));
    }
  };

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold gradient-text mb-2">Search Anything on Web</h1>
        <p className="text-muted-foreground">
          Search across multiple search engines
        </p>
      </div>

      <Card className="p-4 mb-4 flex-shrink-0">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter your search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="text-lg"
          />
          <Button onClick={handleSearch} size="lg">
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>

        <Tabs value={activeEngine} onValueChange={setActiveEngine} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="bing">Bing</TabsTrigger>
            <TabsTrigger value="yahoo">Yahoo</TabsTrigger>
            <TabsTrigger value="perplexity">Perplexity</TabsTrigger>
            <TabsTrigger value="duckduckgo">DuckDuckGo</TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      {searchUrl && (
        <div className="relative flex-1 rounded-lg overflow-hidden border min-h-0">
          <iframe
            src={searchUrl}
            className="w-full h-full"
            title={`Search results from ${activeEngine}`}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )}

      {!searchUrl && (
        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Enter a search query to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
