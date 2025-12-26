import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Trash2, RotateCcw, Search, RefreshCw, Settings, 
  Clock, Database, FileText, Music, Image, MessageSquare,
  AlertTriangle
} from "lucide-react";
import { format, formatDistanceToNow, addDays } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RecycledItem {
  id: string;
  user_id: string;
  original_table: string;
  original_id: string;
  original_data: any;
  bucket_name: string | null;
  file_path: string | null;
  deleted_at: string;
  scheduled_permanent_delete: string | null;
  retention_days: number;
  is_permanently_deleted: boolean;
}

interface RecycleSettings {
  id: string;
  user_id: string;
  retention_days: number;
  auto_delete_enabled: boolean;
}

export default function RecycleBin() {
  const { user } = useAuth();
  const [items, setItems] = useState<RecycledItem[]>([]);
  const [settings, setSettings] = useState<RecycleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingRetention, setPendingRetention] = useState("30");

  useEffect(() => {
    if (user) {
      fetchItems();
      fetchSettings();
    }
  }, [user]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("recycle_bin")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_permanently_deleted", false)
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching recycle bin:", error);
      toast.error("Failed to load recycle bin");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_recycle_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setSettings(data);
        setPendingRetention(data.retention_days.toString());
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      const retentionDays = pendingRetention === "never" ? -1 : parseInt(pendingRetention);
      
      const { error } = await supabase
        .from("user_recycle_settings")
        .upsert({
          user_id: user?.id,
          retention_days: retentionDays,
          auto_delete_enabled: retentionDays !== -1
        });

      if (error) throw error;
      
      setSettings({
        id: settings?.id || "",
        user_id: user?.id || "",
        retention_days: retentionDays,
        auto_delete_enabled: retentionDays !== -1
      });
      
      toast.success("Settings saved");
      setSettingsOpen(false);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleRestore = async (item: RecycledItem) => {
    try {
      // Restore to original table
      const { error: insertError } = await supabase
        .from(item.original_table as any)
        .insert(item.original_data);

      if (insertError) throw insertError;

      // Mark as restored in recycle bin
      const { error: updateError } = await supabase
        .from("recycle_bin")
        .update({ restored_at: new Date().toISOString() })
        .eq("id", item.id);

      if (updateError) throw updateError;

      // Remove from local state
      setItems(items.filter(i => i.id !== item.id));
      toast.success("Item restored successfully");
    } catch (error: any) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  const handlePermanentDelete = async (item: RecycledItem) => {
    try {
      // Delete from storage if applicable
      if (item.file_path && item.bucket_name) {
        await supabase.storage.from(item.bucket_name).remove([item.file_path]);
      }

      // Mark as permanently deleted
      const { error } = await supabase
        .from("recycle_bin")
        .update({ is_permanently_deleted: true })
        .eq("id", item.id);

      if (error) throw error;

      setItems(items.filter(i => i.id !== item.id));
      toast.success("Permanently deleted");
    } catch (error: any) {
      console.error("Error permanently deleting:", error);
      toast.error("Failed to delete permanently");
    }
  };

  const handleEmptyBin = async () => {
    try {
      // Delete all files from storage
      for (const item of items) {
        if (item.file_path && item.bucket_name) {
          await supabase.storage.from(item.bucket_name).remove([item.file_path]);
        }
      }

      // Mark all as permanently deleted
      const { error } = await supabase
        .from("recycle_bin")
        .update({ is_permanently_deleted: true })
        .eq("user_id", user?.id)
        .eq("is_permanently_deleted", false);

      if (error) throw error;

      setItems([]);
      toast.success("Recycle bin emptied");
    } catch (error: any) {
      console.error("Error emptying bin:", error);
      toast.error("Failed to empty recycle bin");
    }
  };

  const getTableIcon = (table: string) => {
    switch (table) {
      case "local_server_saves": return <Database className="h-4 w-4" />;
      case "tracks": 
      case "xvibe_tracks": return <Music className="h-4 w-4" />;
      case "user_cloud_files": return <FileText className="h-4 w-4" />;
      case "ai_conversations":
      case "ai_messages": return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTableLabel = (table: string) => {
    const labels: Record<string, string> = {
      local_server_saves: "Local Saves",
      tracks: "Music Tracks",
      xvibe_tracks: "XVibe Tracks",
      user_cloud_files: "Cloud Files",
      ai_conversations: "AI Chats",
      ai_messages: "AI Messages"
    };
    return labels[table] || table.replace(/_/g, " ");
  };

  const getItemName = (item: RecycledItem) => {
    const data = item.original_data;
    return data?.file_name || data?.title || data?.name || data?.subject || "Untitled";
  };

  const getExpiryDate = (item: RecycledItem) => {
    const retention = item.retention_days || settings?.retention_days || 30;
    if (retention === -1) return null;
    return addDays(new Date(item.deleted_at), retention);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = getItemName(item).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = tableFilter === "all" || item.original_table === tableFilter;
    return matchesSearch && matchesTable;
  });

  const uniqueTables = [...new Set(items.map(i => i.original_table))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trash2 className="h-8 w-8 text-destructive" />
            Recycle Bin
          </h1>
          <p className="text-muted-foreground mt-1">
            Recover deleted items or permanently remove them
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recycle Bin Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label>Auto-delete after:</Label>
                <RadioGroup value={pendingRetention} onValueChange={setPendingRetention}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7" id="7days" />
                    <Label htmlFor="7days">7 days</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="30days" />
                    <Label htmlFor="30days">30 days</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never">Never (manual delete only)</Label>
                  </div>
                </RadioGroup>
                <Button onClick={saveSettings} className="w-full">Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={fetchItems} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Empty Bin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Empty Recycle Bin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {items.length} items. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEmptyBin} className="bg-destructive">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Items in Bin</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Retention Period</p>
              <p className="text-2xl font-bold">
                {settings?.retention_days === -1 ? "Never" : `${settings?.retention_days || 30} days`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold">
                {items.filter(i => {
                  const expiry = getExpiryDate(i);
                  if (!expiry) return false;
                  const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return daysLeft <= 3;
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deleted items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTables.map(table => (
                  <SelectItem key={table} value={table}>
                    {getTableLabel(table)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deleted Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Recycle bin is empty</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const expiryDate = getExpiryDate(item);
                  const isExpiringSoon = expiryDate && 
                    Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 3;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getTableIcon(item.original_table)}
                          {getTableLabel(item.original_table)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {getItemName(item)}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(item.deleted_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {expiryDate ? (
                          <Badge variant={isExpiringSoon ? "destructive" : "secondary"}>
                            {format(expiryDate, "MMM d, yyyy")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Never</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestore(item)}
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4 text-primary" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                title="Delete permanently"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{getItemName(item)}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handlePermanentDelete(item)}
                                  className="bg-destructive"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}