import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Download, Play, Pause, Loader2, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PublishedSong() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  useEffect(() => {
    loadContent();
    return () => { audio.pause(); };
  }, [songId]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generations")
        .select("*")
        .eq('id', songId)
        .eq('is_published', true)
        .eq('tool_type', 'song')
        .single();

      if (error) throw error;
      setContent(data);
    } catch (error) {
      console.error("Error loading song:", error);
      toast.error("Song not found");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!content?.result_data?.audio_url) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = content.result_data.audio_url;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const downloadSong = () => {
    if (!content?.result_data?.audio_url) return;
    const link = document.createElement('a');
    link.href = content.result_data.audio_url;
    link.download = `${content.result_data?.title || 'ai-song'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const shareSong = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Song Not Found</CardTitle>
            <CardDescription>This song may have been unpublished or doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              {content.cover_image_url && (
                <img
                  src={content.cover_image_url}
                  alt="Cover"
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Music className="h-6 w-6 text-primary" />
                  {content.result_data?.title || "AI Song"}
                </CardTitle>
                <CardDescription className="mt-2">
                  {content.prompt}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Published {new Date(content.published_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={togglePlayPause} className="flex-1" size="lg">
                {isPlaying ? (
                  <><Pause className="mr-2 h-5 w-5" /> Pause</>
                ) : (
                  <><Play className="mr-2 h-5 w-5" /> Play</>
                )}
              </Button>
              <Button onClick={downloadSong} variant="outline" size="lg">
                <Download className="h-5 w-5" />
              </Button>
              <Button onClick={shareSong} variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            <audio
              controls
              className="w-full"
              src={content.result_data?.audio_url}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
