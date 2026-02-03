import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Code, Lock, Zap, Database, 
  FileJson, Terminal, Copy, Check, ExternalLink 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const APIReference = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/user/profile",
      description: "Get current user profile",
      auth: true
    },
    {
      method: "POST",
      path: "/api/v1/ai/chat",
      description: "Send message to AI assistant",
      auth: true
    },
    {
      method: "GET",
      path: "/api/v1/flashcards",
      description: "List user's flashcard decks",
      auth: true
    },
    {
      method: "POST",
      path: "/api/v1/tasks",
      description: "Create a new task",
      auth: true
    },
  ];

  const codeExamples = {
    javascript: `const response = await fetch('https://api.niranx.com/v1/user/profile', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.niranx.com/v1/user/profile',
    headers=headers
)

print(response.json())`,
    curl: `curl -X GET 'https://api.niranx.com/v1/user/profile' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4">Developer Docs</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              API <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Reference</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Build powerful integrations with the NiranX API. Access AI features, manage content, and more.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button className="gap-2">
                <Terminal className="h-4 w-4" />
                Get API Key
              </Button>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                OpenAPI Spec
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Quick Start</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Make Your First Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript">
              <TabsList className="mb-4">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
              {Object.entries(codeExamples).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <div className="relative">
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                      <code>{code}</code>
                    </pre>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(code, lang)}
                    >
                      {copied === lang ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Endpoints</h2>
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={endpoint.method === "GET" ? "secondary" : "default"}
                        className={endpoint.method === "POST" ? "bg-green-500" : ""}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                      {endpoint.auth && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Lock className="h-3 w-3" />
                          Auth required
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-16">
                      {endpoint.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Rate Limiting</h3>
              <p className="text-sm text-muted-foreground">
                1000 requests per minute on standard plans
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Webhooks</h3>
              <p className="text-sm text-muted-foreground">
                Real-time notifications for events
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileJson className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">JSON Responses</h3>
              <p className="text-sm text-muted-foreground">
                All endpoints return structured JSON
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default APIReference;
