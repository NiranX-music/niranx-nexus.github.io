import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  FileText, 
  Video, 
  Route, 
  MessageSquare, 
  Globe, 
  Calendar,
  Music,
  Brain,
  Mic,
  Presentation,
  Archive,
  Bot,
  Cloud,
  Network
} from "lucide-react";

const aiTools = [
  {
    id: "ai-chat",
    title: "AI Chat Assistant",
    description: "Get help with homework, study questions, and explanations",
    icon: MessageSquare,
    route: "/niranx/ai-chat",
    color: "text-blue-500",
  },
  {
    id: "study-path",
    title: "AI Study Path Generator",
    description: "Create personalized learning roadmaps based on your goals",
    icon: Route,
    route: "/niranx/study-path-generator",
    color: "text-purple-500",
  },
  {
    id: "note-summarizer",
    title: "AI Note Summarizer",
    description: "Upload notes and get AI-generated summaries and mind maps",
    icon: FileText,
    route: "/niranx/note-summarizer",
    color: "text-green-500",
  },
  {
    id: "youtube-library",
    title: "YouTube AI Summaries",
    description: "Embed educational videos with AI summaries and timestamps",
    icon: Video,
    route: "/niranx/youtube-library",
    color: "text-red-500",
  },
  {
    id: "website-generator",
    title: "AI Website Generator",
    description: "Generate landing pages and websites with AI",
    icon: Globe,
    route: "/niranx/ai-website-generator",
    color: "text-cyan-500",
  },
  {
    id: "ai-scheduler",
    title: "AI Smart Scheduler",
    description: "Generate optimized study schedules with AI",
    icon: Calendar,
    route: "/niranx/ai-scheduler",
    color: "text-orange-500",
  },
  {
    id: "presentation-generator",
    title: "AI Presentation Generator",
    description: "Generate professional PowerPoint presentations with AI",
    icon: Presentation,
    route: "/niranx/ai-presentation-generator",
    color: "text-violet-500",
  },
  {
    id: "image-generator",
    title: "AI Image Generator",
    description: "Create stunning images with SubNP AI",
    icon: Sparkles,
    route: "/niranx/ai-image-generator",
    color: "text-amber-500",
  },
  {
    id: "song-generator",
    title: "AI Song Generator",
    description: "Create custom songs with Sonauto AI",
    icon: Music,
    route: "/niranx/ai-song-generator",
    color: "text-pink-500",
  },
  {
    id: "voice-commands",
    title: "Voice Commands",
    description: "Control Niranx with your voice using AI",
    icon: Mic,
    route: "/niranx",
    color: "text-indigo-500",
    note: "Available on all pages via the mic button"
  },
  {
    id: "ai-library",
    title: "AI Library",
    description: "Access all your AI-generated content in one place",
    icon: Archive,
    route: "/niranx/ai-library",
    color: "text-slate-500",
  },
  {
    id: "openrouter-chat",
    title: "OpenRouter Chat",
    description: "Access hundreds of AI models from OpenAI, Anthropic, Google, Meta, and more",
    icon: Bot,
    route: "/niranx/openrouter-chat",
    color: "text-emerald-500",
  },
  {
    id: "weather",
    title: "Weather",
    description: "Get real-time weather forecasts and conditions for any location",
    icon: Cloud,
    route: "/niranx/weather",
    color: "text-sky-500",
  },
  {
    id: "topic-map-generator",
    title: "AI Topic-Map Generator",
    description: "Auto-generate concept maps, flowcharts, definitions, and formula relations",
    icon: Network,
    route: "/niranx/ai-topic-map-generator",
    color: "text-teal-500",
  },
  {
    id: "ai-solver",
    title: "GPAI AI Solver",
    description: "Solve homework problems across all subjects with AI - text or image input",
    icon: Brain,
    route: "/niranx/ai-solver",
    color: "text-green-500",
  },
];

export default function AICorner() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Corner</h1>
          <p className="text-muted-foreground">
            Explore all AI-powered tools to supercharge your learning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(tool.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-background ${tool.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Sparkles className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="mt-4">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
                {tool.note && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    {tool.note}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Launch Tool
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Pro Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Combine multiple AI tools for maximum productivity! Try using the AI Study Path Generator
            with the Note Summarizer to create personalized learning materials, or use Voice Commands
            to quickly access any tool hands-free.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
