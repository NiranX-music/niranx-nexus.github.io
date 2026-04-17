import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/discover/PageMeta";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { DiscoverPage, buildPageTree } from "@/types/discover";
import { DiscoverSidebar } from "@/components/discover/DiscoverSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Heart, Calendar, Tag, ArrowRight, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DiscoverFeed() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();
  const [pages, setPages] = useState<DiscoverPage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("discover_pages")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      setPages((data as DiscoverPage[]) || []);
      setLoading(false);
    })();
  }, []);

  const tree = useMemo(() => buildPageTree(pages), [pages]);

  const filtered = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [pages, search]);

  const highlight = (text: string) => {
    if (!search.trim()) return text;
    const re = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(re).map((p, i) =>
      re.test(p) ? <span key={i} className="bg-primary/30 rounded px-0.5">{p}</span> : <span key={i}>{p}</span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Discover NiranX Pages — Knowledge Hub & Articles</title>
        <meta name="description" content="Explore curated articles, documentation, and knowledge pages on NiranX. AI-powered summaries, deep dives, and rich content." />
        <link rel="canonical" href="/discover" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Discover NiranX Pages",
          description: "Knowledge hub of articles, docs, and guides.",
        })}</script>
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)]">
        <DiscoverSidebar tree={tree} search={search} onSearchChange={setSearch} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-10 pb-32">
            {/* Hero */}
            <header className="mb-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                DISCOVER · NIRANX PAGES
              </div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Knowledge worth diving into
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Curated articles, deep dives, and documentation. Use AI to summarize, simplify, or generate study notes from any page.
              </p>
              {isAdmin && (
                <div className="mt-6">
                  <Button onClick={() => navigate("/admin/discover")} size="lg" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Manage Pages
                  </Button>
                </div>
              )}
            </header>

            {/* Feed */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  {search ? "No pages match your search." : "No pages published yet."}
                </p>
                {isAdmin && !search && (
                  <Button onClick={() => navigate("/admin/discover/new")} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" /> Create first page
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-5">
                {filtered.map((page) => (
                  <article
                    key={page.id}
                    onClick={() => navigate(`/discover/${page.slug}`)}
                    className="group cursor-pointer rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all p-6 backdrop-blur-sm"
                  >
                    <div className="flex gap-5">
                      {page.cover_image_url && (
                        <img
                          src={page.cover_image_url}
                          alt={page.title}
                          loading="lazy"
                          className="w-32 h-32 rounded-xl object-cover flex-shrink-0 border border-border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {page.published_at &&
                            formatDistanceToNow(new Date(page.published_at), { addSuffix: true })}
                          {page.author_name && <span>· by {page.author_name}</span>}
                        </div>
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {highlight(page.title)}
                        </h2>
                        {page.description && (
                          <p className="text-muted-foreground line-clamp-2 mb-3">
                            {highlight(page.description)}
                          </p>
                        )}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {page.tags.slice(0, 4).map((t) => (
                              <Badge key={t} variant="secondary" className="text-[10px] gap-1">
                                <Tag className="h-2.5 w-2.5" /> {t}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {page.view_count}</span>
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {page.like_count}</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
