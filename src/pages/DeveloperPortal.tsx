import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Key, Plus, Trash2, Copy, Eye, EyeOff, Activity, Clock, Shield, 
  Zap, Code2, ExternalLink, Terminal, BarChart3, Globe, Webhook,
  BookOpen, ChevronRight, Play, Check, RefreshCw, AlertTriangle
} from "lucide-react";

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  rate_limit_per_minute: number;
  total_requests: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface UsageLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  created_at: string;
}

interface WebhookEntry {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
}

const API_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'tophenwypevlfbznlwil'}.supabase.co/functions/v1/developer-api`;

const ENDPOINTS = [
  { method: "GET", path: "/v1/tasks", desc: "List all tasks", auth: true, params: "?status=pending&limit=20&page=1" },
  { method: "POST", path: "/v1/tasks", desc: "Create a task", auth: true, body: '{"title":"Study Math","subject":"Math","priority":"high"}' },
  { method: "PUT", path: "/v1/tasks/:id", desc: "Update a task", auth: true, body: '{"completed":true}' },
  { method: "DELETE", path: "/v1/tasks/:id", desc: "Delete a task", auth: true },
  { method: "GET", path: "/v1/pomodoro", desc: "List focus sessions", auth: true },
  { method: "POST", path: "/v1/pomodoro", desc: "Start a focus session", auth: true, body: '{"duration_minutes":25,"subject":"Physics"}' },
  { method: "GET", path: "/v1/calendar", desc: "List calendar events", auth: true },
  { method: "POST", path: "/v1/calendar", desc: "Create calendar event", auth: true, body: '{"title":"Math Class","day_of_week":"Monday","start_time":"09:00","end_time":"10:00"}' },
  { method: "GET", path: "/v1/storage", desc: "Get storage usage & files", auth: true },
  { method: "GET", path: "/v1/profile", desc: "Get user profile", auth: true },
  { method: "PUT", path: "/v1/profile", desc: "Update profile", auth: true, body: '{"display_name":"NewName","bio":"Hello!"}' },
  { method: "GET", path: "/v1/flashcards", desc: "List flashcard decks", auth: true },
  { method: "GET", path: "/v1/flashcards/:id", desc: "Get deck with cards", auth: true },
  { method: "POST", path: "/v1/flashcards", desc: "Create flashcard deck", auth: true, body: '{"title":"Biology Terms","subject":"Biology"}' },
  { method: "GET", path: "/v1/notes", desc: "List Cornell notes", auth: true },
  { method: "POST", path: "/v1/notes", desc: "Create a note", auth: true, body: '{"title":"Lecture 1","content":"Key points...","subject":"History"}' },
  { method: "GET", path: "/v1/streaks", desc: "Get study streak data", auth: true },
  { method: "GET", path: "/v1/exams", desc: "List upcoming exams", auth: true },
  { method: "POST", path: "/v1/exams", desc: "Add an exam", auth: true, body: '{"name":"Final Exam","subject":"Math","exam_date":"2026-04-15"}' },
  { method: "GET", path: "/v1/status", desc: "API health & available endpoints", auth: false },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DeveloperPortal() {
  const { user, session } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(["read"]);
  const [newKeyRate, setNewKeyRate] = useState(60);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Try It panel
  const [tryEndpoint, setTryEndpoint] = useState(ENDPOINTS[0]);
  const [tryResponse, setTryResponse] = useState("");
  const [tryLoading, setTryLoading] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState("");

  // Stats
  const [stats, setStats] = useState({ totalRequests: 0, avgResponseTime: 0, errorRate: 0 });

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [keysRes, logsRes, webhooksRes] = await Promise.all([
      supabase.from("developer_api_keys").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("api_usage_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("developer_webhooks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setApiKeys((keysRes.data as any[]) || []);
    const logs = (logsRes.data as any[]) || [];
    setUsageLogs(logs);
    setWebhooks((webhooksRes.data as any[]) || []);

    if (logs.length > 0) {
      const totalReqs = logs.length;
      const avgTime = logs.reduce((a: number, l: any) => a + (l.response_time_ms || 0), 0) / totalReqs;
      const errors = logs.filter((l: any) => l.status_code >= 400).length;
      setStats({ totalRequests: totalReqs, avgResponseTime: Math.round(avgTime), errorRate: Math.round((errors / totalReqs) * 100) });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const createApiKey = async () => {
    if (!user || !newKeyName.trim()) return;
    const { data: keyText } = await supabase.rpc("generate_api_key");
    if (!keyText) { toast.error("Failed to generate key"); return; }
    const prefix = (keyText as string).substring(0, 12) + "...";
    const { error } = await supabase.from("developer_api_keys").insert({
      user_id: user.id,
      key_name: newKeyName.trim(),
      api_key: keyText,
      key_prefix: prefix,
      permissions: newKeyPerms,
      rate_limit_per_minute: newKeyRate,
    });
    if (error) { toast.error("Failed to create key"); return; }
    setCreatedKey(keyText as string);
    toast.success("API key created!");
    loadData();
  };

  const deleteKey = async (id: string) => {
    await supabase.from("developer_api_keys").delete().eq("id", id);
    toast.success("Key deleted");
    loadData();
  };

  const toggleKey = async (id: string, active: boolean) => {
    await supabase.from("developer_api_keys").update({ is_active: active }).eq("id", id);
    loadData();
  };

  const tryApi = async () => {
    setTryLoading(true);
    setTryResponse("");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (selectedApiKey) {
      headers["x-api-key"] = selectedApiKey;
    } else if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    const endpoint = `${API_BASE}${tryEndpoint.path}`;
    try {
      const opts: RequestInit = { method: tryEndpoint.method, headers };
      if (tryEndpoint.body && ["POST", "PUT"].includes(tryEndpoint.method)) {
        opts.body = tryEndpoint.body;
      }
      const res = await fetch(endpoint, opts);
      const data = await res.json();
      setTryResponse(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTryResponse(JSON.stringify({ error: e.message }, null, 2));
    }
    setTryLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Code2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
            <p className="text-muted-foreground text-sm">Build integrations with real NiranX API endpoints</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="text-xs"><Globe className="h-3 w-3 mr-1" /> REST API v1</Badge>
          <Badge variant="outline" className="text-xs"><Shield className="h-3 w-3 mr-1" /> API Key Auth</Badge>
          <Badge variant="outline" className="text-xs"><Zap className="h-3 w-3 mr-1" /> Rate Limited</Badge>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "API Keys", value: apiKeys.length, icon: Key },
          { label: "Total Requests", value: stats.totalRequests.toLocaleString(), icon: Activity },
          { label: "Avg Response", value: `${stats.avgResponseTime}ms`, icon: Clock },
          { label: "Error Rate", value: `${stats.errorRate}%`, icon: AlertTriangle },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><s.icon className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="keys"><Key className="h-3.5 w-3.5 mr-1.5" />API Keys</TabsTrigger>
          <TabsTrigger value="explorer"><Play className="h-3.5 w-3.5 mr-1.5" />Try It</TabsTrigger>
          <TabsTrigger value="usage"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Usage</TabsTrigger>
          <TabsTrigger value="docs"><BookOpen className="h-3.5 w-3.5 mr-1.5" />Docs</TabsTrigger>
        </TabsList>

        {/* ===== API KEYS TAB ===== */}
        <TabsContent value="keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your API Keys</h2>
            <Button onClick={() => { setShowCreateKey(true); setCreatedKey(null); setNewKeyName(""); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Key
            </Button>
          </div>

          {apiKeys.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Key className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No API keys yet</p>
                <p className="text-sm">Create your first key to start using the API</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{key.key_name}</span>
                          <Badge variant={key.is_active ? "default" : "secondary"} className="text-[10px] h-5">
                            {key.is_active ? "Active" : "Disabled"}
                          </Badge>
                          {key.permissions.map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px] h-5">{p}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground font-mono">
                            {showKeys[key.id] ? key.api_key : key.key_prefix}
                          </code>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowKeys((p) => ({ ...p, [key.id]: !p[key.id] }))}>
                            {showKeys[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(key.api_key)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground">
                          <span>{key.total_requests.toLocaleString()} requests</span>
                          <span>{key.rate_limit_per_minute}/min limit</span>
                          {key.last_used_at && <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={key.is_active} onCheckedChange={(v) => toggleKey(key.id, v)} />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteKey(key.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== TRY IT TAB ===== */}
        <TabsContent value="explorer" className="space-y-4">
          <div className="grid md:grid-cols-5 gap-4">
            {/* Endpoint List */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {ENDPOINTS.map((ep, i) => (
                      <button
                        key={i}
                        className={`w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-2 border-b border-border/30 ${
                          tryEndpoint === ep ? "bg-muted/70" : ""
                        }`}
                        onClick={() => { setTryEndpoint(ep); setTryResponse(""); }}
                      >
                        <Badge variant="outline" className={`text-[10px] font-mono px-1.5 ${METHOD_COLORS[ep.method]}`}>
                          {ep.method}
                        </Badge>
                        <span className="text-xs font-mono flex-1 truncate">{ep.path}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </button>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Request/Response */}
            <div className="md:col-span-3 space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`font-mono ${METHOD_COLORS[tryEndpoint.method]}`}>
                        {tryEndpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{tryEndpoint.path}</code>
                    </div>
                    <Button size="sm" onClick={tryApi} disabled={tryLoading}>
                      {tryLoading ? <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{tryEndpoint.desc}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Auth Method</Label>
                    <Select value={selectedApiKey || "session"} onValueChange={(v) => setSelectedApiKey(v === "session" ? "" : v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Session token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="session">Bearer Token (Current Session)</SelectItem>
                        {apiKeys.filter((k) => k.is_active).map((k) => (
                          <SelectItem key={k.id} value={k.api_key}>{k.key_name} ({k.key_prefix})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {tryEndpoint.body && (
                    <div>
                      <Label className="text-xs">Request Body</Label>
                      <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto">{tryEndpoint.body}</pre>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs">Response</Label>
                      {tryResponse && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyToClipboard(tryResponse)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[250px]">
                      <pre className="bg-muted rounded-lg p-3 text-xs font-mono whitespace-pre-wrap break-words">
                        {tryLoading ? "Loading..." : tryResponse || "Click Send to make a request"}
                      </pre>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== USAGE TAB ===== */}
        <TabsContent value="usage" className="space-y-4">
          <h2 className="text-lg font-semibold">Recent API Calls</h2>
          {usageLogs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No API calls yet. Make your first request!</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium">Method</th>
                        <th className="text-left p-3 font-medium">Endpoint</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-left p-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="p-3">
                            <Badge variant="outline" className={`text-[10px] font-mono ${METHOD_COLORS[log.method]}`}>
                              {log.method}
                            </Badge>
                          </td>
                          <td className="p-3 font-mono">{log.endpoint}</td>
                          <td className="p-3">
                            <Badge variant={log.status_code < 400 ? "default" : "destructive"} className="text-[10px]">
                              {log.status_code}
                            </Badge>
                          </td>
                          <td className="p-3">{log.response_time_ms}ms</td>
                          <td className="p-3 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== DOCS TAB ===== */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-semibold mb-2 block">Base URL</Label>
                <div className="flex items-center gap-2">
                  <code className="bg-muted rounded px-3 py-1.5 text-sm font-mono flex-1">{API_BASE}/v1</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${API_BASE}/v1`)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold mb-2 block">Authentication</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Include your API key in the <code className="bg-muted px-1 rounded">x-api-key</code> header, or use a Bearer token.
                </p>
                <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">{`// Using API Key
fetch('${API_BASE}/v1/tasks', {
  headers: {
    'x-api-key': 'nxk_your_api_key_here',
    'Content-Type': 'application/json'
  }
});

// Using Bearer Token
fetch('${API_BASE}/v1/tasks', {
  headers: {
    'Authorization': 'Bearer your_session_token',
    'Content-Type': 'application/json'
  }
});`}</pre>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold mb-2 block">Python Example</Label>
                <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">{`import requests

API_KEY = "nxk_your_api_key_here"
BASE = "${API_BASE}/v1"

# List tasks
tasks = requests.get(f"{BASE}/tasks",
    headers={"x-api-key": API_KEY}).json()

# Create a task
new_task = requests.post(f"{BASE}/tasks",
    headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
    json={"title": "Study Physics", "subject": "Physics", "priority": "high"}
).json()

# Get study streaks
streaks = requests.get(f"{BASE}/streaks",
    headers={"x-api-key": API_KEY}).json()
print(f"Current streak: {streaks['current_streak']} days")`}</pre>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold mb-2 block">cURL Example</Label>
                <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">{`# Get your profile
curl -H "x-api-key: nxk_your_key" \\
  ${API_BASE}/v1/profile

# Create a focus session
curl -X POST -H "x-api-key: nxk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"duration_minutes":25,"subject":"Math"}' \\
  ${API_BASE}/v1/pomodoro`}</pre>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold mb-2 block">All Endpoints</Label>
                <div className="space-y-1">
                  {ENDPOINTS.map((ep, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50">
                      <Badge variant="outline" className={`text-[10px] font-mono w-16 justify-center ${METHOD_COLORS[ep.method]}`}>
                        {ep.method}
                      </Badge>
                      <code className="text-xs font-mono flex-1">{ep.path}</code>
                      <span className="text-xs text-muted-foreground">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold mb-2 block">Rate Limits</Label>
                <p className="text-xs text-muted-foreground">
                  Default: 60 requests/minute. Configurable per key up to 120/min. 
                  Status code <code className="bg-muted px-1 rounded">429</code> returned when exceeded.
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-2 block">Permissions</Label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2"><strong>read</strong> — GET requests</div>
                  <div className="bg-muted/50 rounded p-2"><strong>write</strong> — POST/PUT requests</div>
                  <div className="bg-muted/50 rounded p-2"><strong>delete</strong> — DELETE requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Key Dialog */}
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdKey ? "API Key Created!" : "Create API Key"}</DialogTitle>
          </DialogHeader>
          {createdKey ? (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Copy your key now — it won't be shown again!</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono flex-1 break-all">{createdKey}</code>
                  <Button size="sm" onClick={() => copyToClipboard(createdKey)}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p className="text-xs text-amber-400">Store this key securely. You won't be able to see it again after closing this dialog.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowCreateKey(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Key Name</Label>
                <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. My App Key" />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="flex gap-2 mt-1">
                  {["read", "write", "delete"].map((p) => (
                    <label key={p} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={newKeyPerms.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) setNewKeyPerms([...newKeyPerms, p]);
                          else setNewKeyPerms(newKeyPerms.filter((x) => x !== p));
                        }}
                        className="rounded"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Rate Limit (requests/min)</Label>
                <Input type="number" value={newKeyRate} onChange={(e) => setNewKeyRate(Number(e.target.value))} min={1} max={120} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateKey(false)}>Cancel</Button>
                <Button onClick={createApiKey} disabled={!newKeyName.trim()}>Create Key</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
