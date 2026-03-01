import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Play, Code, BookOpen, Zap, Copy, Clock, CheckCircle, XCircle } from "lucide-react";

const apiEndpoints = [
  { name: "AI Chat", path: "ai-chat", method: "POST", desc: "Send messages to the AI assistant", body: '{"message": "Hello AI"}' },
  { name: "Groq Chat", path: "groq-chat", method: "POST", desc: "Fast AI chat with Groq models", body: '{"messages": [{"role": "user", "content": "Hello"}], "model": "llama-3.3-70b-versatile"}' },
  { name: "DeepSeek Chat", path: "deepseek-chat", method: "POST", desc: "AI coding assistant", body: '{"messages": [{"role": "user", "content": "Help me code"}]}' },
  { name: "Summarize Notes", path: "summarize-notes", method: "POST", desc: "Summarize text content", body: '{"content": "Your text to summarize..."}' },
  { name: "Summarize YouTube", path: "summarize-youtube", method: "POST", desc: "Summarize YouTube videos", body: '{"url": "https://youtube.com/watch?v=..."}' },
  { name: "Generate Agora Token", path: "generate-agora-token", method: "POST", desc: "Get live class token", body: '{"channelName": "test-channel"}' },
  { name: "Google Search", path: "google-search", method: "POST", desc: "Search the web", body: '{"query": "search term"}' },
];

export default function APIConsole() {
  const { user } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
  const [requestBody, setRequestBody] = useState(apiEndpoints[0].body);
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleTest = async () => {
    if (!user) {
      toast.error("Please sign in to test APIs");
      return;
    }
    setIsLoading(true);
    setResponse("");
    setStatusCode(null);
    const start = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke(selectedEndpoint.path, {
        body: JSON.parse(requestBody),
      });
      setResponseTime(Date.now() - start);
      if (error) {
        setStatusCode(error.message.includes("401") ? 401 : 500);
        setResponse(JSON.stringify({ error: error.message }, null, 2));
      } else {
        setStatusCode(200);
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (e: any) {
      setResponseTime(Date.now() - start);
      setStatusCode(500);
      setResponse(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
          <Code className="h-8 w-8" />
          NiranX Universe API Console
        </h1>
        <p className="text-muted-foreground mt-1">Test and explore all available APIs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {apiEndpoints.map(ep => (
                  <button
                    key={ep.path}
                    onClick={() => { setSelectedEndpoint(ep); setRequestBody(ep.body); setResponse(""); setStatusCode(null); }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedEndpoint.path === ep.path ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{ep.method}</Badge>
                      <span className="font-medium text-sm">{ep.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ep.desc}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Request/Response */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {selectedEndpoint.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge>{selectedEndpoint.method}</Badge>
                  <code className="text-xs">/functions/v1/{selectedEndpoint.path}</code>
                </CardDescription>
              </div>
              <Button onClick={handleTest} disabled={isLoading}>
                <Play className="h-4 w-4 mr-2" />
                {isLoading ? "Running..." : "Send Request"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="request">
              <TabsList>
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">
                  Response
                  {statusCode && (
                    <Badge variant={statusCode < 400 ? "default" : "destructive"} className="ml-2 text-xs">
                      {statusCode}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="request" className="space-y-4">
                <div className="space-y-2">
                  <Label>Request Body (JSON)</Label>
                  <Textarea
                    value={requestBody}
                    onChange={e => setRequestBody(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
              <TabsContent value="response">
                <div className="space-y-3">
                  {responseTime !== null && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{responseTime}ms
                      </span>
                      <span className="flex items-center gap-1">
                        {statusCode && statusCode < 400 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                        Status: {statusCode}
                      </span>
                    </div>
                  )}
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap">
                      {response || "Send a request to see the response"}
                    </pre>
                    {response && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => { navigator.clipboard.writeText(response); toast.success("Copied!"); }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
