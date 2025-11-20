import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AIContextualSuggestions } from "@/components/AIContextualSuggestions";
import { HardDrive, Plus, Loader2, Trash2, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CloudDrive {
  id: string;
  drive_name: string;
  drive_description: string;
  created_at: string;
}

export default function MyCloudDrives() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drives, setDrives] = useState<CloudDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDrive, setNewDrive] = useState({ name: "", description: "" });

  useEffect(() => {
    if (user) {
      fetchDrives();
    }
  }, [user]);

  const fetchDrives = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_cloud_drives")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrives(data || []);
    } catch (error) {
      console.error("Error fetching drives:", error);
      toast({
        title: "Error",
        description: "Failed to load your drives",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async () => {
    if (!user || !newDrive.name.trim()) return;

    try {
      const { error } = await supabase
        .from("user_cloud_drives")
        .insert({
          user_id: user.id,
          drive_name: newDrive.name,
          drive_description: newDrive.description,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Drive created successfully",
      });

      setNewDrive({ name: "", description: "" });
      setDialogOpen(false);
      fetchDrives();
    } catch (error: any) {
      console.error("Create drive error:", error);
      toast({
        title: "Failed to create drive",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDrive = async (driveId: string) => {
    if (!confirm("Are you sure? This will delete all files in this drive.")) return;

    try {
      const { error } = await supabase
        .from("user_cloud_drives")
        .delete()
        .eq("id", driveId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Drive deleted successfully",
      });

      fetchDrives();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">My Cloud Drives</h1>
          </div>
          <p className="text-muted-foreground">
            Select a drive or create a new one to organize your files
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Drive
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Drive</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Drive Name</label>
                <Input
                  placeholder="e.g., Personal Files, Work Documents"
                  value={newDrive.name}
                  onChange={(e) => setNewDrive({ ...newDrive, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  placeholder="What will you store here?"
                  value={newDrive.description}
                  onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateDrive} className="w-full" disabled={!newDrive.name.trim()}>
                Create Drive
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : drives.length === 0 ? (
        <Card className="glass-panel">
          <CardContent className="text-center py-12">
            <HardDrive className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No drives yet</p>
            <p className="text-muted-foreground mb-4">Create your first drive to start organizing files</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create First Drive
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.map((drive) => (
            <Card
              key={drive.id}
              className="glass-panel hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    <span className="truncate">{drive.drive_name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDrive(drive.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {drive.drive_description || "No description"}
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/niranx/my-cloud/${drive.id}`)}
                >
                  Open Drive
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AIContextualSuggestions 
        context="cloud storage and file organization" 
        title="Organization Tips"
        description="AI-powered suggestions for managing your cloud drives"
      />
    </div>
  );
}
