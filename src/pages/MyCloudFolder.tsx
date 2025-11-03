import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Cloud, Upload, Trash2, Download, File, 
  Folder, FolderOpen, Loader2, FileText, 
  Music, Image as ImageIcon, Video, FolderPlus,
  ArrowLeft, Edit, Save, X
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

interface CloudFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  folder_path: string;
  is_public: boolean;
  created_at: string;
  file_description?: string;
  tags?: string[];
}

export default function MyCloudFolder() {
  const { user } = useAuth();
  const { driveId, "*": folderPath = "" } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFolder, setCurrentFolder] = useState("/");
  const [driveName, setDriveName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<CloudFile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (folderPath) {
      setCurrentFolder("/" + folderPath + "/");
    } else {
      setCurrentFolder("/");
    }
  }, [folderPath]);

  useEffect(() => {
    if (user && driveId) {
      fetchDrive();
      fetchFiles();
    }
  }, [user, driveId, currentFolder]);

  const fetchDrive = async () => {
    if (!driveId) return;

    try {
      const { data, error } = await supabase
        .from("user_cloud_drives")
        .select("drive_name")
        .eq("id", driveId)
        .single();

      if (error) throw error;
      setDriveName(data.drive_name);
    } catch (error) {
      console.error("Error fetching drive:", error);
    }
  };

  const fetchFiles = async () => {
    if (!user || !driveId) return;

    try {
      const { data, error } = await supabase
        .from("user_cloud_files")
        .select("*")
        .eq("user_id", user.id)
        .eq("drive_id", driveId)
        .eq("folder_path", currentFolder)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);

      // Extract unique folders
      const folderSet = new Set<string>();
      (data || []).forEach((file) => {
        const path = file.folder_path.replace(currentFolder, "");
        const parts = path.split("/").filter(Boolean);
        if (parts.length > 0) {
          folderSet.add(parts[0]);
        }
      });
      setFolders(Array.from(folderSet));
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to load your files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user || !driveId) return;

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${driveId}${currentFolder}${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-cloud")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      const { data: { publicUrl } } = supabase.storage
        .from("user-cloud")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("user_cloud_files")
        .insert({
          user_id: user.id,
          drive_id: driveId,
          file_name: file.name,
          file_path: publicUrl,
          file_size: file.size,
          file_type: file.type,
          folder_path: currentFolder,
        });

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast({
        title: "Success!",
        description: `${file.name} uploaded successfully`,
      });

      fetchFiles();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newPath = currentFolder + newFolderName + "/";
    navigate(`/niranx/my-cloud/${driveId}${newPath.slice(1)}`);
    setNewFolderName("");
    setFolderDialogOpen(false);
  };

  const handleFolderClick = (folderName: string) => {
    const newPath = currentFolder + folderName + "/";
    navigate(`/niranx/my-cloud/${driveId}${newPath.slice(1)}`);
  };

  const handleGoBack = () => {
    const parts = currentFolder.split("/").filter(Boolean);
    if (parts.length === 0) {
      navigate("/niranx/my-cloud");
    } else {
      parts.pop();
      const newPath = parts.length > 0 ? "/" + parts.join("/") + "/" : "/";
      navigate(`/niranx/my-cloud/${driveId}${newPath.slice(1)}`);
    }
  };

  const handleEditFile = async () => {
    if (!editingFile) return;

    try {
      const { error } = await supabase
        .from("user_cloud_files")
        .update({
          file_description: editingFile.file_description,
          tags: editingFile.tags,
        })
        .eq("id", editingFile.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "File details updated",
      });

      setEditDialogOpen(false);
      setEditingFile(null);
      fetchFiles();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    if (!user || !confirm("Are you sure you want to delete this file?")) return;

    try {
      const storagePath = filePath.split("/user-cloud/")[1];
      
      const { error: storageError } = await supabase.storage
        .from("user-cloud")
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("user_cloud_files")
        .delete()
        .eq("id", fileId);

      if (dbError) throw dbError;

      toast({
        title: "Deleted",
        description: "File deleted successfully",
      });

      fetchFiles();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (fileType.startsWith("audio/")) return <Music className="w-5 h-5" />;
    if (fileType.includes("pdf") || fileType.includes("document")) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const totalSize = files.reduce((acc, file) => acc + file.file_size, 0);
  const breadcrumbs = currentFolder.split("/").filter(Boolean);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Cloud className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">{driveName || "My Cloud"}</h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-14">
          <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/niranx/my-cloud")}>
            Drives
          </span>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              <span>/</span>
              <span>{crumb}</span>
            </span>
          ))}
        </div>
      </div>

      <Card className="glass-panel mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload & Organize</span>
            <span className="text-sm font-normal text-muted-foreground">
              Total: {formatFileSize(totalSize)} • {files.length} files
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
                    />
                    <Button onClick={handleCreateFolder} className="w-full" disabled={!newFolderName.trim()}>
                      Create Folder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button disabled={uploading} variant="outline">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
            </div>
            {uploading && (
              <Progress value={uploadProgress} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Files & Folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No files or folders yet. Upload your first file!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors cursor-pointer"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-primary" />
                    <span className="font-medium">{folder}</span>
                  </div>
                </div>
              ))}

              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-primary">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                      {file.file_description && (
                        <p className="text-xs text-muted-foreground mt-1">{file.file_description}</p>
                      )}
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {file.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingFile(file);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.file_path, "_blank")}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id, file.file_path)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Details</DialogTitle>
          </DialogHeader>
          {editingFile && (
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">File Name</label>
                <Input value={editingFile.file_name} disabled />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Add a description..."
                  value={editingFile.file_description || ""}
                  onChange={(e) => setEditingFile({ ...editingFile, file_description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g., work, important, personal"
                  value={editingFile.tags?.join(", ") || ""}
                  onChange={(e) => setEditingFile({ 
                    ...editingFile, 
                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                  })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditFile} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
