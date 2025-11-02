import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Cloud, Upload, Trash2, Download, File, 
  Folder, FolderOpen, Loader2, FileText, 
  Music, Image as ImageIcon, Video 
} from "lucide-react";

interface CloudFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  folder_path: string;
  is_public: boolean;
  created_at: string;
}

export default function MyCloud() {
  const { user } = useAuth();
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFolder, setCurrentFolder] = useState("/");

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, currentFolder]);

  const fetchFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_cloud_files")
        .select("*")
        .eq("user_id", user.id)
        .eq("folder_path", currentFolder)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
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
    if (!e.target.files || !user) return;

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${currentFolder}${fileName}`;

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

  const handleDelete = async (fileId: string, filePath: string) => {
    if (!user) return;

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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Cloud className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">My Cloud</h1>
        </div>
        <p className="text-muted-foreground">
          Your personal cloud storage • ID: {user?.id.slice(0, 8)}...
        </p>
      </div>

      <Card className="glass-panel mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload Files</span>
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
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No files yet. Upload your first file!</p>
            </div>
          ) : (
            <div className="space-y-2">
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
    </div>
  );
}
