import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, List, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AIDocSummarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<{ bullets: string[]; keyPoints: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    if (!text.trim() || text.trim().length < 100) {
      toast.error("Please enter at least 100 characters");
      return;
    }
    setLoading(true);
    setSummary(null);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-doc-summarizer`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!resp.ok) throw new Error("Summarization failed");
      const data = await resp.json();
      setSummary(data);
    } catch {
      toast.error("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          AI Document Summarizer
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paste any document text and get bullet-point summaries with key takeaways.
        </p>
      </motion.div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="Paste your document or article text here (minimum 100 characters)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length} characters</span>
            <Button onClick={summarize} disabled={loading || text.trim().length < 100}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Summarize
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <List className="h-4 w-4 text-primary" /> Summary
              </h3>
              <ul className="space-y-2">
                {summary.bullets.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-sm flex gap-2"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    <span>{b}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" /> Key Takeaways
              </h3>
              <div className="grid gap-2">
                {summary.keyPoints.map((kp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="text-sm bg-primary/5 rounded-lg px-3 py-2 border border-primary/10"
                  >
                    {kp}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
