import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Loader2, Download, Play, Pause, Disc3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreditsDisplay } from "@/components/ui/CreditsDisplay";

export default function AISongGenerator() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractStems, setExtractStems] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<{
    audio_url: string;
    title: string;
    prompt: string;
    stems?: Record<string, string>;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  const generateSong = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a song description");
      return;
    }

    setLoading(true);
    toast.info("Starting song generation... This may take 1-2 minutes");
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('AISongGenerator session', session, sessionError);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-song`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            title: title.trim() || "Untitled Song"
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 402) {
          throw new Error("Insufficient Sonauto API credits. Please check your account.");
        } else if (response.status === 400) {
          throw new Error(errorData.error || "Invalid request. Please check your input.");
        } else {
          throw new Error(errorData.error || `Failed to generate song (Status: ${response.status})`);
        }
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const songData = {
        audio_url: data.audio_url,
        title: title.trim() || data.title || "Untitled Song",
        prompt: prompt,
        stems: data.stems
      };

      setGeneratedSong(songData);

      // Save to AI library
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("ai_generations").insert({
            user_id: user.id,
            tool_type: "song",
            prompt: prompt,
            result_data: songData,
            status: "completed"
          });
        }
      } catch (saveError) {
        console.error("Error saving to library:", saveError);
      }

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
      <CreditsDisplay />
      
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="extractStems"
              checked={extractStems}
              onCheckedChange={(checked) => setExtractStems(checked as boolean)}
              disabled={loading}
            />
            <Label 
              htmlFor="extractStems" 
              className="text-sm font-normal cursor-pointer"
            >
              Extract stems (vocals, drums, bass, etc.) - Coming Soon
            </Label>
          </div>

          <Button 
            onClick={generateSong} 
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Song (1-2 min)...
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

            {generatedSong.stems && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Disc3 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">Available Stems</h4>
                </div>
                {Object.entries(generatedSong.stems).map(([name, url]) => (
                  <div key={name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted">
                    <span className="text-sm capitalize">{name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${generatedSong.title}-${name}.mp3`;
                        a.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
