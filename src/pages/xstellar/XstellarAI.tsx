import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Zap, Globe } from "lucide-react";

const AI_MODELS = [
  { name: "OpenAI GPT-5", provider: "OpenAI", status: "configured", key: "OPENAI_API_KEY" },
  { name: "Groq Llama", provider: "Groq", status: "configured", key: "GROQ_API_KEY" },
  { name: "DeepSeek Coder", provider: "DeepSeek", status: "configured", key: "DEEPSEEK_API_KEY" },
  { name: "Bytez AI", provider: "Bytez", status: "configured", key: "BYTEZ_API_KEY" },
  { name: "OpenRouter", provider: "OpenRouter", status: "configured", key: "OPENROUTER_API_KEY" },
  { name: "AIML API", provider: "AIML", status: "configured", key: "AIML_API_KEY" },
  { name: "Perplexity", provider: "Perplexity", status: "configured", key: "PERPLEXITY_API_KEY" },
  { name: "ElevenLabs TTS", provider: "ElevenLabs", status: "configured", key: "ELEVENLABS_API_KEY" },
  { name: "Lovable AI", provider: "Lovable", status: "configured", key: "LOVABLE_API_KEY" },
  { name: "Google Gemini", provider: "Google", status: "available", key: "via Lovable AI" },
  { name: "Hugging Face", provider: "HuggingFace", status: "configured", key: "HUGGINGFACE_API_KEY" },
];

const AI_FEATURES = [
  { name: "AI Chat", description: "Multi-model conversational AI", route: "/niranx/ai-chat" },
  { name: "AI Solver", description: "Homework solver with image support", route: "/niranx/ai-solver" },
  { name: "AI Scheduler", description: "Smart timetable generation", route: "/niranx/ai-scheduler" },
  { name: "AI Website Generator", description: "Generate full websites with AI", route: "/niranx/ai-website-generator" },
  { name: "AI Image Generator", description: "Image generation with multiple models", route: "/niranx/ai-image-generator" },
  { name: "PDF Summarizer", description: "AI-powered document summarization", route: "/niranx/pdf-summarizer" },
  { name: "Topic Map Generator", description: "Visual knowledge maps", route: "/niranx/ai-topic-map-generator" },
  { name: "AI Song Generator", description: "Music generation with Sonauto", route: "/niranx/ai-song-generator" },
  { name: "Hugging Face Hub", description: "Chat, text/image gen, model explorer", route: "/niranx/huggingface-hub" },
];

export function XstellarAI() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" /> Connected AI Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_MODELS.map((model) => (
              <div key={model.name} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.provider}</p>
                </div>
                <Badge variant={model.status === "configured" ? "default" : "secondary"} className="text-xs">
                  {model.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {AI_FEATURES.map((feature) => (
              <div key={feature.name} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium">{feature.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
