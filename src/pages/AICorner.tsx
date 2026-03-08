import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sparkles, FileText, Video, Route, MessageSquare, Globe, Calendar,
  Music, Brain, Mic, Presentation, Archive, Bot, Cloud, Network,
  Grid3x3, List, Code, Image, Headphones, GraduationCap, Wrench
} from "lucide-react";
import { AICreditsPanel } from "@/components/ai/AICreditsPanel";

type Category = "all" | "chat" | "image" | "audio" | "study" | "code" | "utility";

interface AITool {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  color: string;
  badge?: string;
  note?: string;
  category: Category[];
}

const categories: { id: Category; label: string; icon: any }[] = [
  { id: "all", label: "All Tools", icon: Grid3x3 },
  { id: "chat", label: "Chat AI", icon: MessageSquare },
  { id: "image", label: "Image Gen", icon: Image },
  { id: "audio", label: "Audio & Music", icon: Headphones },
  { id: "study", label: "Study Tools", icon: GraduationCap },
  { id: "code", label: "Coding", icon: Code },
  { id: "utility", label: "Utilities", icon: Wrench },
];

const aiTools: AITool[] = [
  // Chat AI
  {
    id: "xvibing", title: "Xvibing", description: "AI coding assistant powered by Groq with Gemini fallback",
    icon: Code, route: "/niranx/xvibing", color: "text-green-500", badge: "HOT", category: ["chat", "code"],
  },
  {
    id: "ai-chat", title: "AI Chat Assistant", description: "Multi-purpose AI chat for homework & explanations",
    icon: MessageSquare, route: "/niranx/ai-chat", color: "text-blue-500", category: ["chat"],
  },
  {
    id: "ai-chat-hub", title: "AI Chat Hub", description: "Ultra-fast AI responses with Groq multi-model support",
    icon: Sparkles, route: "/niranx/groq-chat", color: "text-orange-500", category: ["chat"],
  },
  {
    id: "openrouter-chat", title: "OpenRouter Chat", description: "Access hundreds of AI models from OpenAI, Anthropic, Google & more",
    icon: Bot, route: "/niranx/openrouter-chat", color: "text-emerald-500", category: ["chat"],
  },
  {
    id: "puter-chat", title: "Puter AI Chat", description: "500+ free AI models — GPT-5, Claude, Gemini, Grok, DeepSeek & more",
    icon: Sparkles, route: "/niranx/puter-chat", color: "text-cyan-500", badge: "NEW", category: ["chat"],
  },
  {
    id: "ai-solver", title: "GPAI AI Solver", description: "Solve homework across all subjects — text or image input",
    icon: Brain, route: "/niranx/ai-solver", color: "text-green-500", category: ["chat", "study"],
  },

  // Image Generation
  {
    id: "image-generator", title: "AI Image Generator", description: "Create stunning images with SubNP AI",
    icon: Sparkles, route: "/niranx/ai-image-generator", color: "text-amber-500", category: ["image"],
  },
  {
    id: "fluxapi-image", title: "Multi-Model Image Gen", description: "Generate images with multiple FLUX models via FluxAPI",
    icon: Sparkles, route: "/niranx/fluxapi-image", color: "text-fuchsia-500", category: ["image"],
  },

  // Audio & Music
  {
    id: "suno-music", title: "AI Music Studio", description: "Create original songs with Sonauto AI — full generation & history",
    icon: Music, route: "/niranx/suno-music", color: "text-pink-500", badge: "NEW", category: ["audio"],
  },
  {
    id: "song-generator", title: "Quick Song Generator", description: "Fast AI song creation with stem extraction & publishing",
    icon: Music, route: "/niranx/ai-song-generator", color: "text-pink-400", category: ["audio"],
  },
  {
    id: "voice-commands", title: "Voice Commands", description: "Control NiranX with voice using AI",
    icon: Mic, route: "/niranx", color: "text-indigo-500", note: "Available via mic button on all pages", category: ["audio", "utility"],
  },

  // Study Tools
  {
    id: "ai-scheduler", title: "AI Smart Scheduler", description: "Generate optimized study schedules with AI chat editor",
    icon: Calendar, route: "/niranx/ai-scheduler", color: "text-orange-500", category: ["study"],
  },
  {
    id: "study-path", title: "AI Study Path Generator", description: "Create personalized learning roadmaps for your goals",
    icon: Route, route: "/niranx/study-path-generator", color: "text-purple-500", category: ["study"],
  },
  {
    id: "note-summarizer", title: "AI Note Summarizer", description: "Upload notes and get AI-generated summaries & mind maps",
    icon: FileText, route: "/niranx/note-summarizer", color: "text-green-500", category: ["study"],
  },
  {
    id: "pdf-summarizer", title: "AI PDF Summarizer", description: "Upload PDFs and get instant AI summaries",
    icon: FileText, route: "/niranx/pdf-summarizer", color: "text-rose-500", category: ["study"],
  },
  {
    id: "topic-map-generator", title: "AI Topic Map Generator", description: "Auto-generate concept maps, flowcharts & formula relations",
    icon: Network, route: "/niranx/ai-topic-map-generator", color: "text-teal-500", category: ["study"],
  },
  {
    id: "youtube-library", title: "YouTube AI Summaries", description: "Educational videos with AI summaries & timestamps",
    icon: Video, route: "/niranx/youtube-library", color: "text-red-500", category: ["study"],
  },

  // Coding
  {
    id: "website-generator", title: "AI Website Generator", description: "Generate landing pages and websites with AI",
    icon: Globe, route: "/niranx/ai-website-generator", color: "text-cyan-500", category: ["code"],
  },
  {
    id: "presentation-generator", title: "AI Presentation Generator", description: "Generate professional presentations with AI",
    icon: Presentation, route: "/niranx/ai-presentation-generator", color: "text-violet-500", category: ["code", "utility"],
  },

  // Utilities
  {
    id: "weather", title: "Weather", description: "Real-time weather forecasts for any location",
    icon: Cloud, route: "/niranx/weather", color: "text-sky-500", category: ["utility"],
  },
  {
    id: "ai-library", title: "AI Library", description: "Access all your AI-generated content in one place",
    icon: Archive, route: "/niranx/ai-library", color: "text-slate-500", category: ["utility"],
  },
  {
    id: "unified-history", title: "Unified AI History", description: "View all AI chat conversations across every provider in one place",
    icon: Archive, route: "/niranx/unified-ai-history", color: "text-indigo-500", category: ["utility"],
  },
];

export default function AICorner() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredTools = activeCategory === "all"
    ? aiTools
    : aiTools.filter((t) => t.category.includes(activeCategory));

  const toolCount = (cat: Category) =>
    cat === "all" ? aiTools.length : aiTools.filter((t) => t.category.includes(cat)).length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-5">
      {/* Credits & Referral */}
      <AICreditsPanel />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Corner</h1>
            <p className="text-sm text-muted-foreground">
              {aiTools.length} AI-powered tools to supercharge your workflow
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-8 w-8"
            onClick={() => setViewMode("grid")}>
            <Grid3x3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-8 w-8"
            onClick={() => setViewMode("list")}>
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = toolCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card hover:bg-muted border-border"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === cat.id ? "bg-primary-foreground/20" : "bg-muted-foreground/10"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools Grid/List */}
      <div className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-3"
      }>
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return viewMode === "grid" ? (
            <Card
              key={tool.id}
              className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/20"
              onClick={() => navigate(tool.route)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg bg-muted/50 ${tool.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {tool.badge && (
                    <Badge className={
                      tool.badge === "NEW"
                        ? "bg-pink-500/90 text-primary-foreground text-[10px]"
                        : "bg-green-500/90 text-primary-foreground text-[10px]"
                    }>
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm mt-3">{tool.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{tool.description}</CardDescription>
                {tool.note && (
                  <p className="text-[10px] text-muted-foreground italic mt-1">{tool.note}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Launch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card
              key={tool.id}
              className="hover:shadow-md transition-all cursor-pointer group hover:border-primary/20"
              onClick={() => navigate(tool.route)}
            >
              <CardHeader className="flex flex-row items-center gap-4 py-3">
                <div className={`p-2.5 rounded-lg bg-muted/50 shrink-0 ${tool.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{tool.title}</CardTitle>
                    {tool.badge && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-pink-500/90 text-primary-foreground">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs mt-0.5">{tool.description}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  Launch
                </Button>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="py-12 text-center">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No tools in this category yet</p>
        </div>
      )}
    </div>
  );
}
