import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Cloud, Upload, Trash2, Download, File, 
  Folder, FolderOpen, Loader2, FileText, 
  Music, Image as ImageIcon, Video, FolderPlus,
  ArrowLeft, Edit, Save, X, Home, ChevronRight,
  MoreHorizontal, Search, Filter, LayoutGrid,
  List, Clock, Star, Users, HardDrive, Plus, FolderUp
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

interface CloudFolder {
  id: string;
  folder_name: string;
  folder_path: string;
  parent_path: string | null;
  created_at: string;
}

export default function MyCloudFolder() {
  const { user } = useAuth();
  const { driveId, "*": folderPath = "" } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [folders, setFolders] = useState<CloudFolder[]>([]);
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
      // Fetch files in current folder
      const { data: filesData, error: filesError } = await supabase
        .from("user_cloud_files")
        .select("*")
        .eq("user_id", user.id)
        .eq("drive_id", driveId)
        .eq("folder_path", currentFolder)
        .order("created_at", { ascending: false });

      if (filesError) throw filesError;
      setFiles(filesData || []);

      // Fetch folders in current path
      const { data: foldersData, error: foldersError } = await supabase
        .from("user_cloud_folders")
        .select("*")
        .eq("user_id", user.id)
        .eq("drive_id", driveId)
        .eq("parent_path", currentFolder)
        .order("created_at", { ascending: false });

      if (foldersError) throw foldersError;
      setFolders(foldersData || []);
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
        .from("my-cloud")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      const { data: { publicUrl } } = supabase.storage
        .from("my-cloud")
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

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user || !driveId) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const file of Array.from(files)) {
        // Extract folder structure from file path
        const relativePath = (file as any).webkitRelativePath || file.name;
        const pathParts = relativePath.split("/");
        const folderPath = currentFolder + pathParts.slice(0, -1).join("/") + "/";

        const fileExt = file.name.split(".").pop() || "";
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${user.id}/${driveId}${folderPath}${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("my-cloud")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("my-cloud").getPublicUrl(filePath);

        const { error: dbError } = await supabase.from("user_cloud_files").insert({
          user_id: user.id,
          drive_id: driveId,
          file_name: file.name,
          file_type: fileExt,
          file_size: file.size,
          file_path: urlData.publicUrl,
          folder_path: folderPath,
        });

        if (dbError) throw dbError;
        successCount++;
      }

      toast({
        title: "Success",
        description: `${successCount} file(s) uploaded successfully`,
      });

      fetchFiles();
    } catch (error) {
      console.error("Error uploading folder:", error);
      toast({
        title: "Error",
        description: "Failed to upload some files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user || !driveId) return;
    
    try {
      const newPath = currentFolder === "/" 
        ? `/${newFolderName}/`
        : `${currentFolder}${newFolderName}/`;

      const { error } = await supabase
        .from("user_cloud_folders")
        .insert({
          user_id: user.id,
          drive_id: driveId,
          folder_name: newFolderName,
          folder_path: newPath,
          parent_path: currentFolder,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Folder "${newFolderName}" created`,
      });

      setNewFolderName("");
      setFolderDialogOpen(false);
      fetchFiles();
    } catch (error: any) {
      console.error("Create folder error:", error);
      toast({
        title: "Failed to create folder",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleFolderClick = (folderPath: string) => {
    navigate(`/niranx/my-cloud/${driveId}${folderPath.slice(1)}`);
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Delete "${folderName}" and all its contents?`)) return;

    try {
      const { error } = await supabase
        .from("user_cloud_folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Folder deleted successfully",
      });

      fetchFiles();
    } catch (error: any) {
      console.error("Delete folder error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete folder",
        variant: "destructive",
      });
    }
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
      const storagePath = filePath.split("/my-cloud/")[1];
      
      const { error: storageError } = await supabase.storage
        .from("my-cloud")
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
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Folder Navigation */}
      <div className="w-64 border-r border-border bg-sidebar">
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 mb-4"
            onClick={() => navigate("/niranx/my-cloud")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Drives
          </Button>
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-primary" />
            <h2 className="font-semibold truncate">{driveName}</h2>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => navigate(`/niranx/my-cloud/${driveId}`)}
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Folder className="w-4 h-4 text-primary" />
              Desktop
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Folder className="w-4 h-4 text-blue-500" />
              Documents
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Folder className="w-4 h-4 text-green-500" />
              Downloads
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Folder className="w-4 h-4 text-cyan-500" />
              Pictures
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Folder className="w-4 h-4 text-orange-500" />
              Music
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Folder className="w-4 h-4 text-purple-500" />
              Videos
            </Button>
            
            {folders.length > 0 && (
              <>
                <div className="pt-4 pb-2 px-2 text-xs font-semibold text-muted-foreground">
                  Folders
                </div>
                {folders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => handleFolderClick(folder.folder_path)}
                  >
                    <Folder className="w-4 h-4 text-yellow-500" />
                    {folder.folder_name}
                  </Button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ghost" size="icon">
              <Upload className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ghost" size="sm">
              Sort
            </Button>
            <Button variant="ghost" size="sm">
              <LayoutGrid className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search Home"
                className="pl-9 w-64 h-8 bg-muted/50"
              />
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 flex items-center gap-2 text-sm bg-muted/30">
          <Home className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span>Home</span>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span>{crumb}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Quick Access Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Quick access</h3>
                <Button variant="ghost" size="sm" onClick={() => setFolderDialogOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Folders */}
                {folders.map((folder) => (
                  <div key={folder.id} className="group cursor-pointer">
                    <div 
                      className="aspect-square rounded-lg border border-border/50 bg-card/50 hover:bg-accent/10 transition-colors flex flex-col items-center justify-center gap-2 p-4"
                      onClick={() => handleFolderClick(folder.folder_path)}
                    >
                      <FolderOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium truncate">{folder.folder_name}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id, folder.folder_name);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Desktop folder */}
                <div className="group cursor-pointer">
                  <div className="aspect-square rounded-lg border border-border/50 bg-card/50 hover:bg-accent/10 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                    <Folder className="w-12 h-12 text-primary" />
                    <span className="text-xs text-center">Desktop</span>
                  </div>
                </div>
                
                {/* Dynamic folders */}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="group cursor-pointer"
                    onClick={() => handleFolderClick(folder.folder_path)}
                  >
                    <div className="aspect-square rounded-lg border border-border/50 bg-card/50 hover:bg-accent/10 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                      <Folder className="w-12 h-12 text-yellow-500" />
                      <span className="text-xs text-center truncate w-full">{folder.folder_name}</span>
                    </div>
                  </div>
                ))}
                
                {/* Upload file card */}
                <label className="group cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 bg-muted/30 hover:bg-accent/10 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                    {uploading ? (
                      <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-12 h-12 text-muted-foreground" />
                    )}
                    <span className="text-xs text-center text-muted-foreground">
                      {uploading ? "Uploading..." : "Upload file"}
                    </span>
                  </div>
                </label>
                
                {/* Upload folder card */}
                <label className="group cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFolderUpload}
                    disabled={uploading}
                    {...({ webkitdirectory: "", directory: "" } as any)}
                    multiple
                    className="hidden"
                  />
                  <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 bg-muted/30 hover:bg-accent/10 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                    {uploading ? (
                      <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    ) : (
                      <FolderUp className="w-12 h-12 text-muted-foreground" />
                    )}
                    <span className="text-xs text-center text-muted-foreground">
                      {uploading ? "Uploading..." : "Upload folder"}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Tabs Section */}
            <div>
              <div className="flex items-center gap-6 border-b border-border mb-4">
                <button className="flex items-center gap-2 pb-3 border-b-2 border-primary text-primary">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Recent</span>
                </button>
                <button className="flex items-center gap-2 pb-3 text-muted-foreground hover:text-foreground">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Favorites</span>
                </button>
                <button className="flex items-center gap-2 pb-3 text-muted-foreground hover:text-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Shared</span>
                </button>
              </div>

              {/* Table View */}
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
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Date accessed</th>
                        <th className="px-4 py-3 font-medium">Activity</th>
                        <th className="px-4 py-3 font-medium w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => (
                        <tr
                          key={file.id}
                          className="border-t border-border hover:bg-accent/10 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="text-primary">
                                {getFileIcon(file.file_type)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{file.file_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.file_size)}
                                  {file.file_description && ` • ${file.file_description}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(file.created_at).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            {file.tags && file.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {file.tags.slice(0, 2).map((tag, i) => (
                                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingFile(file);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(file.file_path, "_blank")}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(file.id, file.file_path)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
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

      {/* Edit File Dialog */}
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
