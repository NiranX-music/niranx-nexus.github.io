import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Play, Sparkles, Copy, RotateCcw, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AI_PROVIDERS = [
  { id: "lovable", name: "Lovable AI", models: ["google/gemini-3-flash-preview", "google/gemini-2.5-flash", "openai/gpt-5-mini"] },
];

export function XstellarAICoder() {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState({ html: "", css: "", js: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("google/gemini-3-flash-preview");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generateCode = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    const userMsg = { role: "user" as const, content: prompt };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);

    try {
      const { data, error } = await supabase.functions.invoke("website-ai-chat", {
        body: {
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          currentCode: generatedCode,
        },
      });

      if (error) throw error;

      if (data?.code) {
        setGeneratedCode({
          html: data.code.html || generatedCode.html,
          css: data.code.css || generatedCode.css,
          js: data.code.js || generatedCode.js,
        });
        setChatHistory([...newHistory, { role: "assistant", content: data.message || "Code updated." }]);
        toast({ title: "Code generated successfully" });
      }
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  const previewCode = () => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>${generatedCode.css}</style></head><body>${generatedCode.html}<script>${generatedCode.js}<\/script></body></html>`);
    doc.close();
  };

  const copyCode = () => {
    const full = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${generatedCode.css}\n</style>\n</head>\n<body>\n${generatedCode.html}\n<script>\n${generatedCode.js}\n</script>\n</body>\n</html>`;
    navigator.clipboard.writeText(full);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
      {/* Left: AI Chat + Code Editor */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Code Generator
              </CardTitle>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.flatMap(p => p.models.map(m => (
                    <SelectItem key={m} value={m} className="text-xs">{m.split("/")[1]}</SelectItem>
                  )))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chat history */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto mb-3">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`text-xs p-2 rounded ${msg.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
                  <Badge variant="outline" className="text-[10px] mb-1">{msg.role}</Badge>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                className="min-h-[60px] text-sm"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generateCode(); } }}
              />
              <Button onClick={generateCode} disabled={isGenerating} size="icon" className="shrink-0">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Code className="h-4 w-4" /> Code</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={copyCode}><Copy className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { setGeneratedCode({ html: "", css: "", js: "" }); setChatHistory([]); }}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="html">
              <TabsList className="h-8">
                <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
                <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
                <TabsTrigger value="js" className="text-xs">JS</TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <Textarea value={generatedCode.html} onChange={(e) => setGeneratedCode(p => ({ ...p, html: e.target.value }))} className="font-mono text-xs min-h-[250px] bg-muted/30" />
              </TabsContent>
              <TabsContent value="css">
                <Textarea value={generatedCode.css} onChange={(e) => setGeneratedCode(p => ({ ...p, css: e.target.value }))} className="font-mono text-xs min-h-[250px] bg-muted/30" />
              </TabsContent>
              <TabsContent value="js">
                <Textarea value={generatedCode.js} onChange={(e) => setGeneratedCode(p => ({ ...p, js: e.target.value }))} className="font-mono text-xs min-h-[250px] bg-muted/30" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Play className="h-4 w-4" /> Live Preview</CardTitle>
            <Button size="sm" onClick={previewCode} className="gap-1.5 text-xs">
              <Play className="h-3 w-3" /> Run
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-background">
            <iframe
              ref={iframeRef}
              className="w-full min-h-[500px]"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
