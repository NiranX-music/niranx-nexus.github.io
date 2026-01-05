import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plug, Calendar, Cloud, BookOpen, MessageSquare,
  FileText, Video, Music, Database, Link2,
  Check, X, Settings, ExternalLink, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "productivity" | "storage" | "communication" | "learning" | "media";
  connected: boolean;
  features: string[];
}

const integrations: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync your study schedule with Google Calendar",
    icon: <Calendar className="h-6 w-6" />,
    category: "productivity",
    connected: true,
    features: ["Two-way sync", "Event reminders", "Schedule import"],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Access and store files in Google Drive",
    icon: <Cloud className="h-6 w-6" />,
    category: "storage",
    connected: true,
    features: ["File sync", "Backup", "Share files"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect your Notion workspace for notes",
    icon: <BookOpen className="h-6 w-6" />,
    category: "productivity",
    connected: false,
    features: ["Note sync", "Database import", "Templates"],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Get study notifications in Discord",
    icon: <MessageSquare className="h-6 w-6" />,
    category: "communication",
    connected: false,
    features: ["Notifications", "Study groups", "Bot commands"],
  },
  {
    id: "spotify",
    name: "Spotify",
    description: "Connect Spotify for focus music",
    icon: <Music className="h-6 w-6" />,
    category: "media",
    connected: true,
    features: ["Focus playlists", "Music control", "Recommendations"],
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Save and organize educational videos",
    icon: <Video className="h-6 w-6" />,
    category: "learning",
    connected: false,
    features: ["Video library", "Watch later", "Notes sync"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Store and sync files with Dropbox",
    icon: <Database className="h-6 w-6" />,
    category: "storage",
    connected: false,
    features: ["File backup", "Share links", "Version history"],
  },
  {
    id: "todoist",
    name: "Todoist",
    description: "Sync tasks with Todoist",
    icon: <FileText className="h-6 w-6" />,
    category: "productivity",
    connected: false,
    features: ["Task sync", "Projects", "Labels"],
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "productivity", label: "Productivity" },
  { id: "storage", label: "Storage" },
  { id: "communication", label: "Communication" },
  { id: "learning", label: "Learning" },
  { id: "media", label: "Media" },
];

export default function IntegrationHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const { toast } = useToast();

  const filteredIntegrations = localIntegrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || integration.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleConnection = (id: string) => {
    setLocalIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
    
    const integration = localIntegrations.find((i) => i.id === id);
    toast({
      title: integration?.connected ? "Disconnected" : "Connected",
      description: `${integration?.name} has been ${integration?.connected ? "disconnected" : "connected"}`,
    });
  };

  const connectedCount = localIntegrations.filter((i) => i.connected).length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Plug className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Integration Hub</h1>
              <p className="text-muted-foreground">Connect your favorite apps</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {connectedCount} Connected
          </Badge>
        </div>

        {/* Search & Filter */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search integrations..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-border/50 bg-card/50 backdrop-blur h-full transition-all ${
                integration.connected ? "ring-2 ring-primary/20" : ""
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        integration.connected 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={integration.connected}
                      onCheckedChange={() => toggleConnection(integration.id)}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {integration.connected && (
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="h-4 w-4" />
                        Connected
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Request Integration */}
        <Card className="border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <CardContent className="p-6 text-center">
            <Link2 className="h-10 w-10 mx-auto mb-4 text-emerald-500" />
            <h3 className="font-semibold text-lg mb-2">Missing an integration?</h3>
            <p className="text-muted-foreground mb-4">
              Let us know which apps you'd like to connect with NiranX
            </p>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Request Integration
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
