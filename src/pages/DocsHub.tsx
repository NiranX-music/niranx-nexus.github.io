import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allPages, pageCategories, accessLevelColors, PageInfo } from "@/data/allPages";
import {
  Search, BookOpen, Shield, AlertTriangle, Info, ChevronRight,
  ExternalLink, Lock, Zap, Users, Settings, FileText, Globe,
  Layers, Eye, ChevronDown, Star, Terminal, Cpu
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// Platform restrictions & limitations data
const platformRestrictions = [
  {
    title: "Authentication Required",
    description: "Most features require user authentication. Guest mode provides limited access to Focus Engine and public pages only.",
    severity: "info" as const,
    icon: Lock,
  },
  {
    title: "Role-Based Access Control",
    description: "Admin, Moderator, Teacher, and Guardian pages are restricted to users with the corresponding role. Unauthorized access attempts are blocked by RLS policies.",
    severity: "warning" as const,
    icon: Shield,
  },
  {
    title: "File Upload Limits",
    description: "File uploads are subject to storage quotas managed by admins via Space Limits. Exceeding limits will prevent further uploads until space is freed.",
    severity: "warning" as const,
    icon: AlertTriangle,
  },
  {
    title: "AI Usage Limits",
    description: "AI features (Chat, Solver, PDF Summarizer, Image Gen) use Lovable AI credits. Rate limits apply: excessive usage may result in temporary throttling.",
    severity: "critical" as const,
    icon: Cpu,
  },
  {
    title: "No Backend Code Execution",
    description: "The platform runs on React + Vite. Backend logic is handled via Lovable Cloud edge functions. No Python, Node.js, or Ruby execution is available.",
    severity: "info" as const,
    icon: Terminal,
  },
  {
    title: "Real-time Features",
    description: "Chat rooms, live classrooms, and notifications rely on real-time subscriptions. Poor connectivity may cause delayed updates.",
    severity: "info" as const,
    icon: Zap,
  },
  {
    title: "XVibe Music Platform",
    description: "Music uploads require artist registration. Uploaded content goes through moderation before becoming publicly available.",
    severity: "warning" as const,
    icon: Shield,
  },
  {
    title: "Custom Page Submissions",
    description: "User-submitted custom pages (via Xstellar) require admin approval before publishing. Malicious code is sandboxed in iframes.",
    severity: "warning" as const,
    icon: Globe,
  },
];

const platformCapabilities = [
  { label: "Total Pages", value: allPages.length.toString(), icon: Layers },
  { label: "Categories", value: pageCategories.length.toString(), icon: Star },
  { label: "Public Pages", value: allPages.filter(p => p.accessLevel === "Public").length.toString(), icon: Globe },
  { label: "Admin Pages", value: allPages.filter(p => p.accessLevel === "Admin").length.toString(), icon: Shield },
];

const severityStyles = {
  info: "border-blue-500/30 bg-blue-500/5 text-blue-400",
  warning: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  critical: "border-red-500/30 bg-red-500/5 text-red-400",
};

export default function DocsHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Core"]));

  const filteredPages = useMemo(() => {
    return allPages.filter(page => {
      const matchesSearch =
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const pagesByCategory = useMemo(() => {
    const grouped: Record<string, PageInfo[]> = {};
    filteredPages.forEach(page => {
      if (!grouped[page.category]) grouped[page.category] = [];
      grouped[page.category].push(page);
    });
    return grouped;
  }, [filteredPages]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb,0,255,200),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb,0,255,200),0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-mono tracking-tight">
                  NiranX <span className="text-primary">Docs</span>
                </h1>
                <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                  Platform Documentation & Reference
                </p>
              </div>
            </div>

            <p className="text-muted-foreground max-w-2xl mb-6">
              Complete guide to every page, feature, access level, restriction, and limitation across the NiranX platform.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {platformCapabilities.map(stat => (
                <div key={stat.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-lg font-bold font-mono text-primary">{stat.value}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages, routes, features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-card/80 border-border/50 font-mono text-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1">
            <TabsTrigger value="pages" className="font-mono text-xs">
              <Layers className="h-3.5 w-3.5 mr-1.5" />All Pages
            </TabsTrigger>
            <TabsTrigger value="restrictions" className="font-mono text-xs">
              <Shield className="h-3.5 w-3.5 mr-1.5" />Restrictions
            </TabsTrigger>
            <TabsTrigger value="access" className="font-mono text-xs">
              <Lock className="h-3.5 w-3.5 mr-1.5" />Access Levels
            </TabsTrigger>
          </TabsList>

          {/* === PAGES TAB === */}
          <TabsContent value="pages" className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="font-mono text-xs h-8"
              >
                All ({allPages.length})
              </Button>
              {pageCategories.map(cat => {
                const count = allPages.filter(p => p.category === cat).length;
                return (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className="font-mono text-xs h-8"
                  >
                    {cat} ({count})
                  </Button>
                );
              })}
            </div>

            {/* Results */}
            <p className="text-xs font-mono text-muted-foreground">
              {filteredPages.length} of {allPages.length} pages
            </p>

            {/* Grouped Pages */}
            <div className="space-y-3">
              {Object.entries(pagesByCategory).map(([category, pages]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-border/50 rounded-xl overflow-hidden bg-card/30"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-[10px]">{category}</Badge>
                      <span className="text-sm font-medium">{pages.length} pages</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategories.has(category) ? "rotate-180" : ""}`} />
                  </button>

                  {/* Pages List */}
                  <AnimatePresence>
                    {expandedCategories.has(category) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/30">
                          {pages.map((page, idx) => (
                            <div
                              key={page.route}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors border-b border-border/20 last:border-0"
                            >
                              <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                                {getIcon(page.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{page.name}</span>
                                  <Badge className={`${accessLevelColors[page.accessLevel]} text-[9px] px-1.5 py-0`}>
                                    {page.accessLevel}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <code className="text-[10px] text-muted-foreground font-mono">{page.route}</code>
                                  <span className="text-[10px] text-muted-foreground hidden sm:inline">— {page.description}</span>
                                </div>
                              </div>
                              {!page.route.includes(":") && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" asChild>
                                  <Link to={page.route}>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* === RESTRICTIONS TAB === */}
          <TabsContent value="restrictions" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold font-mono mb-1">Platform Restrictions & Limitations</h2>
              <p className="text-sm text-muted-foreground">
                Important rules, constraints, and limitations to be aware of when using the platform.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {platformRestrictions.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border rounded-xl p-4 ${severityStyles[item.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1 text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className={`text-[9px] uppercase font-mono ${
                      item.severity === "critical" ? "border-red-500/50 text-red-400" :
                      item.severity === "warning" ? "border-amber-500/50 text-amber-400" :
                      "border-blue-500/50 text-blue-400"
                    }`}>
                      {item.severity}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Technical Limitations */}
            <div className="border border-border/50 rounded-xl p-5 bg-card/30 mt-6">
              <h3 className="font-bold font-mono text-sm mb-3 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Technical Stack Limitations
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Built on <strong className="text-foreground">React 18 + Vite + TypeScript + Tailwind CSS</strong>. No Angular, Vue, Svelte, or Next.js support.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Backend via <strong className="text-foreground">Lovable Cloud</strong> (edge functions, database, auth, storage). No direct server-side code execution.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Database queries limited to <strong className="text-foreground">1000 rows</strong> per request by default.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Real-time subscriptions require <strong className="text-foreground">active connection</strong>. Offline mode supports limited note access via IndexedDB.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>AI features powered by <strong className="text-foreground">Lovable AI gateway</strong> — supports Gemini, GPT-5, and other models without separate API keys.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Custom pages run inside <strong className="text-foreground">sandboxed iframes</strong> for security isolation.</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* === ACCESS LEVELS TAB === */}
          <TabsContent value="access" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold font-mono mb-1">Access Level Reference</h2>
              <p className="text-sm text-muted-foreground">
                Each page has an access level determining who can view and interact with it.
              </p>
            </div>

            {Object.entries(accessLevelColors).map(([level, colorClass]) => {
              const pagesForLevel = allPages.filter(p => p.accessLevel === level);
              return (
                <motion.div
                  key={level}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-border/50 rounded-xl overflow-hidden bg-card/30"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <Badge className={colorClass}>{level}</Badge>
                      <span className="text-sm font-mono text-muted-foreground">{pagesForLevel.length} pages</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {pagesForLevel.map(page => (
                        <Link
                          key={page.route}
                          to={page.route.includes(":") ? "#" : page.route}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-primary/5 hover:bg-primary/10 border border-border/30 transition-colors"
                        >
                          {getIcon(page.icon)}
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
