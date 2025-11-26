import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Youtube, Plus, Sparkles, Clock, Star, BookOpen } from "lucide-react";

export default function YouTubeLibrary() {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [timestamp, setTimestamp] = useState("");
  const [timestampNote, setTimestampNote] = useState("");

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleAddVideo = async () => {
    if (!videoUrl || !title) {
      toast.error("Please provide video URL and title");
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate AI summary
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke(
        "summarize-youtube",
        {
          body: { videoId, title, subject },
        }
      );

      if (summaryError) throw summaryError;

      const { error } = await supabase.from("video_library").insert({
        user_id: user.id,
        title,
        video_url: videoUrl,
        video_id: videoId,
        subject,
        ai_summary: summaryData.summary.summary,
        key_topics: summaryData.summary.keyTopics,
        timestamps: summaryData.summary.suggestedTimestamps || [],
      });

      if (error) throw error;

      toast.success("Video added successfully!");
      setVideoUrl("");
      setTitle("");
      setSubject("");
      loadVideos();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("video_library")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
    }
  };

  const handleAddTimestamp = async () => {
    if (!selectedVideo || !timestamp || !timestampNote) {
      toast.error("Please fill in timestamp and note");
      return;
    }

    try {
      const newTimestamp = {
        time: timestamp,
        title: timestampNote,
        description: "",
      };

      const updatedTimestamps = [...(selectedVideo.timestamps || []), newTimestamp];

      const { error } = await supabase
        .from("video_library")
        .update({ timestamps: updatedTimestamps })
        .eq("id", selectedVideo.id);

      if (error) throw error;

      toast.success("Timestamp added!");
      setTimestamp("");
      setTimestampNote("");
      loadVideos();
      setSelectedVideo({ ...selectedVideo, timestamps: updatedTimestamps });
    } catch (error) {
      console.error("Error adding timestamp:", error);
      toast.error("Failed to add timestamp");
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Youtube className="h-8 w-8 text-red-500" />
            YouTube Learning Library
          </h1>
          <p className="text-muted-foreground mt-2">
            Save educational videos with AI summaries and timestamped notes
          </p>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <TabsList>
            <TabsTrigger value="add">Add Video</TabsTrigger>
            <TabsTrigger value="library">My Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add YouTube Video</CardTitle>
                <CardDescription>
                  Paste a YouTube URL and we'll generate an AI summary with key topics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">YouTube URL *</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoTitle">Title *</Label>
                  <Input
                    id="videoTitle"
                    placeholder="E.g., Introduction to React Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoSubject">Subject (optional)</Label>
                  <Input
                    id="videoSubject"
                    placeholder="E.g., Web Development"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddVideo} disabled={loading} className="w-full" size="lg">
                  {loading ? "Processing..." : "Add Video & Generate Summary"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {videos.map((video) => (
                  <Card
                    key={video.id}
                    className={`cursor-pointer transition-all ${
                      selectedVideo?.id === video.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-40 h-24 object-cover rounded"
                        />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold">{video.title}</h3>
                          {video.subject && (
                            <Badge variant="outline">{video.subject}</Badge>
                          )}
                          {video.ai_summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {video.ai_summary}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {video.key_topics?.slice(0, 3).map((topic: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {videos.length === 0 && (
                  <Card className="p-12 text-center">
                    <Youtube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No videos yet. Add your first educational video!
                    </p>
                  </Card>
                )}
              </div>

              {selectedVideo && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Youtube className="h-5 w-5" />
                        Video Player
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${selectedVideo.video_id}`}
                          title={selectedVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedVideo.ai_summary}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timestamps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedVideo.timestamps?.map((ts: any, idx: number) => (
                        <div key={idx} className="flex gap-2 text-sm border-l-2 border-primary pl-3">
                          <Badge variant="outline">{ts.time}</Badge>
                          <span>{ts.title}</span>
                        </div>
                      ))}

                      <div className="space-y-2 pt-3 border-t">
                        <Label>Add Timestamp</Label>
                        <Input
                          placeholder="00:00"
                          value={timestamp}
                          onChange={(e) => setTimestamp(e.target.value)}
                        />
                        <Input
                          placeholder="Note"
                          value={timestampNote}
                          onChange={(e) => setTimestampNote(e.target.value)}
                        />
                        <Button onClick={handleAddTimestamp} size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
