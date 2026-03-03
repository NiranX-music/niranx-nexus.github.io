import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const SECRETS = [
  { name: "OPENAI_API_KEY", category: "AI", configured: true },
  { name: "GROQ_API_KEY", category: "AI", configured: true },
  { name: "DEEPSEEK_API_KEY", category: "AI", configured: true },
  { name: "BYTEZ_API_KEY", category: "AI", configured: true },
  { name: "OPENROUTER_API_KEY", category: "AI", configured: true },
  { name: "AIML_API_KEY", category: "AI", configured: true },
  { name: "PERPLEXITY_API_KEY", category: "AI", configured: true, managed: true },
  { name: "ELEVENLABS_API_KEY", category: "AI", configured: true, managed: true },
  { name: "LOVABLE_API_KEY", category: "AI", configured: true },
  { name: "PRESENTON_API_KEY", category: "AI", configured: true },
  { name: "SONAUTO_API_KEY", category: "AI", configured: true },
  { name: "FLUXAPI_API_KEY", category: "Image", configured: true },
  { name: "BLACKBOX_API_KEY", category: "AI", configured: true },
  { name: "GOOGLE_CLIENT_ID", category: "Auth", configured: true },
  { name: "GOOGLE_CLIENT_SECRET", category: "Auth", configured: true },
  { name: "GOOGLE_SEARCH_API_KEY", category: "Search", configured: true },
  { name: "GOOGLE_SEARCH_CX", category: "Search", configured: true },
  { name: "SPOTIFY_CLIENT_ID", category: "Music", configured: true },
  { name: "SPOTIFY_CLIENT_SECRET", category: "Music", configured: true },
  { name: "AGORA_APP_ID", category: "RTC", configured: true },
  { name: "AGORA_APP_CERTIFICATE", category: "RTC", configured: true },
  { name: "AGORA_CUSTOMER_KEY", category: "RTC", configured: true },
  { name: "AGORA_CUSTOMER_SECRET", category: "RTC", configured: true },
  { name: "RESEND_API_KEY", category: "Email", configured: true },
  { name: "RESEND_FROM_EMAIL", category: "Email", configured: true },
  { name: "RAPIDAPI_KEY", category: "API", configured: true },
  { name: "BACKBLAZE_KEY_ID", category: "Storage", configured: true },
  { name: "BACKBLAZE_APPLICATION_KEY", category: "Storage", configured: true },
  { name: "BACKBLAZE_BUCKET_ID", category: "Storage", configured: true },
  { name: "SUPABASE_URL", category: "System", configured: true },
  { name: "SUPABASE_ANON_KEY", category: "System", configured: true },
  { name: "SUPABASE_SERVICE_ROLE_KEY", category: "System", configured: true },
  { name: "SUPABASE_DB_URL", category: "System", configured: true },
  { name: "SUPABASE_PUBLISHABLE_KEY", category: "System", configured: true },
];

const CATEGORIES = [...new Set(SECRETS.map(s => s.category))];

export function XstellarSecrets() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? SECRETS.filter(s => s.category === selectedCategory)
    : SECRETS;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="h-4 w-4" /> Secrets ({SECRETS.length} configured)
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map((secret) => (
              <div key={secret.name} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="font-mono text-xs truncate">{secret.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {secret.managed && (
                    <Badge variant="outline" className="text-xs">Managed</Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">{secret.category}</Badge>
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            <strong>Security Note:</strong> Secret values are encrypted and never displayed. Secrets can only be added or updated through the secure secrets management system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
