import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Chrome, 
  Download, 
  Link2, 
  Settings, 
  BookOpen, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  FileText,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SyncedData {
  id: string;
  type: "bookmark" | "note" | "highlight" | "reading";
  title: string;
  url?: string;
  content?: string;
  timestamp: string;
}

export default function BrowserExtensionSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [syncToken, setSyncToken] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [syncBookmarks, setSyncBookmarks] = useState(true);
  const [syncNotes, setSyncNotes] = useState(true);
  const [syncHighlights, setSyncHighlights] = useState(true);
  const [syncReadingList, setSyncReadingList] = useState(true);
  const [syncedData, setSyncedData] = useState<SyncedData[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSyncSettings();
      loadSyncedData();
    }
  }, [user]);

  const loadSyncSettings = async () => {
    // Simulated - would load from user settings
    const token = localStorage.getItem("browser_sync_token");
    if (token) {
      setSyncToken(token);
      setIsConnected(true);
    }
  };

  const loadSyncedData = async () => {
    try {
      const { data, error } = await supabase
        .from("smart_bookmarks")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formatted: SyncedData[] = (data || []).map((item: any) => ({
        id: item.id,
        type: "bookmark",
        title: item.title,
        url: item.url,
        timestamp: item.created_at,
      }));

      setSyncedData(formatted);
      setLastSync(new Date());
    } catch (error) {
      console.error("Error loading synced data:", error);
    }
  };

  const generateSyncToken = () => {
    const token = `niranx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    setSyncToken(token);
    localStorage.setItem("browser_sync_token", token);
    setIsConnected(true);
    toast({
      title: "Token generated",
      description: "Use this token to connect your browser extension",
    });
  };

  const copyToken = async () => {
    await navigator.clipboard.writeText(syncToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Token copied to clipboard",
    });
  };

  const disconnect = () => {
    setSyncToken("");
    setIsConnected(false);
    localStorage.removeItem("browser_sync_token");
    toast({
      title: "Disconnected",
      description: "Browser extension has been disconnected",
    });
  };

  const manualSync = async () => {
    toast({
      title: "Syncing...",
      description: "Fetching latest data from browser extension",
    });
    await loadSyncedData();
    toast({
      title: "Sync complete",
      description: "All data is up to date",
    });
  };

  const getTypeIcon = (type: SyncedData["type"]) => {
    switch (type) {
      case "bookmark":
        return <Bookmark className="h-4 w-4 text-primary" />;
      case "note":
        return <FileText className="h-4 w-4 text-accent" />;
      case "highlight":
        return <Zap className="h-4 w-4 text-warning" />;
      case "reading":
        return <BookOpen className="h-4 w-4 text-success" />;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
          <Chrome className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Browser Extension Sync
          </h1>
          <p className="text-muted-foreground">
            Connect your browser extension to sync bookmarks, notes, and more
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Connection
              </CardTitle>
              <CardDescription>
                Connect your browser extension
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">
                    {isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "Active" : "Inactive"}
                </Badge>
              </div>

              {!isConnected ? (
                <Button onClick={generateSyncToken} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Sync Token
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Sync Token</Label>
                    <div className="flex gap-2">
                      <Input
                        value={syncToken}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button variant="outline" size="icon" onClick={copyToken}>
                        {copied ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={manualSync}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={disconnect}
                      className="text-destructive hover:text-destructive"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}

              {lastSync && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last sync: {lastSync.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Sync Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-sync</Label>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sync Bookmarks</Label>
                <Switch checked={syncBookmarks} onCheckedChange={setSyncBookmarks} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sync Notes</Label>
                <Switch checked={syncNotes} onCheckedChange={setSyncNotes} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sync Highlights</Label>
                <Switch checked={syncHighlights} onCheckedChange={setSyncHighlights} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sync Reading List</Label>
                <Switch checked={syncReadingList} onCheckedChange={setSyncReadingList} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Synced Data Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Synced Data
              </CardTitle>
              <CardDescription>
                Recently synced items from your browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <ScrollArea className="h-[500px]">
                    {syncedData.length > 0 ? (
                      <div className="space-y-3">
                        {syncedData.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                          >
                            {getTypeIcon(item.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.title}</p>
                              {item.url && (
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline truncate block"
                                >
                                  {item.url}
                                </a>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {item.type}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Globe className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No synced data yet</p>
                        <p className="text-sm text-muted-foreground/70">
                          Install the browser extension and start syncing
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="bookmarks">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {syncedData
                        .filter(item => item.type === "bookmark")
                        .map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-start gap-3 p-4 rounded-xl border bg-card"
                          >
                            <Bookmark className="h-4 w-4 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.title}</p>
                              {item.url && (
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline truncate block"
                                >
                                  {item.url}
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes">
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No notes synced yet</p>
                  </div>
                </TabsContent>

                <TabsContent value="highlights">
                  <div className="text-center py-12">
                    <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No highlights synced yet</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Extension Download Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Get the Browser Extension
            </CardTitle>
            <CardDescription>
              Install our extension to sync your browsing data with NiranX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Chrome", icon: Chrome, status: "Coming Soon" },
                { name: "Firefox", icon: Globe, status: "Coming Soon" },
                { name: "Edge", icon: Globe, status: "Coming Soon" },
              ].map((browser) => (
                <div
                  key={browser.name}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <browser.icon className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium">{browser.name}</span>
                  </div>
                  <Badge variant="secondary">{browser.status}</Badge>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Privacy First</p>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and only synced when you're logged in. 
                    We never sell or share your browsing data.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
