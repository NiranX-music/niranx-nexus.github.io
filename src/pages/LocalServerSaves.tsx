import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Database, Cloud, Calendar, FileText, Trash2, Download, 
  RefreshCw, Search, User, HardDrive, Filter
} from "lucide-react";
import { format } from "date-fns";

interface LocalSave {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  bucket_name: string | null;
  original_data: any;
  updated_at: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null };
}

export default function LocalServerSaves() {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [saves, setSaves] = useState<LocalSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"my" | "all">("my");

  useEffect(() => {
    if (user) fetchSaves();
  }, [user, viewMode]);

  const fetchSaves = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("local_server_saves")
        .select("*")
        .order("created_at", { ascending: false });

      if (viewMode === "my" || !isAdmin) {
        query = query.eq("user_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSaves((data || []) as LocalSave[]);
    } catch (error: any) {
      console.error("Error fetching saves:", error);
      toast.error("Failed to load saved data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string | null, bucketName: string | null) => {
    try {
      // Move to recycle bin first
      const saveToDelete = saves.find(s => s.id === id);
      if (saveToDelete) {
        await supabase.from("recycle_bin").insert([{
          user_id: saveToDelete.user_id,
          original_table: "local_server_saves",
          original_id: id,
          original_data: saveToDelete as any,
          bucket_name: bucketName,
          file_path: storagePath
        }]);
      }

      // Delete from storage if exists
      if (storagePath && bucketName) {
        await supabase.storage.from(bucketName).remove([storagePath]);
      }

      // Delete from table
      const { error } = await supabase.from("local_server_saves").delete().eq("id", id);
      if (error) throw error;

      setSaves(saves.filter(s => s.id !== id));
      toast.success("Moved to recycle bin");
    } catch (error: any) {
      console.error("Error deleting save:", error);
      toast.error("Failed to delete");
    }
  };

  const handleDownload = async (save: LocalSave) => {
    if (!save.storage_path || !save.bucket_name) {
      toast.error("File not available for download");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from(save.bucket_name)
        .download(save.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = save.file_name || "download";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading:", error);
      toast.error("Download failed");
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "google_drive": return <Cloud className="h-4 w-4" />;
      case "google_calendar": return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "google_drive": return "Google Drive";
      case "google_calendar": return "Google Calendar";
      case "cloud_files": return "Cloud Files";
      default: return source;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredSaves = saves.filter(save => {
    const matchesSearch = 
      save.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      save.source_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === "all" || save.source_type === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const totalSize = saves.reduce((acc, s) => acc + (s.file_size || 0), 0);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-primary" />
            Local Server Saves
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage data saved from cloud services to our servers
          </p>
        </div>
        <Button onClick={fetchSaves} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Saves</p>
              <p className="text-2xl font-bold">{saves.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Cloud className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">From Drive</p>
              <p className="text-2xl font-bold">
                {saves.filter(s => s.source_type === "google_drive").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">From Calendar</p>
              <p className="text-2xl font-bold">
                {saves.filter(s => s.source_type === "google_calendar").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <HardDrive className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin View Toggle */}
      {isAdmin && (
        <Card>
          <CardContent className="p-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "my" | "all")}>
              <TabsList>
                <TabsTrigger value="my" className="gap-2">
                  <User className="h-4 w-4" />
                  My Saves
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  <Database className="h-4 w-4" />
                  All Users (Admin)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="google_drive">Google Drive</SelectItem>
                <SelectItem value="google_calendar">Google Calendar</SelectItem>
                <SelectItem value="cloud_files">Cloud Files</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Data ({filteredSaves.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved data found</p>
              <p className="text-sm mt-2">
                Save data from Google Drive or Calendar to see it here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  {viewMode === "all" && isAdmin && <TableHead>User</TableHead>}
                  <TableHead>Saved At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSaves.map((save) => (
                  <TableRow key={save.id}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {getSourceIcon(save.source_type)}
                        {getSourceLabel(save.source_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {save.file_name || "Untitled"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {save.file_type || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(save.file_size)}</TableCell>
                    {viewMode === "all" && isAdmin && (
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {(save as any).profiles?.full_name || (save as any).profiles?.email || "Unknown"}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      {format(new Date(save.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {save.storage_path && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(save)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(save.id, save.storage_path, save.bucket_name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}