import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HardDrive,
  FolderOpen,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  ArrowLeft,
  Trash2,
  Settings,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface DriveStats {
  id: string;
  drive_name: string;
  total_files: number;
  total_size: number;
  file_types: {
    documents: { count: number; size: number };
    images: { count: number; size: number };
    audio: { count: number; size: number };
    video: { count: number; size: number };
    archives: { count: number; size: number };
    others: { count: number; size: number };
  };
}

export default function ManageDrives() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drives, setDrives] = useState<DriveStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStorage, setTotalStorage] = useState({ used: 0, total: 15 * 1024 * 1024 * 1024 }); // 15GB default

  useEffect(() => {
    if (user) {
      fetchDriveStats();
    }
  }, [user]);

  const fetchDriveStats = async () => {
    if (!user) return;

    try {
      // Fetch all drives
      const { data: drivesData, error: drivesError } = await supabase
        .from("user_cloud_drives")
        .select("*")
        .eq("user_id", user.id);

      if (drivesError) throw drivesError;

      // Fetch all files
      const { data: filesData, error: filesError } = await supabase
        .from("user_cloud_files")
        .select("drive_id, file_size, file_type")
        .eq("user_id", user.id);

      if (filesError) throw filesError;

      // Calculate stats for each drive
      const driveStats: DriveStats[] = drivesData.map((drive) => {
        const driveFiles = filesData.filter((f) => f.drive_id === drive.id);
        const stats: DriveStats = {
          id: drive.id,
          drive_name: drive.drive_name,
          total_files: driveFiles.length,
          total_size: driveFiles.reduce((sum, f) => sum + (f.file_size || 0), 0),
          file_types: {
            documents: { count: 0, size: 0 },
            images: { count: 0, size: 0 },
            audio: { count: 0, size: 0 },
            video: { count: 0, size: 0 },
            archives: { count: 0, size: 0 },
            others: { count: 0, size: 0 },
          },
        };

        driveFiles.forEach((file) => {
          const type = file.file_type?.toLowerCase() || "";
          const size = file.file_size || 0;

          if (["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"].some((ext) => type.includes(ext))) {
            stats.file_types.documents.count++;
            stats.file_types.documents.size += size;
          } else if (["jpg", "jpeg", "png", "gif", "webp", "svg"].some((ext) => type.includes(ext))) {
            stats.file_types.images.count++;
            stats.file_types.images.size += size;
          } else if (["mp3", "wav", "ogg", "m4a"].some((ext) => type.includes(ext))) {
            stats.file_types.audio.count++;
            stats.file_types.audio.size += size;
          } else if (["mp4", "avi", "mkv", "mov"].some((ext) => type.includes(ext))) {
            stats.file_types.video.count++;
            stats.file_types.video.size += size;
          } else if (["zip", "rar", "7z", "tar", "gz"].some((ext) => type.includes(ext))) {
            stats.file_types.archives.count++;
            stats.file_types.archives.size += size;
          } else {
            stats.file_types.others.count++;
            stats.file_types.others.size += size;
          }
        });

        return stats;
      });

      setDrives(driveStats);

      // Calculate total storage used
      const totalUsed = filesData.reduce((sum, f) => sum + (f.file_size || 0), 0);
      setTotalStorage((prev) => ({ ...prev, used: totalUsed }));
    } catch (error) {
      console.error("Error fetching drive stats:", error);
      toast({
        title: "Error",
        description: "Failed to load drive statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStoragePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const deleteDrive = async (driveId: string) => {
    if (!confirm("Are you sure you want to delete this drive? All files will be permanently deleted.")) {
      return;
    }

    try {
      const { error } = await supabase.from("user_cloud_drives").delete().eq("id", driveId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Drive deleted successfully",
      });

      fetchDriveStats();
    } catch (error) {
      console.error("Error deleting drive:", error);
      toast({
        title: "Error",
        description: "Failed to delete drive",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/niranx/my-cloud")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Cloud
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Manage Drives
          </h1>
        </div>
        <Button onClick={() => navigate("/niranx/my-cloud")}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Drive
        </Button>
      </div>

      {/* Total Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Total Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatBytes(totalStorage.used)} used of {formatBytes(totalStorage.total)}
              </span>
              <Badge variant={getStoragePercentage(totalStorage.used, totalStorage.total) > 80 ? "destructive" : "secondary"}>
                {getStoragePercentage(totalStorage.used, totalStorage.total)}% Full
              </Badge>
            </div>
            <Progress value={getStoragePercentage(totalStorage.used, totalStorage.total)} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">Documents</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(drives.reduce((sum, d) => sum + d.file_types.documents.size, 0))}
                </p>
              </div>
              <div className="text-center">
                <Image className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Images</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(drives.reduce((sum, d) => sum + d.file_types.images.size, 0))}
                </p>
              </div>
              <div className="text-center">
                <Music className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium">Audio</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(drives.reduce((sum, d) => sum + d.file_types.audio.size, 0))}
                </p>
              </div>
              <div className="text-center">
                <Video className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-sm font-medium">Videos</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(drives.reduce((sum, d) => sum + d.file_types.video.size, 0))}
                </p>
              </div>
              <div className="text-center">
                <Archive className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-sm font-medium">Archives</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(drives.reduce((sum, d) => sum + d.file_types.archives.size, 0))}
                </p>
              </div>
              <div className="text-center">
                <FolderOpen className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                <p className="text-sm font-medium">Others</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(drives.reduce((sum, d) => sum + d.file_types.others.size, 0))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Drives */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Drives and Storage</h2>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {drives.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <HardDrive className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No drives found</p>
                  <p className="text-sm text-muted-foreground mb-4">Create your first drive to get started</p>
                  <Button onClick={() => navigate("/niranx/my-cloud")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Drive
                  </Button>
                </CardContent>
              </Card>
            ) : (
              drives.map((drive) => (
                <Card key={drive.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-primary" />
                        {drive.drive_name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/niranx/my-cloud/${drive.id}`)}
                        >
                          <FolderOpen className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteDrive(drive.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{formatBytes(drive.total_size)}</span>
                        <Badge variant="outline">{drive.total_files} files</Badge>
                      </div>
                      <Progress
                        value={getStoragePercentage(drive.total_size, totalStorage.total)}
                        className="h-2"
                      />
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-muted rounded">
                          <FileText className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                          <p>{drive.file_types.documents.count}</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <Image className="w-4 h-4 mx-auto mb-1 text-green-500" />
                          <p>{drive.file_types.images.count}</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <Music className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                          <p>{drive.file_types.audio.count}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
