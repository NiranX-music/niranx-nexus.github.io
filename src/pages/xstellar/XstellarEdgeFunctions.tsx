import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2, Clock } from "lucide-react";

const EDGE_FUNCTIONS = [
  { name: "ai-chat", description: "AI-powered chat assistant", status: "deployed" },
  { name: "groq-chat", description: "Fast AI chat with Groq models", status: "deployed" },
  { name: "deepseek-chat", description: "DeepSeek coding assistant", status: "deployed" },
  { name: "google-search", description: "Google search integration", status: "deployed" },
  { name: "summarize-notes", description: "AI note summarization", status: "deployed" },
  { name: "summarize-youtube", description: "YouTube video summary", status: "deployed" },
  { name: "hash-password", description: "Secure PBKDF2 password hashing", status: "deployed" },
  { name: "send-notification-email", description: "Email notification sender", status: "deployed" },
  { name: "send-admin-decision-email", description: "Admin decision email notifier", status: "deployed" },
  { name: "generate-agora-token", description: "Agora RTC token generation", status: "deployed" },
  { name: "bytez-chat", description: "Bytez AI integration", status: "deployed" },
  { name: "openrouter-chat", description: "OpenRouter multi-model chat", status: "deployed" },
  { name: "generate-website", description: "AI website generation", status: "deployed" },
  { name: "flux-generate-image", description: "Flux API image generation", status: "deployed" },
  { name: "xnexus-ai", description: "XNexus AI assistant", status: "deployed" },
];

export function XstellarEdgeFunctions() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" /> Edge Functions ({EDGE_FUNCTIONS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EDGE_FUNCTIONS.map((fn) => (
              <div key={fn.name} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm font-medium">{fn.name}</span>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {fn.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{fn.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
