import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FolderPlus, Upload, Music, Disc } from "lucide-react";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface AddToArtistCatalogueProps {
  artistId: string;
  artistName: string;
  onSuccess?: () => void;
}

interface UploadFile {
  file: File;
  title: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

export function AddToArtistCatalogue({
  artistId,
  artistName,
  onSuccess,
}: AddToArtistCatalogueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [albumName, setAlbumName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAdminCheck();
  const [canUpload, setCanUpload] = useState(false);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "moderator", "teacher", "music_moderator"]);
        setCanUpload(!!data && data.length > 0);
      }
    };
    checkPermissions();
  }, []);

  if (!canUpload && !isAdmin) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const audioFiles = selectedFiles.filter((f) =>
      f.type.startsWith("audio/")
    );

    const newFiles: UploadFile[] = audioFiles.map((file) => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const audioFiles = selectedFiles.filter((f) =>
      f.type.startsWith("audio/")
    );

    const newFiles: UploadFile[] = audioFiles.map((file) => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""),
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadFile = async (uploadFile: UploadFile, index: number): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to upload");
      return false;
    }

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "uploading" } : f))
    );

    try {
      // Generate unique filename
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("music")
        .upload(`tracks/${fileName}`, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("music")
        .getPublicUrl(`tracks/${fileName}`);

      // Create track record
      const { error: trackError } = await supabase.from("tracks").insert({
        title: uploadFile.title,
        artist: artistName,
        artist_id: artistId,
        audio_url: urlData.publicUrl,
        album: albumName || null,
        uploaded_by: user.id,
        is_approved: true,
      });

      if (trackError) {
        console.error("Database insert error:", trackError);
        throw new Error(`Database error: ${trackError.message}`);
      }

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, progress: 100, status: "done" } : f
        )
      );
      return true;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload "${uploadFile.title}": ${error.message}`);
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error" } : f))
      );
      return false;
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;
    
    // Upload in batches of 3 to avoid overwhelming the server
    const batchSize = 3;
    const pendingIndices = files
      .map((f, i) => ({ file: f, index: i }))
      .filter(({ file }) => file.status === "pending");
    
    for (let i = 0; i < pendingIndices.length; i += batchSize) {
      const batch = pendingIndices.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(({ file, index }) => uploadFile(file, index))
      );
      successCount += results.filter(Boolean).length;
      failCount += results.filter(r => !r).length;
    }

    setIsUploading(false);
    
    if (failCount > 0) {
      toast.warning(`Uploaded ${successCount} tracks. ${failCount} failed.`);
    } else {
      toast.success(`All ${successCount} tracks uploaded successfully!`);
    }
    onSuccess?.();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="h-4 w-4 mr-2" />
          Add to Catalogue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Songs to {artistName}'s Catalogue</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="files" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="files">
              <Music className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
            <TabsTrigger value="folder">
              <FolderPlus className="h-4 w-4 mr-2" />
              Folder
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="albumName">Album Name (Optional)</Label>
              <Input
                id="albumName"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="Enter album name for these tracks"
              />
            </div>
          </div>

          <TabsContent value="files" className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              className="w-full h-32 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8" />
                <span>Click to select audio files</span>
              </div>
            </Button>
          </TabsContent>

          <TabsContent value="folder" className="space-y-4">
            <input
              ref={folderInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleFolderSelect}
              {...({ webkitdirectory: "", directory: "" } as any)}
            />
            <Button
              variant="outline"
              className="w-full h-32 border-dashed"
              onClick={() => folderInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <FolderPlus className="h-8 w-8" />
                <span>Click to select a folder</span>
              </div>
            </Button>
          </TabsContent>
        </Tabs>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {files.length} file(s) selected
              </p>
              <Button onClick={() => setFiles([])}>Clear All</Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <Music className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Input
                      value={file.title}
                      onChange={(e) =>
                        setFiles((prev) =>
                          prev.map((f, i) =>
                            i === index ? { ...f, title: e.target.value } : f
                          )
                        )
                      }
                      className="h-8"
                    />
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      file.status === "done"
                        ? "text-green-500"
                        : file.status === "error"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {file.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleUploadAll}
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? "Uploading..." : `Upload ${files.length} Track(s)`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
