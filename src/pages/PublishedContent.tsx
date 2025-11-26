import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Download, Play, Pause, Loader2, ArrowLeft, Image as ImageIcon, FileText, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PublishedContent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  useEffect(() => {
    loadContent();
  }, [slug]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generations")
        .select("*")
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setContent(data);
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Content not found");
      navigate("/");
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

  const downloadContent = () => {
    if (!content) return;
    
    const url = content.result_data?.audio_url || content.result_data?.image_url;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `${content.result_data?.title || 'download'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Content Not Found</CardTitle>
            <CardDescription>This content may have been unpublished or doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (content.tool_type) {
      case 'song':
        return (
          <Card className="max-w-2xl mx-auto">
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
                    {content.result_data?.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {content.prompt}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={togglePlayPause}
                  className="flex-1"
                  size="lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Play
                    </>
                  )}
                </Button>
                <Button 
                  onClick={downloadContent}
                  variant="outline"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </div>
              <audio
                controls
                className="w-full"
                src={content.result_data?.audio_url}
              />
            </CardContent>
          </Card>
        );

      case 'image':
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                AI Generated Image
              </CardTitle>
              <CardDescription>{content.prompt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <img 
                src={content.result_data?.image_url} 
                alt={content.prompt}
                className="w-full rounded-lg"
              />
              <Button onClick={downloadContent} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </CardContent>
          </Card>
        );

      case 'presentation':
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                {content.result_data?.title}
              </CardTitle>
              <CardDescription>{content.prompt}</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                src={content.result_data?.presentation_url}
                className="w-full h-[600px] rounded-lg border"
                title="Presentation"
              />
            </CardContent>
          </Card>
        );

      case 'website':
        return (
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                {content.result_data?.title}
              </CardTitle>
              <CardDescription>{content.prompt}</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                srcDoc={content.result_data?.html_code}
                className="w-full h-[800px] rounded-lg border"
                title="Website"
              />
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm">{JSON.stringify(content.result_data, null, 2)}</pre>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        {renderContent()}
      </div>
    </div>
  );
}
