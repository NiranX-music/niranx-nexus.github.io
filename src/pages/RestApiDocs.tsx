import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code, Lock, Zap, Copy, Check, Search, ChevronRight, ChevronDown,
  Globe, Shield, Clock, Server, FileJson, Key, BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  category: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  responseExample?: string;
  requestExample?: string;
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  PATCH: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
};

const endpoints: Endpoint[] = [
  {
    method: "GET", path: "/api/v1/user/profile", description: "Retrieve current user profile",
    auth: true, category: "Users",
    responseExample: `{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2025-01-01T00:00:00Z"
}`
  },
  {
    method: "PUT", path: "/api/v1/user/profile", description: "Update user profile",
    auth: true, category: "Users",
    params: [
      { name: "full_name", type: "string", required: false, description: "Display name" },
      { name: "avatar_url", type: "string", required: false, description: "Avatar image URL" },
    ],
    requestExample: `{ "full_name": "Jane Doe" }`,
    responseExample: `{ "success": true, "data": { "id": "uuid", "full_name": "Jane Doe" } }`
  },
  {
    method: "POST", path: "/api/v1/ai/chat", description: "Send a message to the AI assistant",
    auth: true, category: "AI",
    params: [
      { name: "message", type: "string", required: true, description: "User message content" },
      { name: "model", type: "string", required: false, description: "AI model to use" },
      { name: "conversation_id", type: "string", required: false, description: "Continue existing conversation" },
    ],
    requestExample: `{ "message": "Explain quantum physics", "model": "gemini-2.5-flash" }`,
    responseExample: `{ "content": "Quantum physics is...", "conversation_id": "uuid" }`
  },
  {
    method: "POST", path: "/api/v1/ai/summarize", description: "Summarize text content using AI",
    auth: true, category: "AI",
    params: [
      { name: "content", type: "string", required: true, description: "Text to summarize" },
      { name: "max_length", type: "number", required: false, description: "Max summary length" },
    ],
    requestExample: `{ "content": "Long article text...", "max_length": 200 }`,
    responseExample: `{ "summary": "A concise summary...", "word_count": 150 }`
  },
  {
    method: "GET", path: "/api/v1/flashcards", description: "List user's flashcard decks",
    auth: true, category: "Flashcards",
    responseExample: `{ "decks": [{ "id": "uuid", "title": "Biology", "card_count": 25 }] }`
  },
  {
    method: "POST", path: "/api/v1/flashcards", description: "Create a new flashcard deck",
    auth: true, category: "Flashcards",
    params: [
      { name: "title", type: "string", required: true, description: "Deck title" },
      { name: "description", type: "string", required: false, description: "Deck description" },
      { name: "cards", type: "array", required: false, description: "Array of {question, answer}" },
    ],
    requestExample: `{ "title": "Chemistry 101", "cards": [{ "question": "H2O?", "answer": "Water" }] }`,
    responseExample: `{ "id": "uuid", "title": "Chemistry 101", "card_count": 1 }`
  },
  {
    method: "GET", path: "/api/v1/tasks", description: "List user's tasks",
    auth: true, category: "Tasks",
    params: [
      { name: "status", type: "string", required: false, description: "Filter: pending, completed" },
      { name: "limit", type: "number", required: false, description: "Max results (default 50)" },
    ],
    responseExample: `{ "tasks": [{ "id": "uuid", "title": "Study", "status": "pending" }] }`
  },
  {
    method: "POST", path: "/api/v1/tasks", description: "Create a new task",
    auth: true, category: "Tasks",
    params: [
      { name: "title", type: "string", required: true, description: "Task title" },
      { name: "due_date", type: "string", required: false, description: "ISO 8601 due date" },
      { name: "priority", type: "string", required: false, description: "low, medium, high" },
    ],
    requestExample: `{ "title": "Review notes", "priority": "high" }`,
    responseExample: `{ "id": "uuid", "title": "Review notes", "status": "pending" }`
  },
  {
    method: "DELETE", path: "/api/v1/tasks/:id", description: "Delete a task by ID",
    auth: true, category: "Tasks",
    responseExample: `{ "success": true }`
  },
  {
    method: "POST", path: "/api/v1/search", description: "Search across platform content",
    auth: true, category: "Search",
    params: [
      { name: "query", type: "string", required: true, description: "Search query" },
      { name: "type", type: "string", required: false, description: "Filter: notes, tasks, flashcards" },
    ],
    requestExample: `{ "query": "quantum physics" }`,
    responseExample: `{ "results": [{ "type": "note", "title": "...", "snippet": "..." }] }`
  },
  {
    method: "GET", path: "/api/v1/analytics/study", description: "Get study analytics",
    auth: true, category: "Analytics",
    params: [
      { name: "period", type: "string", required: false, description: "day, week, month" },
    ],
    responseExample: `{ "total_hours": 24.5, "sessions": 18, "streak": 7 }`
  },
];

const categories = [...new Set(endpoints.map(e => e.category))];

const codeExamples = {
  javascript: `const response = await fetch('https://api.niranx.com/v1/user/profile', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,
  python: `import requests

response = requests.get(
    'https://api.niranx.com/v1/user/profile',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
print(response.json())`,
  curl: `curl -X GET 'https://api.niranx.com/v1/user/profile' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`,
};

export default function RestApiDocs() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = endpoints.filter(ep => {
    const matchesSearch = ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || ep.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
          <BookOpen className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">REST API Documentation</h1>
          <p className="text-muted-foreground mt-1">Complete reference for the NiranX API v1</p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { icon: Globe, label: "Base URL", value: "api.niranx.com/v1" },
          { icon: Shield, label: "Auth", value: "Bearer Token" },
          { icon: Clock, label: "Rate Limit", value: "1000 req/min" },
          { icon: FileJson, label: "Format", value: "JSON" },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-mono text-sm font-medium">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" /> Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript">
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="icon" variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(code, `qs-${lang}`)}
                  >
                    {copiedId === `qs-${lang}` ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-primary" /> Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All API requests require a Bearer token in the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Authorization</code> header.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <code className="text-sm font-mono">Authorization: Bearer {"<YOUR_API_KEY>"}</code>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate API keys from your <span className="text-primary font-medium">Dashboard → Settings → API Keys</span>.
            Keys are scoped to your account and inherit your permissions.
          </p>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Server className="h-5 w-5" /> Endpoints
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search endpoints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
          >
            All ({endpoints.length})
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat} ({endpoints.filter(e => e.category === cat).length})
            </Button>
          ))}
        </div>

        <ScrollArea className="h-auto max-h-[800px]">
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((ep) => {
                const key = `${ep.method}-${ep.path}`;
                const isExpanded = expandedEndpoint === key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`font-mono text-xs px-2 ${methodColors[ep.method]}`}>
                            {ep.method}
                          </Badge>
                          <code className="text-sm font-mono flex-1 truncate">{ep.path}</code>
                          <div className="flex items-center gap-2">
                            {ep.auth && (
                              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <Lock className="h-3 w-3" /> Auth
                              </div>
                            )}
                            <Badge variant="secondary" className="text-[10px]">{ep.category}</Badge>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-16">{ep.description}</p>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 space-y-4 border-t pt-4"
                              onClick={e => e.stopPropagation()}
                            >
                              {ep.params && ep.params.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                                  <div className="space-y-1">
                                    {ep.params.map(p => (
                                      <div key={p.name} className="flex items-start gap-2 text-sm">
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{p.name}</code>
                                        <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                                        {p.required && <Badge className="text-[10px]">required</Badge>}
                                        <span className="text-muted-foreground">{p.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {ep.requestExample && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                                  <div className="relative">
                                    <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto">
                                      {ep.requestExample}
                                    </pre>
                                    <Button
                                      size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6"
                                      onClick={() => copyCode(ep.requestExample!, `req-${key}`)}
                                    >
                                      {copiedId === `req-${key}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {ep.responseExample && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Response</h4>
                                  <div className="relative">
                                    <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto">
                                      {ep.responseExample}
                                    </pre>
                                    <Button
                                      size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6"
                                      onClick={() => copyCode(ep.responseExample!, `res-${key}`)}
                                    >
                                      {copiedId === `res-${key}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { code: 200, desc: "Success" },
              { code: 400, desc: "Bad Request — invalid parameters" },
              { code: 401, desc: "Unauthorized — missing or invalid token" },
              { code: 403, desc: "Forbidden — insufficient permissions" },
              { code: 404, desc: "Not Found — resource doesn't exist" },
              { code: 429, desc: "Too Many Requests — rate limit exceeded" },
              { code: 500, desc: "Internal Server Error" },
            ].map(err => (
              <div key={err.code} className="flex items-center gap-3 p-2 rounded-lg border">
                <Badge variant={err.code < 300 ? "default" : "destructive"} className="font-mono">
                  {err.code}
                </Badge>
                <span className="text-sm text-muted-foreground">{err.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
