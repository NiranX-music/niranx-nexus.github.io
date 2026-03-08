import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Cloud, Smartphone, Monitor, Tablet, CheckCircle2, AlertCircle, Clock, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface SyncDevice {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet";
  lastSync: Date;
  status: "synced" | "syncing" | "error" | "offline";
  browser: string;
}

interface SyncCategory {
  name: string;
  enabled: boolean;
  itemCount: number;
  lastSync: Date;
  size: string;
}

const XSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [autoSync, setAutoSync] = useState(true);
  const [syncOnWifiOnly, setSyncOnWifiOnly] = useState(false);

  const [devices] = useState<SyncDevice[]>([
    { id: "1", name: "MacBook Pro", type: "desktop", lastSync: new Date(Date.now() - 120000), status: "synced", browser: "Chrome 121" },
    { id: "2", name: "iPhone 15", type: "mobile", lastSync: new Date(Date.now() - 3600000), status: "synced", browser: "Safari 17" },
    { id: "3", name: "iPad Air", type: "tablet", lastSync: new Date(Date.now() - 86400000), status: "offline", browser: "Safari 17" },
  ]);

  const [categories, setCategories] = useState<SyncCategory[]>([
    { name: "Tasks & Boards", enabled: true, itemCount: 47, lastSync: new Date(Date.now() - 60000), size: "12 KB" },
    { name: "Notes & Vault", enabled: true, itemCount: 23, lastSync: new Date(Date.now() - 120000), size: "8 KB" },
    { name: "Flashcards", enabled: true, itemCount: 156, lastSync: new Date(Date.now() - 300000), size: "45 KB" },
    { name: "Study Progress", enabled: true, itemCount: 89, lastSync: new Date(Date.now() - 600000), size: "6 KB" },
    { name: "Bookmarks & Links", enabled: false, itemCount: 34, lastSync: new Date(Date.now() - 7200000), size: "3 KB" },
    { name: "Theme & Preferences", enabled: true, itemCount: 12, lastSync: new Date(Date.now() - 1800000), size: "1 KB" },
  ]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop": return <Monitor className="h-5 w-5" />;
      case "mobile": return <Smartphone className="h-5 w-5" />;
      case "tablet": return <Tablet className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "synced": return <Badge variant="outline" className="text-emerald-500 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Synced</Badge>;
      case "syncing": return <Badge variant="outline" className="text-blue-500 border-blue-500/30 animate-pulse"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Syncing</Badge>;
      case "error": return <Badge variant="outline" className="text-red-500 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case "offline": return <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30"><WifiOff className="h-3 w-3 mr-1" />Offline</Badge>;
      default: return null;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          toast.success("All data synced successfully!");
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const toggleCategory = (index: number) => {
    setCategories(prev => prev.map((cat, i) => i === index ? { ...cat, enabled: !cat.enabled } : cat));
  };

  const enabledCount = categories.filter(c => c.enabled).length;
  const totalItems = categories.filter(c => c.enabled).reduce((a, c) => a + c.itemCount, 0);

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cloud className="h-8 w-8 text-primary" />
            XSync
          </h1>
          <p className="text-muted-foreground mt-1">Cross-device sync & data management</p>
        </div>
        <Button onClick={handleSyncNow} disabled={isSyncing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isSyncing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <CardContent className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Syncing {totalItems} items...</span>
                  <span className="font-mono">{Math.min(100, Math.round(syncProgress))}%</span>
                </div>
                <Progress value={Math.min(100, syncProgress)} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Devices", value: devices.length, icon: <Monitor className="h-4 w-4" /> },
          { label: "Categories", value: `${enabledCount}/${categories.length}`, icon: <Cloud className="h-4 w-4" /> },
          { label: "Items Synced", value: totalItems, icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: "Last Sync", value: "2m ago", icon: <Clock className="h-4 w-4" /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Devices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.map((device, i) => (
            <motion.div key={device.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">{getDeviceIcon(device.type)}</div>
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">{device.browser} · {formatTimeAgo(device.lastSync)}</p>
                </div>
              </div>
              {getStatusBadge(device.status)}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Sync Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sync Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.itemCount} items · {cat.size} · {formatTimeAgo(cat.lastSync)}</p>
              </div>
              <Switch checked={cat.enabled} onCheckedChange={() => toggleCategory(i)} />
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Sync</p>
              <p className="text-xs text-muted-foreground">Automatically sync when changes are detected</p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Wi-Fi Only</p>
                <p className="text-xs text-muted-foreground">Only sync when connected to Wi-Fi</p>
              </div>
            </div>
            <Switch checked={syncOnWifiOnly} onCheckedChange={setSyncOnWifiOnly} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default XSync;
