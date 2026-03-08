import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Image, FileText, Music, Video, X, Download, Copy, CheckCircle2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DroppedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadedAt: Date;
  status: "uploading" | "ready" | "error";
  progress: number;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image className="h-5 w-5 text-primary" />;
  if (type.startsWith("video/")) return <Video className="h-5 w-5 text-primary" />;
  if (type.startsWith("audio/")) return <Music className="h-5 w-5 text-primary" />;
  if (type.includes("pdf")) return <FileText className="h-5 w-5 text-destructive" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const XDrop = () => {
  const [files, setFiles] = useState<DroppedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: DroppedFile[] = Array.from(fileList).map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      uploadedAt: new Date(),
      status: "uploading" as const,
      progress: 0,
    }));

    setFiles(prev => [...newFiles, ...prev]);

    // Simulate upload progress
    newFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: "ready", progress: 100 } : f));
          toast.success(`${file.name} ready`);
        } else {
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress } : f));
        }
      }, 300);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const copyLink = (file: DroppedFile) => {
    navigator.clipboard.writeText(`https://niranx.app/xdrop/${file.id}`);
    toast.success("Link copied!");
  };

  const readyFiles = files.filter(f => f.status === "ready").length;
  const totalSize = files.reduce((a, f) => a + f.size, 0);

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Upload className="h-8 w-8 text-primary" /> XDrop
        </h1>
        <p className="text-muted-foreground mt-1">Quick file sharing & drop zone</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Files", value: files.length },
          { label: "Ready", value: readyFiles },
          { label: "Total Size", value: formatSize(totalSize) },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/30 hover:border-primary/50"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input id="file-input" type="file" multiple className="hidden" onChange={handleFileInput} />
        <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-lg font-medium">{isDragging ? "Drop files here!" : "Drag & drop files or click to browse"}</p>
        <p className="text-sm text-muted-foreground mt-1">Any file type supported</p>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dropped Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.map((file, i) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  {file.preview ? (
                    <img src={file.preview} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatSize(file.size)}</span>
                      {file.status === "ready" && (
                        <Badge variant="outline" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Ready</Badge>
                      )}
                    </div>
                    {file.status === "uploading" && <Progress value={file.progress} className="h-1 mt-1" />}
                  </div>
                  <div className="flex items-center gap-1">
                    {file.status === "ready" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(file)}>
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFile(file.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
};

export default XDrop;
