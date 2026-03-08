import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, Copy, ExternalLink, Loader2, Globe, Layers, ChevronRight } from "lucide-react";
import { freeApis, apiCategories, type FreeApi } from "@/data/freeApis";

export default function XAPIExplorer() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedApi, setSelectedApi] = useState<FreeApi | null>(null);
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const filtered = useMemo(() => {
    return freeApis.filter((api) => {
      const matchCat = activeCategory === "All" || api.category === activeCategory;
      const matchSearch =
        !search ||
        api.name.toLowerCase().includes(search.toLowerCase()) ||
        api.description.toLowerCase().includes(search.toLowerCase()) ||
        api.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { All: freeApis.length };
    freeApis.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleTryIt = useCallback(async (api: FreeApi) => {
    setSelectedApi(api);
    setResponse("");
    setShowDialog(true);
    setIsLoading(true);

    const url = api.baseUrl + api.sampleEndpoint;

    try {
      const headers: Record<string, string> = {};
      if (api.id === "dad-jokes") {
        headers["Accept"] = "application/json";
      }

      if (api.responseType === "image") {
        setResponse(JSON.stringify({ imageUrl: url, note: "This endpoint returns an image. Open the URL directly." }, null, 2));
        setIsLoading(false);
        return;
      }

      const res = await fetch(url, { headers });
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("json")) {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        const text = await res.text();
        try {
          const parsed = JSON.parse(text);
          setResponse(JSON.stringify(parsed, null, 2));
        } catch {
          setResponse(text.slice(0, 5000));
        }
      }
    } catch (e: any) {
      setResponse(JSON.stringify({ error: e.message, hint: "Some APIs may block browser requests (CORS). Try opening the URL directly." }, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    toast.success("Response copied!");
  };

  const copyUrl = (api: FreeApi) => {
    navigator.clipboard.writeText(api.baseUrl + api.sampleEndpoint);
    toast.success("URL copied!");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <span className="gradient-text">XAPI Explorer</span>
        </h1>
        <p className="text-muted-foreground">
          {freeApis.length} free public APIs — no API key required. Browse, test, and explore live data.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search APIs by name, description, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Pills */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2 flex-wrap">
          {apiCategories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="shrink-0"
            >
              {cat}
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                {categoryCount[cat] || 0}
              </Badge>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {freeApis.length} APIs
      </p>

      {/* API Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((api, i) => (
            <motion.div
              key={api.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              layout
            >
              <Card className="h-full hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] group cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{api.icon}</span>
                      <CardTitle className="text-sm font-semibold leading-tight">
                        {api.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {api.responseType.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {api.description}
                  </p>
                  <Badge variant="secondary" className="text-[10px]">
                    {api.category}
                  </Badge>
                  <div className="flex gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 text-xs h-8"
                      onClick={() => handleTryIt(api)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Try It
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => copyUrl(api)}
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {api.docsUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a href={api.docsUrl} target="_blank" rel="noreferrer" title="Docs">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No APIs found</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedApi?.icon}</span>
              {selectedApi?.name}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-normal text-muted-foreground">Live Response</span>
            </DialogTitle>
          </DialogHeader>

          {selectedApi && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline">GET</Badge>
                <code className="text-muted-foreground break-all text-[11px]">
                  {selectedApi.baseUrl + selectedApi.sampleEndpoint}
                </code>
              </div>

              <div className="relative">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px]">
                      <pre className="bg-muted p-4 rounded-lg text-xs font-mono whitespace-pre-wrap break-words">
                        {response || "No response"}
                      </pre>
                    </ScrollArea>
                    {response && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-4"
                        onClick={copyResponse}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {selectedApi.docsUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedApi.docsUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Documentation
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleTryIt(selectedApi)}>
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
