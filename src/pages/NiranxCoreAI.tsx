import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain, Key, Plus, Copy, Trash2, Activity, Zap, Code2, BarChart3,
  Sparkles, Image as ImageIcon, MessageSquare, Eye, EyeOff, Shield,
  CheckCircle2, AlertCircle, Terminal, Globe,
} from "lucide-react";

interface AIKey {
  id: string;
  key_name: string;
  api_key: string;
  key_prefix: string;
  is_active: boolean;
  monthly_quota: number;
  rate_limit_per_minute: number;
  total_requests: number;
  total_tokens: number;
  last_used_at: string | null;
  created_at: string;
}

interface AILog {
  id: string;
  endpoint: string;
  model: string | null;
  request_type: string;
  total_tokens: number | null;
  response_time_ms: number | null;
  status_code: number;
  created_at: string;
}

const APP_ORIGIN = typeof window !== "undefined" ? window.location.origin : "";
const API_BASE = `${APP_ORIGIN}/ai/u`;

const CODE_SNIPPETS = {
  curl: (key: string) => `curl -X POST ${API_BASE}/chat/completions \\
  -H "x-api-key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-v3.2",
    "messages": [{"role":"user","content":"Hello, NiranX Core AI!"}]
  }'`,
  js: (key: string) => `const res = await fetch("${API_BASE}/chat/completions", {
  method: "POST",
  headers: {
    "x-api-key": "${key}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "deepseek-v3.2",
    messages: [{ role: "user", content: "Hello, NiranX Core AI!" }],
  }),
});
const data = await res.json();
console.log(data.choices[0].message.content);`,
  python: (key: string) => `import requests

res = requests.post(
    "${API_BASE}/chat/completions",
    headers={"x-api-key": "${key}"},
    json={
        "model": "deepseek-v3.2",
        "messages": [{"role": "user", "content": "Hello, NiranX Core AI!"}],
    },
)
print(res.json()["choices"][0]["message"]["content"])`,
};

export default function NiranxCoreAI() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<AIKey[]>([]);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [showFullKey, setShowFullKey] = useState<Record<string, boolean>>({});
  const [snippetLang, setSnippetLang] = useState<"curl" | "js" | "python">("curl");
  const [testPrompt, setTestPrompt] = useState("Say hello in one sentence.");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const { data: keyData, error: keyErr } = await supabase.functions.invoke("niranx-core-ai-keys", {
        method: "GET",
      });
      if (keyErr) throw keyErr;
      setKeys(keyData?.keys || []);

      const { data: logData } = await supabase
        .from("niranx_core_ai_logs")
        .select("id,endpoint,model,request_type,total_tokens,response_time_ms,status_code,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs(logData || []);
    } catch (e: any) {
      toast.error("Failed to load: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) {
      toast.error("Enter a key name");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("niranx-core-ai-keys", {
        method: "POST",
        body: { key_name: newKeyName.trim() },
      });
      if (error) throw error;
      setRevealedSecret(data.secret);
      setNewKeyName("");
      await load();
      toast.success("API key created");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function deleteKey(id: string) {
    if (!confirm("Revoke this key permanently? This cannot be undone.")) return;
    try {
      const { error } = await supabase.functions.invoke(`niranx-core-ai-keys?id=${id}`, {
        method: "DELETE",
      });
      if (error) throw error;
      toast.success("Key revoked");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function copy(text: string, label = "Copied") {
    navigator.clipboard.writeText(text);
    toast.success(label);
  }

  async function runTest() {
    const activeKey = keys.find((k) => k.is_active);
    if (!activeKey) {
      toast.error("Create a key first");
      return;
    }
    setTesting(true);
    setTestResponse("");
    try {
      const res = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: { "x-api-key": activeKey.api_key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-v3.2",
          messages: [{ role: "user", content: testPrompt }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || `HTTP ${res.status}`);
      setTestResponse(data?.choices?.[0]?.message?.content || JSON.stringify(data, null, 2));
      load();
    } catch (e: any) {
      setTestResponse("Error: " + e.message);
    } finally {
      setTesting(false);
    }
  }

  // Stats
  const stats = useMemo(() => {
    const totalRequests = keys.reduce((s, k) => s + k.total_requests, 0);
    const totalTokens = logs.reduce((s, l) => s + (l.total_tokens || 0), 0);
    const successRate = logs.length
      ? Math.round((logs.filter((l) => l.status_code < 400).length / logs.length) * 100)
      : 100;
    const avgLatency = logs.length
      ? Math.round(logs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / logs.length)
      : 0;
    return { totalRequests, totalTokens, successRate, avgLatency, activeKeys: keys.filter((k) => k.is_active).length };
  }, [keys, logs]);

  // 7-day request chart data
  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    logs.forEach((l) => {
      const day = l.created_at.slice(0, 10);
      if (day in days) days[day]++;
    });
    return Object.entries(days);
  }, [logs]);
  const maxBar = Math.max(...chartData.map(([, n]) => n), 1);

  return (
    <>
      <Helmet>
        <title>NiranX Core AI — Developer API Platform</title>
        <meta name="description" content="NiranX Core AI: Issue API keys and access frontier AI models (chat & image) via the {app}/ai/u endpoint, powered by Scitely." />
        <link rel="canonical" href={`${APP_ORIGIN}/ai/u/portal`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent blur-xl opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-accent p-3 rounded-2xl">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  NiranX Core AI
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> Developer API platform · Powered by Scitely
                </p>
              </div>
            </div>
            <Button onClick={() => setCreateDialog(true)} size="lg" className="gap-2">
              <Plus className="h-4 w-4" /> New API Key
            </Button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Active Keys", value: stats.activeKeys, icon: Key, color: "from-blue-500 to-cyan-500" },
              { label: "Total Requests", value: stats.totalRequests.toLocaleString(), icon: Activity, color: "from-green-500 to-emerald-500" },
              { label: "Tokens Used", value: stats.totalTokens.toLocaleString(), icon: Zap, color: "from-yellow-500 to-orange-500" },
              { label: "Success Rate", value: `${stats.successRate}%`, icon: CheckCircle2, color: "from-purple-500 to-pink-500" },
              { label: "Avg Latency", value: `${stats.avgLatency}ms`, icon: Globe, color: "from-rose-500 to-red-500" },
            ].map((s) => (
              <Card key={s.label} className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${s.color}`}>
                      <s.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{s.label}</div>
                      <div className="text-xl font-bold truncate">{s.value}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="keys" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="keys"><Key className="h-4 w-4 mr-2" />Keys</TabsTrigger>
              <TabsTrigger value="usage"><BarChart3 className="h-4 w-4 mr-2" />Usage</TabsTrigger>
              <TabsTrigger value="docs"><Code2 className="h-4 w-4 mr-2" />Docs</TabsTrigger>
              <TabsTrigger value="playground"><Terminal className="h-4 w-4 mr-2" />Playground</TabsTrigger>
            </TabsList>

            {/* KEYS */}
            <TabsContent value="keys" className="space-y-4">
              {keys.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No API keys yet. Create one to get started.</p>
                </CardContent></Card>
              ) : keys.map((k) => (
                <Card key={k.id} className="border-border/50">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{k.key_name}</span>
                          <Badge variant={k.is_active ? "default" : "secondary"}>
                            {k.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs bg-muted/50 px-2 py-1 rounded max-w-full">
                          <span className="truncate">
                            {showFullKey[k.id] ? k.api_key : `${k.key_prefix}${"•".repeat(24)}`}
                          </span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0"
                            onClick={() => setShowFullKey((s) => ({ ...s, [k.id]: !s[k.id] }))}>
                            {showFullKey[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => copy(k.api_key, "Key copied")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteKey(k.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-border/30">
                      <div><div className="text-muted-foreground">Requests</div><div className="font-semibold">{k.total_requests.toLocaleString()}</div></div>
                      <div><div className="text-muted-foreground">Quota</div><div className="font-semibold">{k.monthly_quota.toLocaleString()}/mo</div></div>
                      <div><div className="text-muted-foreground">Rate</div><div className="font-semibold">{k.rate_limit_per_minute}/min</div></div>
                      <div><div className="text-muted-foreground">Last used</div><div className="font-semibold">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</div></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* USAGE */}
            <TabsContent value="usage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Last 7 days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-32">
                    {chartData.map(([day, count]) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-primary to-accent rounded-t transition-all"
                          style={{ height: `${(count / maxBar) * 100}%`, minHeight: count > 0 ? "4px" : "0" }} />
                        <div className="text-[10px] text-muted-foreground">{day.slice(5)}</div>
                        <div className="text-[10px] font-semibold">{count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Recent requests</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 sticky top-0"><tr>
                        <th className="text-left p-2">Time</th><th className="text-left p-2">Endpoint</th>
                        <th className="text-left p-2">Model</th><th className="text-left p-2">Tokens</th>
                        <th className="text-left p-2">Latency</th><th className="text-left p-2">Status</th>
                      </tr></thead>
                      <tbody>
                        {logs.length === 0 && (<tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No requests yet</td></tr>)}
                        {logs.map((l) => (
                          <tr key={l.id} className="border-t border-border/30">
                            <td className="p-2 whitespace-nowrap">{new Date(l.created_at).toLocaleTimeString()}</td>
                            <td className="p-2 font-mono">{l.endpoint}</td>
                            <td className="p-2">{l.model || "—"}</td>
                            <td className="p-2">{l.total_tokens || 0}</td>
                            <td className="p-2">{l.response_time_ms || 0}ms</td>
                            <td className="p-2">
                              <Badge variant={l.status_code < 400 ? "default" : "destructive"} className="text-[10px]">
                                {l.status_code}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DOCS */}
            <TabsContent value="docs" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Base URL</AlertTitle>
                <AlertDescription className="font-mono text-sm mt-1">{API_BASE}</AlertDescription>
              </Alert>

              <Card>
                <CardHeader><CardTitle className="text-base">Endpoints</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { m: "POST", p: "/chat/completions", d: "Chat with text models (OpenAI-compatible)", icon: MessageSquare },
                    { m: "POST", p: "/images/generations", d: "Generate images from prompts", icon: ImageIcon },
                    { m: "GET", p: "/models", d: "List all available models", icon: Brain },
                    { m: "GET", p: "/status", d: "Service health check (public)", icon: Activity },
                  ].map((e) => (
                    <div key={e.p} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <e.icon className="h-4 w-4 text-primary shrink-0" />
                      <Badge variant="outline" className="font-mono shrink-0">{e.m}</Badge>
                      <code className="text-sm font-mono">{e.p}</code>
                      <span className="text-xs text-muted-foreground ml-auto hidden md:inline">{e.d}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Quickstart</CardTitle>
                    <div className="flex gap-1">
                      {(["curl", "js", "python"] as const).map((l) => (
                        <Button key={l} size="sm" variant={snippetLang === l ? "default" : "ghost"} onClick={() => setSnippetLang(l)}>
                          {l}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                      {CODE_SNIPPETS[snippetLang](keys[0]?.api_key || "YOUR_API_KEY")}
                    </pre>
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => copy(CODE_SNIPPETS[snippetLang](keys[0]?.api_key || "YOUR_API_KEY"))}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Available models</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["deepseek-v3.2", "gpt-4o", "gpt-4o-mini", "claude-3.5-sonnet", "gemini-2.0-flash", "llama-3.3-70b", "flux", "dall-e-3"].map((m) => (
                    <Badge key={m} variant="secondary" className="justify-center py-2 font-mono text-xs">{m}</Badge>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PLAYGROUND */}
            <TabsContent value="playground" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Terminal className="h-4 w-4" /> Live Playground</CardTitle>
                  <CardDescription>Test your API key with a real request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Prompt</Label>
                    <Input value={testPrompt} onChange={(e) => setTestPrompt(e.target.value)} />
                  </div>
                  <Button onClick={runTest} disabled={testing || keys.length === 0} className="gap-2">
                    <Zap className="h-4 w-4" /> {testing ? "Sending..." : "Run Request"}
                  </Button>
                  {keys.length === 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Create an API key first to use the playground.</AlertDescription>
                    </Alert>
                  )}
                  {testResponse && (
                    <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono max-h-64 overflow-auto">
                      {testResponse}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Create dialog */}
      <Dialog open={createDialog} onOpenChange={(o) => { setCreateDialog(o); if (!o) setRevealedSecret(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{revealedSecret ? "Save your API key" : "Create new API key"}</DialogTitle>
            <DialogDescription>
              {revealedSecret ? "This is the only time you'll see the full key. Copy it now." : "Name your key so you remember what it's for."}
            </DialogDescription>
          </DialogHeader>
          {!revealedSecret ? (
            <>
              <div className="space-y-2">
                <Label>Key name</Label>
                <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Production app" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
                <Button onClick={createKey} disabled={creating}>{creating ? "Creating..." : "Create Key"}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="bg-muted p-3 rounded-lg font-mono text-xs break-all">{revealedSecret}</div>
              <Button onClick={() => { copy(revealedSecret, "API key copied"); setCreateDialog(false); setRevealedSecret(null); }} className="w-full gap-2">
                <Copy className="h-4 w-4" /> Copy & Close
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
