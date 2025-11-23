import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Youtube, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Video {
  id: string;
  video_url: string;
  video_title: string;
  video_description: string | null;
  order_index: number;
}

interface ClassroomVideoManagerProps {
  classroomId: string;
  videos: Video[];
  isTeacher: boolean;
}

export function ClassroomVideoManager({ classroomId, videos, isTeacher }: ClassroomVideoManagerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const addVideo = useMutation({
    mutationFn: async () => {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const { error } = await supabase
        .from("classroom_videos")
        .insert({
          classroom_id: classroomId,
          video_url: videoUrl,
          video_title: videoTitle,
          video_description: videoDescription || null,
          added_by: user?.id,
          order_index: videos.length,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classroom-videos", classroomId] });
      toast({ title: "Video added", description: "Video has been added to the library." });
      setOpen(false);
      setVideoUrl("");
      setVideoTitle("");
      setVideoDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("classroom_videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classroom-videos", classroomId] });
      toast({ title: "Video removed", description: "Video has been removed from the library." });
    },
  });

  return (
    <div className="space-y-4">
      {isTeacher && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add YouTube Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">YouTube URL</label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Video Title</label>
                <Input
                  placeholder="Enter video title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Enter video description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={() => addVideo.mutate()}
                disabled={!videoUrl || !videoTitle || addVideo.isPending}
                className="w-full"
              >
                {addVideo.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Video"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {videos.length === 0 ? (
        <Card className="p-12 text-center">
          <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <p className="text-muted-foreground">
            {isTeacher ? "Add your first video to the library" : "No videos available"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => {
            const videoId = extractVideoId(video.video_url);
            return (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={video.video_title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{video.video_title}</h4>
                      {video.video_description && (
                        <p className="text-sm text-muted-foreground">
                          {video.video_description}
                        </p>
                      )}
                    </div>
                    {isTeacher && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteVideo.mutate(video.id)}
                        disabled={deleteVideo.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
