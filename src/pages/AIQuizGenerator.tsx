import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, CheckCircle, XCircle, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function AIQuizGenerator() {
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const generate = async () => {
    if (!notes.trim() || notes.trim().length < 50) {
      toast.error("Please enter at least 50 characters of notes");
      return;
    }
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-quiz-generator`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ notes: notes.trim() }),
      });

      if (!resp.ok) throw new Error("Failed to generate quiz");
      const data = await resp.json();
      setQuestions(data.questions || []);
      if (!data.questions?.length) toast.error("Could not generate questions from this content");
    } catch {
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const score = Object.entries(answers).filter(
    ([i, a]) => questions[Number(i)]?.correct === a
  ).length;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Quiz Generator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paste your study notes and get an instant quiz to test your knowledge.
        </p>
      </motion.div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="Paste your study notes here (minimum 50 characters)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{notes.length} characters</span>
            <Button onClick={generate} disabled={loading || notes.trim().length < 50}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              Generate Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {questions.map((q, qi) => (
          <motion.div
            key={qi}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qi * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Q{qi + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const isCorrect = q.correct === oi;
                  const showFeedback = showResults;

                  return (
                    <motion.button
                      key={oi}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!showResults) setAnswers((prev) => ({ ...prev, [qi]: oi }));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                        showFeedback && isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : showFeedback && selected && !isCorrect
                          ? "border-destructive bg-destructive/10"
                          : selected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {showFeedback && isCorrect && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                        {showFeedback && selected && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                        {opt}
                      </span>
                    </motion.button>
                  );
                })}
                {showResults && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-muted-foreground mt-2 pl-2 border-l-2 border-primary/30"
                  >
                    {q.explanation}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {questions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
          {!showResults ? (
            <Button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(answers).length < questions.length}
            >
              Submit Answers ({Object.keys(answers).length}/{questions.length})
            </Button>
          ) : (
            <>
              <Card className="flex-1">
                <CardContent className="py-3 flex items-center justify-between">
                  <span className="font-semibold">
                    Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </span>
                  <Button variant="outline" size="sm" onClick={() => { setAnswers({}); setShowResults(false); }}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Retry
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
