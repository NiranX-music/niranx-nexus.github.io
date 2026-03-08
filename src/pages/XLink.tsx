import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Link2, Plus, Trash2, GripVertical, Eye, Edit3, ExternalLink,
  Globe, Twitter, Github, Youtube, Instagram, Mail, Palette,
  Copy, Check, Sparkles, Image
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface XLinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  enabled: boolean;
  clicks: number;
}

interface XLinkProfile {
  displayName: string;
  bio: string;
  avatar: string;
  theme: string;
  links: XLinkItem[];
}

const THEMES = [
  { id: "cyber", label: "Cyber Neon", bg: "from-[hsl(var(--background))] to-[hsl(var(--muted))]", card: "bg-card/80 border-primary/30", text: "text-foreground" },
  { id: "midnight", label: "Midnight", bg: "from-[hsl(220,30%,8%)] to-[hsl(240,20%,15%)]", card: "bg-[hsl(220,20%,12%)]/80 border-blue-500/30", text: "text-blue-100" },
  { id: "sunset", label: "Sunset", bg: "from-[hsl(20,80%,10%)] to-[hsl(340,60%,15%)]", card: "bg-[hsl(350,30%,12%)]/80 border-orange-500/30", text: "text-orange-100" },
  { id: "forest", label: "Forest", bg: "from-[hsl(140,30%,8%)] to-[hsl(160,25%,12%)]", card: "bg-[hsl(150,20%,10%)]/80 border-emerald-500/30", text: "text-emerald-100" },
  { id: "minimal", label: "Minimal", bg: "from-[hsl(0,0%,96%)] to-[hsl(0,0%,92%)]", card: "bg-white/90 border-gray-200", text: "text-gray-900" },
];

const SOCIAL_ICONS: Record<string, any> = {
  globe: Globe, twitter: Twitter, github: Github,
  youtube: Youtube, instagram: Instagram, mail: Mail, link: Link2,
};

const DEFAULT_PROFILE: XLinkProfile = {
  displayName: "Your Name",
  bio: "Creator • Developer • Dreamer",
  avatar: "",
  theme: "cyber",
  links: [
    { id: "1", title: "My Portfolio", url: "https://example.com", icon: "globe", enabled: true, clicks: 42 },
    { id: "2", title: "GitHub", url: "https://github.com", icon: "github", enabled: true, clicks: 28 },
    { id: "3", title: "Twitter / X", url: "https://x.com", icon: "twitter", enabled: true, clicks: 15 },
  ],
};

function generateId() {
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function XLink() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<XLinkProfile>(() => {
    const saved = localStorage.getItem("xlink-profile");
    if (saved) try { return JSON.parse(saved); } catch { /* ignore */ }
    return { ...DEFAULT_PROFILE, displayName: user?.email?.split("@")[0] || "Your Name" };
  });
  const [tab, setTab] = useState("editor");
  const [copied, setCopied] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);

  const save = useCallback((p: XLinkProfile) => {
    setProfile(p);
    localStorage.setItem("xlink-profile", JSON.stringify(p));
  }, []);

  const addLink = () => {
    const newLink: XLinkItem = { id: generateId(), title: "New Link", url: "https://", icon: "link", enabled: true, clicks: 0 };
    save({ ...profile, links: [...profile.links, newLink] });
    setEditingLink(newLink.id);
  };

  const updateLink = (id: string, updates: Partial<XLinkItem>) => {
    save({ ...profile, links: profile.links.map(l => l.id === id ? { ...l, ...updates } : l) });
  };

  const removeLink = (id: string) => {
    save({ ...profile, links: profile.links.filter(l => l.id !== id) });
  };

  const copyUrl = () => {
    const slug = user?.email?.split("@")[0] || "user";
    navigator.clipboard.writeText(`${window.location.origin}/user/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  const currentTheme = THEMES.find(t => t.id === profile.theme) || THEMES[0];

  // Preview Component
  const Preview = () => (
    <div className={cn("rounded-2xl p-6 min-h-[500px] bg-gradient-to-b flex flex-col items-center", currentTheme.bg)}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3 mt-8 mb-6">
        <Avatar className="h-20 w-20 ring-2 ring-primary/40">
          <AvatarFallback className="text-2xl bg-primary/20 text-primary font-bold">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className={cn("text-xl font-bold", currentTheme.text)}>{profile.displayName}</h2>
        <p className={cn("text-sm opacity-70 text-center max-w-[200px]", currentTheme.text)}>{profile.bio}</p>
      </motion.div>

      <div className="w-full max-w-sm space-y-3">
        <AnimatePresence>
          {profile.links.filter(l => l.enabled).map((link, i) => {
            const Icon = SOCIAL_ICONS[link.icon] || Link2;
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer",
                  currentTheme.card
                )}
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <span className={cn("flex-1 font-medium text-sm", currentTheme.text)}>{link.title}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-40" />
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="mt-auto pt-8 text-[10px] opacity-30">Powered by XLink</p>
    </div>
  );

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            XLink
          </h1>
          <p className="text-sm text-muted-foreground">Your personal link-in-bio page</p>
        </div>
        <Button variant="outline" size="sm" onClick={copyUrl} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="editor" className="gap-1"><Edit3 className="h-3.5 w-3.5" /> Editor</TabsTrigger>
          <TabsTrigger value="preview" className="gap-1"><Eye className="h-3.5 w-3.5" /> Preview</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1"><Sparkles className="h-3.5 w-3.5" /> Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Display Name</Label>
                    <Input value={profile.displayName} onChange={e => save({ ...profile, displayName: e.target.value })} />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={profile.bio} onChange={e => save({ ...profile, bio: e.target.value })} rows={2} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Links</CardTitle>
                  <Button size="sm" onClick={addLink} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.links.map(link => (
                    <motion.div key={link.id} layout className="flex items-center gap-2 p-3 rounded-lg border bg-card/50">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                      <div className="flex-1 min-w-0">
                        {editingLink === link.id ? (
                          <div className="space-y-2">
                            <Input value={link.title} onChange={e => updateLink(link.id, { title: e.target.value })} placeholder="Title" className="h-8 text-sm" />
                            <Input value={link.url} onChange={e => updateLink(link.id, { url: e.target.value })} placeholder="URL" className="h-8 text-sm" />
                            <div className="flex gap-1 flex-wrap">
                              {Object.keys(SOCIAL_ICONS).map(icon => (
                                <Button key={icon} variant={link.icon === icon ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => updateLink(link.id, { icon })}>
                                  {(() => { const I = SOCIAL_ICONS[icon]; return <I className="h-3.5 w-3.5" />; })()}
                                </Button>
                              ))}
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => setEditingLink(null)}>Done</Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingLink(link.id)}>
                            {(() => { const I = SOCIAL_ICONS[link.icon] || Link2; return <I className="h-4 w-4 text-primary shrink-0" />; })()}
                            <span className="text-sm font-medium truncate">{link.title}</span>
                            <Badge variant="secondary" className="text-[9px] ml-auto shrink-0">{link.clicks} clicks</Badge>
                          </div>
                        )}
                      </div>
                      <Switch checked={link.enabled} onCheckedChange={v => updateLink(link.id, { enabled: v })} />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeLink(link.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                  {profile.links.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">No links yet. Add your first link above.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => save({ ...profile, theme: theme.id })}
                        className={cn(
                          "h-16 rounded-lg bg-gradient-to-b border-2 transition-all hover:scale-105",
                          theme.bg,
                          profile.theme === theme.id ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                        )}
                      >
                        <span className="text-[9px] font-medium opacity-70">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Eye className="h-3 w-3" /> Live Preview</p>
                <div className="rounded-2xl border overflow-hidden shadow-xl max-w-[360px] mx-auto">
                  <Preview />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="max-w-[400px] mx-auto rounded-2xl border overflow-hidden shadow-2xl">
            <Preview />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{profile.links.reduce((s, l) => s + l.clicks, 0)}</p><p className="text-xs text-muted-foreground mt-1">Total Clicks</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{profile.links.filter(l => l.enabled).length}</p><p className="text-xs text-muted-foreground mt-1">Active Links</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{profile.links.length}</p><p className="text-xs text-muted-foreground mt-1">Total Links</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Link Performance</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {profile.links.sort((a, b) => b.clicks - a.clicks).map(link => {
                const max = Math.max(...profile.links.map(l => l.clicks), 1);
                return (
                  <div key={link.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{link.title}</span>
                      <span className="text-muted-foreground">{link.clicks}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(link.clicks / max) * 100}%` }} className="h-full rounded-full bg-primary" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
