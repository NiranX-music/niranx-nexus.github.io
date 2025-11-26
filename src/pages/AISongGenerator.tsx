import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Music, Loader2, Download, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AISongGenerator() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<{
    audio_url: string;
    title: string;
    prompt: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  const generateSong = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a song description");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-song', {
        body: { 
          prompt: prompt.trim(),
          title: title.trim() || "Untitled Song"
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedSong({
        audio_url: data.audio_url,
        title: data.title,
        prompt: prompt
      });

      toast.success("Song generated successfully!");
    } catch (error: any) {
      console.error('Error generating song:', error);
      toast.error(error.message || "Failed to generate song");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!generatedSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = generatedSong.audio_url;
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => setIsPlaying(false);
    }
  };

  const downloadSong = () => {
    if (!generatedSong) return;
    
    const link = document.createElement('a');
    link.href = generatedSong.audio_url;
    link.download = `${generatedSong.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Song Generator</h1>
          <p className="text-muted-foreground">
            Create custom songs with Sonauto AI - describe your song and let AI compose it
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Your Song</CardTitle>
          <CardDescription>
            Describe the song you want to create - include genre, mood, theme, instruments, or any specific details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Song Title (Optional)</Label>
            <Input
              id="title"
              placeholder="My Awesome Song"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Song Description *</Label>
            <Textarea
              id="prompt"
              placeholder="Example: An upbeat pop song about studying late at night, with electronic beats and inspiring lyrics about perseverance"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={loading}
            />
          </div>

          <Button 
            onClick={generateSong} 
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Song...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Generate Song
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedSong && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              {generatedSong.title}
            </CardTitle>
            <CardDescription>{generatedSong.prompt}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={togglePlayPause}
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              <Button 
                onClick={downloadSong}
                variant="outline"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <audio
              controls
              className="w-full"
              src={generatedSong.audio_url}
            />
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Be specific:</strong> Include genre, mood, tempo, and instruments</p>
          <p>• <strong>Describe the theme:</strong> What's the song about? Study motivation, relaxation, celebration?</p>
          <p>• <strong>Set the vibe:</strong> Upbeat, calm, energetic, melancholic, inspiring?</p>
          <p>• <strong>Add details:</strong> Vocal style, specific sounds, or musical references</p>
        </CardContent>
      </Card>
    </div>
  );
}
