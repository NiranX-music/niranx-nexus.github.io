import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Globe, Compass, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface ExploreLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string;
  category: string;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function ExploreAll() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<ExploreLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from("explore_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setLinks(data as ExploreLink[]);
      setLoading(false);
    };
    fetchLinks();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(links.map(l => l.category))];
    return ["All", ...cats];
  }, [links]);

  const filtered = useMemo(() => {
    return links.filter(l => {
      const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || l.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [links, search, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
          
          <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-6">
                <Compass className="w-3.5 h-3.5" />
                Explore NiranX
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold font-[Orbitron] mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
                Explore All from NiranX
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Discover every product, tool, and platform in the NiranX ecosystem
              </p>

              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search platforms..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 bg-card/60 backdrop-blur-sm border-border/50"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No links found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  {link.cover_image_url ? (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={link.cover_image_url}
                        alt={link.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <Globe className="h-10 w-10 text-primary/30" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {link.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                    </div>
                    {link.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {link.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {link.category}
                    </Badge>
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {/* Explore XNexus CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16 mb-8"
          >
            <Button
              size="lg"
              onClick={() => navigate("/nexus")}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl shadow-lg shadow-primary/20"
            >
              <Sparkles className="h-5 w-5" />
              Explore XNexus
            </Button>
          </motion.div>
      </div>
    </div>
  );
}
