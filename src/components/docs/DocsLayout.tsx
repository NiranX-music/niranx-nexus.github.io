import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, ChevronRight, ChevronDown, BookOpen, Code, Palette,
  Rocket, Shield, Users, Zap, Settings, Eye, TestTube, Brain,
  Globe, Lock, FileText, Cpu, BarChart, Key, Layers, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocLink {
  title: string;
  path: string;
  icon?: React.ElementType;
  badge?: string;
}

interface DocSection {
  title: string;
  icon: React.ElementType;
  links: DocLink[];
}

const docsSections: DocSection[] = [
  {
    title: "Introduction",
    icon: BookOpen,
    links: [
      { title: "Welcome to NiranX", path: "/docs/welcome" },
      { title: "Quick Start", path: "/docs/quick-start" },
      { title: "Platform Overview", path: "/docs/overview" },
    ],
  },
  {
    title: "Build",
    icon: Code,
    links: [
      { title: "AI Hub", path: "/docs/features/ai-hub" },
      { title: "XGenesis AI", path: "/docs/features/xgenesis-ai" },
      { title: "Code Playground", path: "/docs/features/code-playground" },
      { title: "Custom Pages", path: "/docs/features/custom-pages" },
      { title: "Integrations", path: "/docs/features/integrations" },
    ],
  },
  {
    title: "Study & Learn",
    icon: Brain,
    links: [
      { title: "Focus Engine", path: "/docs/features/focus-engine" },
      { title: "Flashcards & Spaced Repetition", path: "/docs/features/flashcards" },
      { title: "Virtual Labs", path: "/docs/features/virtual-labs" },
      { title: "Study Groups", path: "/docs/features/study-groups" },
      { title: "Exam Hub", path: "/docs/features/exam-hub" },
    ],
  },
  {
    title: "Design",
    icon: Palette,
    links: [
      { title: "Theme Customization", path: "/docs/design/themes" },
      { title: "Design System", path: "/docs/design/design-system" },
      { title: "Widget Settings", path: "/docs/design/widgets" },
    ],
  },
  {
    title: "Collaborate",
    icon: Users,
    links: [
      { title: "Study Rooms", path: "/docs/collaborate/study-rooms" },
      { title: "Classrooms", path: "/docs/collaborate/classrooms" },
      { title: "Community & Forums", path: "/docs/collaborate/community" },
      { title: "XFlow Social", path: "/docs/collaborate/xflow" },
    ],
  },
  {
    title: "Deploy & Host",
    icon: Rocket,
    links: [
      { title: "Publishing Pages", path: "/docs/deploy/publishing" },
      { title: "Custom Domains", path: "/docs/deploy/custom-domains" },
      { title: "PWA & Extensions", path: "/docs/deploy/pwa" },
    ],
  },
  {
    title: "Optimize",
    icon: BarChart,
    links: [
      { title: "Analytics Dashboard", path: "/docs/optimize/analytics" },
      { title: "Focus Analytics", path: "/docs/optimize/focus-analytics" },
      { title: "Leaderboard & Gamification", path: "/docs/optimize/gamification" },
    ],
  },
  {
    title: "Security & Privacy",
    icon: Shield,
    links: [
      { title: "Security Overview", path: "/docs/security/overview" },
      { title: "Two-Factor Auth", path: "/docs/security/2fa" },
      { title: "Session Management", path: "/docs/security/sessions" },
      { title: "Audit Logs", path: "/docs/security/audit-logs" },
      { title: "Privacy Settings", path: "/docs/security/privacy" },
      { title: "SSO & SCIM", path: "/docs/security/sso", badge: "ENT" },
    ],
  },
  {
    title: "API & Developer",
    icon: Cpu,
    links: [
      { title: "API Overview", path: "/docs/api/overview" },
      { title: "AI API Reference", path: "/docs/api/ai-api" },
      { title: "REST API", path: "/docs/api/rest-api" },
      { title: "Webhooks", path: "/docs/api/webhooks" },
      { title: "Rate Limits", path: "/docs/api/rate-limits" },
    ],
  },
  {
    title: "Admin",
    icon: Settings,
    links: [
      { title: "Admin Dashboard", path: "/docs/admin/dashboard" },
      { title: "Role Management", path: "/docs/admin/roles" },
      { title: "Content Moderation", path: "/docs/admin/moderation" },
      { title: "Page Management", path: "/docs/admin/pages" },
    ],
  },
];

const navTabs = [
  { label: "Introduction", path: "/docs/welcome" },
  { label: "Features", path: "/docs/features/ai-hub" },
  { label: "API", path: "/docs/api/overview" },
  { label: "Security", path: "/docs/security/overview" },
  { label: "Changelog", path: "/docs/changelog" },
];

export function DocsLayout() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(docsSections.map(s => s.title))
  );

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const filteredSections = search
    ? docsSections.map(s => ({
        ...s,
        links: s.links.filter(l =>
          l.title.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.links.length > 0)
    : docsSections;

  const isActive = (path: string) => location.pathname === path;
  const activeTab = navTabs.find(t => location.pathname.startsWith(t.path.split("/").slice(0, 3).join("/")));

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search docs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/50"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        {filteredSections.map(section => (
          <div key={section.title} className="mb-1">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center gap-2 w-full px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {expandedSections.has(section.title) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <section.icon className="h-3.5 w-3.5" />
              {section.title}
            </button>
            {expandedSections.has(section.title) && (
              <div className="ml-3 border-l border-border/40 pl-3 space-y-0.5">
                {section.links.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                      isActive(link.path)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="truncate">{link.title}</span>
                    {link.badge && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-auto">
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/docs/welcome" className="flex items-center gap-2 font-bold text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="gradient-text">NiranX Docs</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {navTabs.map(tab => (
              <Link
                key={tab.label}
                to={tab.path}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  activeTab?.label === tab.label
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/niranx/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 border-r border-border/50 sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
          {sidebar}
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="relative w-72 h-full bg-background border-r border-border/50 shadow-xl">
              {sidebar}
            </aside>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
