import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchItem {
  title: string;
  description: string;
  url: string;
  category: string;
  keywords: string[];
}

// Simulated indexed content (acts like a mini search index)
const INDEX: SearchItem[] = [
  { title: "AI Study Assistant", description: "Personalized AI tutor that answers questions, explains concepts and walks you through problem solving.", url: "/ai-chat", category: "AI", keywords: ["ai", "tutor", "chat", "assistant"] },
  { title: "Smart Timetable", description: "Auto-generated study timetable that adapts to your goals, exams and energy levels.", url: "/smart-timetable", category: "Productivity", keywords: ["schedule", "planner", "timetable", "calendar"] },
  { title: "Flashcard Generator", description: "Generate spaced-repetition flashcards from any notes, PDF or topic in seconds.", url: "/flashcards", category: "Learning", keywords: ["flashcards", "memory", "spaced repetition", "anki"] },
  { title: "Document Scanner", description: "Scan, OCR and summarize handwritten notes, textbooks and worksheets.", url: "/document-scanner", category: "Tools", keywords: ["ocr", "scan", "pdf", "summarize"] },
  { title: "AI Quiz Generator", description: "Turn any topic or document into interactive quizzes with instant grading.", url: "/ai-quiz-generator", category: "AI", keywords: ["quiz", "test", "assessment", "exam"] },
  { title: "Pomodoro Focus Timer", description: "Deep-work timer with ambient sounds, focus heatmap and streak rewards.", url: "/pomodoro", category: "Productivity", keywords: ["focus", "pomodoro", "timer", "concentration"] },
  { title: "AI Homework Solver", description: "Snap a photo or paste a problem — get step-by-step explanations across all subjects.", url: "/ai-solver", category: "AI", keywords: ["homework", "solver", "math", "physics"] },
  { title: "Course Generator", description: "Build a complete course outline, modules and lessons from a single prompt.", url: "/course-generator", category: "AI", keywords: ["course", "curriculum", "lessons", "syllabus"] },
  { title: "Mind Map Builder", description: "Visualize topics, concepts and study plans as interactive mind maps.", url: "/mind-map", category: "Learning", keywords: ["mindmap", "visual", "notes", "diagram"] },
  { title: "Study Rooms", description: "Join collaborative study rooms with video, chat and shared whiteboards.", url: "/study-rooms", category: "Social", keywords: ["group", "collab", "study", "rooms"] },
  { title: "AI Voice Tutor", description: "Talk to an AI tutor like a real teacher — natural voice, real-time answers.", url: "/ai-voice-tutor", category: "AI", keywords: ["voice", "speech", "audio", "tutor"] },
  { title: "Web Search", description: "Multi-engine web search across Google, Bing, DuckDuckGo and Perplexity.", url: "/web-search", category: "Tools", keywords: ["web", "google", "bing", "search"] },
];

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.trim().toLowerCase() ? (
      <mark key={i} className="bg-primary/30 text-primary-foreground rounded px-0.5">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function score(item: SearchItem, q: string) {
  const ql = q.toLowerCase();
  let s = 0;
  if (item.title.toLowerCase().includes(ql)) s += 10;
  if (item.title.toLowerCase().startsWith(ql)) s += 5;
  if (item.description.toLowerCase().includes(ql)) s += 4;
  if (item.keywords.some(k => k.includes(ql))) s += 6;
  return s;
}

export default function SeoSearch() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return INDEX
      .map(i => ({ item: i, s: score(i, query) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map(x => x.item);
  }, [query]);

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    return INDEX
      .map(i => ({ item: i, s: score(i, submitted) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => x.item);
  }, [submitted]);

  useEffect(() => {
    setActiveIdx(-1);
  }, [query]);

  const handleSubmit = (q?: string) => {
    const v = (q ?? query).trim();
    if (!v) return;
    setQuery(v);
    setSubmitted(v);
    setShowSuggest(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSubmit(suggestions[activeIdx].title);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggest(false);
    }
  };

  const trending = ["AI tutor", "flashcards", "pomodoro", "quiz generator", "mind map"];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: submitted ? `Results for "${submitted}"` : "SEO Search",
    url: typeof window !== "undefined" ? window.location.href : "",
    mainEntity: results.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "WebPage",
        name: r.title,
        description: r.description,
        url: r.url,
      },
    })),
  };

  const title = submitted
    ? `${submitted} — Search Results | NiranX Universe`
    : "SEO Search — Find anything across NiranX Universe";
  const description = submitted
    ? `Search results for "${submitted}" across NiranX Universe — AI tutor, flashcards, study tools and more.`
    : "Lightning-fast SEO-optimized search across 100+ AI study tools, productivity features and learning resources.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="search, AI study tools, flashcards, pomodoro, quiz, NiranX search" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : ""} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="w-3 h-3" /> SEO-Powered Search
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
            Search anything
          </h1>
          <p className="text-muted-foreground text-lg">
            Find tools, features and resources instantly.
          </p>
        </motion.header>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className={cn(
            "relative flex items-center gap-2 p-2 rounded-full border-2 bg-card shadow-lg transition-all",
            showSuggest && suggestions.length > 0 ? "border-primary shadow-primary/20" : "border-border hover:border-primary/50"
          )}>
            <Search className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="Search tools, features, topics..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-11"
              aria-label="Search"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSubmitted(""); inputRef.current?.focus(); }}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button onClick={() => handleSubmit()} className="rounded-full px-6 h-11">
              Search
            </Button>
          </div>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showSuggest && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 right-0 top-full mt-2 z-20"
              >
                <Card className="overflow-hidden border-2 shadow-xl">
                  <ul role="listbox">
                    {suggestions.map((s, i) => (
                      <li key={s.url} role="option" aria-selected={activeIdx === i}>
                        <button
                          onMouseDown={(e) => { e.preventDefault(); handleSubmit(s.title); }}
                          onMouseEnter={() => setActiveIdx(i)}
                          className={cn(
                            "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors",
                            activeIdx === i ? "bg-muted" : "hover:bg-muted/50"
                          )}
                        >
                          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{highlight(s.title, query)}</div>
                            <div className="text-xs text-muted-foreground truncate">{s.category}</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trending */}
        {!submitted && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
            aria-label="Trending searches"
          >
            <p className="text-sm text-muted-foreground mb-3">Trending</p>
            <div className="flex flex-wrap gap-2">
              {trending.map(t => (
                <button
                  key={t}
                  onClick={() => handleSubmit(t)}
                  className="px-4 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all text-sm font-medium"
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Results */}
        {submitted && (
          <section className="mt-10" aria-label="Search results">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {results.length} result{results.length === 1 ? "" : "s"} for{" "}
                <span className="text-primary">"{submitted}"</span>
              </h2>
            </div>

            {results.length === 0 ? (
              <Card className="p-10 text-center">
                <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No results found. Try a different keyword.</p>
              </Card>
            ) : (
              <ul className="space-y-3">
                {results.map((r, i) => (
                  <motion.li
                    key={r.url}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <a href={r.url} className="block group">
                      <Card className="p-5 hover:border-primary hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="truncate">{typeof window !== "undefined" ? window.location.origin : ""}{r.url}</span>
                          <Badge variant="outline" className="ml-auto text-[10px]">{r.category}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-primary group-hover:underline mb-1">
                          {highlight(r.title, submitted)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {highlight(r.description, submitted)}
                        </p>
                      </Card>
                    </a>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
