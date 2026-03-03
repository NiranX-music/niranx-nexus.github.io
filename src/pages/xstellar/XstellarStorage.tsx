import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { HardDrive, FolderOpen, Eye, EyeOff, RefreshCw } from "lucide-react";

interface BucketInfo {
  name: string;
  isPublic: boolean;
  fileCount: number;
}

const KNOWN_BUCKETS: BucketInfo[] = [
  { name: "exam-resources", isPublic: false, fileCount: 0 },
  { name: "avatars", isPublic: true, fileCount: 0 },
  { name: "music-hub", isPublic: true, fileCount: 0 },
  { name: "photo-gallery", isPublic: true, fileCount: 0 },
  { name: "chat-files", isPublic: false, fileCount: 0 },
  { name: "files", isPublic: false, fileCount: 0 },
  { name: "music", isPublic: true, fileCount: 0 },
  { name: "videos", isPublic: true, fileCount: 0 },
  { name: "images", isPublic: true, fileCount: 0 },
  { name: "music-files", isPublic: true, fileCount: 0 },
  { name: "class-files", isPublic: false, fileCount: 0 },
  { name: "groq_attachments", isPublic: true, fileCount: 0 },
  { name: "listed-songs", isPublic: true, fileCount: 0 },
  { name: "personal-songs", isPublic: false, fileCount: 0 },
  { name: "xflow-media", isPublic: true, fileCount: 0 },
  { name: "niranx-docs", isPublic: true, fileCount: 0 },
  { name: "xstage-files", isPublic: true, fileCount: 0 },
  { name: "my-cloud", isPublic: true, fileCount: 0 },
];

export function XstellarStorage() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBucketFiles = async (bucketName: string) => {
    setSelectedBucket(bucketName);
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(bucketName).list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (!error) setFiles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> Buckets ({KNOWN_BUCKETS.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-0.5 p-2">
              {KNOWN_BUCKETS.map((bucket) => (
                <button
                  key={bucket.name}
                  onClick={() => loadBucketFiles(bucket.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                    selectedBucket === bucket.name ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{bucket.name}</span>
                  </span>
                  {bucket.isPublic ? (
                    <Eye className="h-3 w-3 text-green-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {selectedBucket ? `${selectedBucket} files` : "Select a bucket"}
            </CardTitle>
            {selectedBucket && (
              <Button variant="ghost" size="sm" onClick={() => loadBucketFiles(selectedBucket)}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : files.length > 0 ? (
            <ScrollArea className="h-[55vh]">
              <div className="space-y-1">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm">
                    <span className="truncate flex-1">{file.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {file.metadata?.size && (
                        <Badge variant="outline" className="text-xs">{formatSize(file.metadata.size)}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : selectedBucket ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No files in this bucket</div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">Click a bucket to browse files</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
