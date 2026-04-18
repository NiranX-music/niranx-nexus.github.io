import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useLandingHighlights } from "@/hooks/useLandingHighlights";
import { motion } from "framer-motion";

function getIcon(name: string | null) {
  if (!name) return Sparkles;
  return ((LucideIcons as any)[name] as typeof Sparkles) || Sparkles;
}

export function HighlightsBar() {
  const { highlights, loading } = useLandingHighlights(true);

  if (loading || highlights.length === 0) return null;

  return (
    <section
      aria-label="Featured highlights"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Highlights
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((h, i) => {
          const Icon = getIcon(h.icon);
          const gradient =
            h.gradient_from && h.gradient_to
              ? `linear-gradient(135deg, ${h.gradient_from}, ${h.gradient_to})`
              : undefined;

          const content = (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-5 hover:border-primary/40 transition-all hover:shadow-elegant h-full"
              style={gradient ? { backgroundImage: gradient } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {h.title}
                    </h3>
                    {h.badge && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        {h.badge}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:rotate-45 transition-all" />
              </div>
              {h.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {h.description}
                </p>
              )}
            </motion.div>
          );

          return h.is_external ? (
            <a key={h.id} href={h.url} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <Link key={h.id} to={h.url}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
