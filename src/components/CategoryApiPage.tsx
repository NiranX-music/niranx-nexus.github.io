import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Play, Copy, ExternalLink, Loader2, ChevronRight } from "lucide-react";

export interface ApiDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseUrl: string;
  sampleEndpoint: string;
  docsUrl?: string;
  responseType?: "json" | "image" | "text";
}

interface Props {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  apis: ApiDef[];
  accentClass?: string;
}

export function CategoryApiPage({ title, subtitle, icon, apis, accentClass = "" }: Props) {
  const [selected, setSelected] = useState<ApiDef | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const tryApi = useCallback(async (api: ApiDef) => {
    setSelected(api);
    setResponse("");
    setOpen(true);
    setLoading(true);
    const url = api.baseUrl + api.sampleEndpoint;
    try {
      if (api.responseType === "image") {
        setResponse(JSON.stringify({ imageUrl: url, note: "This endpoint returns an image." }, null, 2));
        setLoading(false);
        return;
      }
      const headers: Record<string, string> = {};
      if (api.id === "dad-jokes") headers["Accept"] = "application/json";
      const res = await fetch(url, { headers });
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("json")) {
        setResponse(JSON.stringify(await res.json(), null, 2));
      } else {
        const text = await res.text();
        try { setResponse(JSON.stringify(JSON.parse(text), null, 2)); }
        catch { setResponse(text.slice(0, 5000)); }
      }
    } catch (e: any) {
      setResponse(JSON.stringify({ error: e.message, hint: "Some APIs block browser requests (CORS). Try the URL directly." }, null, 2));
    } finally { setLoading(false); }
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-primary/10 ${accentClass}`}>{icon}</div>
          <span className="gradient-text">{title}</span>
        </h1>
        <p className="text-muted-foreground">{subtitle}</p>
        <Badge variant="secondary">{apis.length} APIs</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {apis.map((api, i) => (
          <motion.div key={api.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="h-full hover:border-primary/50 transition-all hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{api.icon}</span>
                  <CardTitle className="text-sm font-semibold">{api.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{api.description}</p>
                <div className="flex gap-1.5">
                  <Button size="sm" className="flex-1 text-xs h-8" onClick={() => tryApi(api)}>
                    <Play className="h-3 w-3 mr-1" /> Try It
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => { navigator.clipboard.writeText(api.baseUrl + api.sampleEndpoint); toast.success("URL copied!"); }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  {api.docsUrl && (
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                      <a href={api.docsUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selected?.icon}</span>
              {selected?.name}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-normal text-muted-foreground">Live Response</span>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline">GET</Badge>
                <code className="text-muted-foreground break-all text-[11px]">{selected.baseUrl + selected.sampleEndpoint}</code>
              </div>
              <div className="relative">
                {loading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <>
                    <ScrollArea className="h-[400px]">
                      <pre className="bg-muted p-4 rounded-lg text-xs font-mono whitespace-pre-wrap break-words">{response || "No response"}</pre>
                    </ScrollArea>
                    {response && (
                      <Button size="sm" variant="ghost" className="absolute top-2 right-4" onClick={() => { navigator.clipboard.writeText(response); toast.success("Copied!"); }}>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {selected.docsUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selected.docsUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" /> Docs</a>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => tryApi(selected)}>
                  <Play className="h-3.5 w-3.5 mr-1" /> Retry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
