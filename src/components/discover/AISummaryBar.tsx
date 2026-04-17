import { useState } from "react";
import { Sparkles, FileText, Lightbulb, NotebookPen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  pageContent: string;
  pageTitle: string;
}

const ACTIONS = [
  { mode: "summarize", label: "Summarize", icon: FileText, gradient: "from-blue-500 to-cyan-500" },
  { mode: "explain", label: "Explain Simply", icon: Lightbulb, gradient: "from-amber-500 to-orange-500" },
  { mode: "notes", label: "Generate Notes", icon: NotebookPen, gradient: "from-purple-500 to-pink-500" },
  { mode: "keypoints", label: "Key Points", icon: Sparkles, gradient: "from-emerald-500 to-teal-500" },
];

export function AISummaryBar({ pageContent, pageTitle }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ mode: string; text: string } | null>(null);

  const run = async (mode: string) => {
    if (!pageContent || pageContent.trim().length < 50) {
      toast.error("Page content too short to analyze");
      return;
    }
    setLoading(mode);
    try {
      const { data, error } = await supabase.functions.invoke("discover-ai-assist", {
        body: { content: pageContent, mode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({ mode, text: data.result });
    } catch (e: any) {
      toast.error(e.message || "AI request failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Result panel */}
      {result && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[min(720px,calc(100vw-2rem))] z-40 max-h-[60vh] overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm capitalize">{result.mode === "keypoints" ? "Key Points" : result.mode}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">· {pageTitle}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setResult(null)} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-y-auto p-5 max-h-[calc(60vh-3rem)]">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {result.text}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(720px,calc(100vw-2rem))]">
        <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-2xl shadow-2xl shadow-black/30 p-2 flex items-center gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-1.5 px-2 py-1 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold hidden sm:inline">AI</span>
          </div>
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            const isLoading = loading === a.mode;
            return (
              <Button
                key={a.mode}
                size="sm"
                variant="ghost"
                disabled={!!loading}
                onClick={() => run(a.mode)}
                className={cn(
                  "rounded-xl h-9 px-3 text-xs font-medium gap-1.5 transition-all hover:scale-105",
                  "hover:bg-gradient-to-r hover:text-white",
                  `hover:${a.gradient.replace("from-", "from-").replace("to-", "to-")}`
                )}
                style={{
                  backgroundImage: isLoading ? `linear-gradient(135deg, var(--tw-gradient-stops))` : undefined,
                }}
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{a.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
