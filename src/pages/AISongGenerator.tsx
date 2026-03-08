import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Loader2, Download, Play, Pause, Disc3, Clock, Upload, Wand2, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AISongGenerator() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(180);
  const [loading, setLoading] = useState(false);
  const [extractStems, setExtractStems] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<{
    audio_url: string;
    title: string;
    prompt: string;
    stems?: Record<string, string>;
    id?: string;
    cover_image_url?: string;
    is_published?: boolean;
    slug?: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [publishing, setPublishing] = useState(false);

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
            title: title.trim() || "Untitled Song",
            duration: duration
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
        stems: data.stems,
        cover_image_url: coverImage
      };

      // Save to AI library
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: savedGeneration, error: saveError } = await supabase
            .from("ai_generations")
            .insert({
              user_id: user.id,
              tool_type: "song",
              prompt: prompt,
              result_data: songData,
              status: "completed",
              cover_image_url: coverImage
            })
            .select()
            .single();

          if (!saveError && savedGeneration) {
            setGeneratedSong({
              ...songData,
              id: savedGeneration.id,
              is_published: savedGeneration.is_published,
              slug: savedGeneration.slug
            });
          } else {
            setGeneratedSong(songData);
          }
        } else {
          setGeneratedSong(songData);
        }
      } catch (saveError) {
        console.error("Error saving to library:", saveError);
        setGeneratedSong(songData);
      }

      toast.success("Song generated successfully!");
    } catch (error: any) {
      console.error('Error generating song:', error);
      toast.error(error.message || "Failed to generate song");
    } finally {
      setLoading(false);
    }
  };

  const generateCoverImage = async () => {
    if (!title && !prompt) {
      toast.error("Please provide a song title or description");
      return;
    }

    setGeneratingCover(true);
    try {
      const coverPrompt = `Create an album cover art for a song titled "${title || 'Untitled'}" with this description: ${prompt}. Make it visually striking and professional.`;
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: coverPrompt }],
          modalities: ["image", "text"]
        })
      });

      if (!response.ok) throw new Error("Failed to generate cover image");

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        setCoverImage(imageUrl);
        toast.success("Cover image generated!");
      }
    } catch (error) {
      console.error("Error generating cover:", error);
      toast.error("Failed to generate cover image");
    } finally {
      setGeneratingCover(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
      toast.success("Cover image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const publishSong = async () => {
    if (!generatedSong?.id) {
      toast.error("Please save the song first");
      return;
    }

    setPublishing(true);
    try {
      const { data, error } = await supabase
        .from("ai_generations")
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          cover_image_url: coverImage
        })
        .eq('id', generatedSong.id)
        .select()
        .single();

      if (error) throw error;

      setGeneratedSong({
        ...generatedSong,
        is_published: true,
        slug: data.id,
        cover_image_url: coverImage
      });

      const publicUrl = `${window.location.origin}/published/songs/ai/${data.id}`;
      navigator.clipboard.writeText(publicUrl);
      toast.success("Published! Link copied to clipboard");
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish song");
    } finally {
      setPublishing(false);
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Song Duration
              </Label>
              <span className="text-sm text-muted-foreground">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <Slider
              id="duration"
              min={30}
              max={300}
              step={10}
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: 30 seconds • Maximum: 5 minutes
            </p>
          </div>

          <div className="space-y-3">
            <Label>Cover Image (Optional)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover-upload')?.click()}
                disabled={loading}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Cover
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={generateCoverImage}
                disabled={loading || generatingCover}
                className="flex-1"
              >
                {generatingCover ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate with AI
              </Button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
            {coverImage && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
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
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {generatedSong.cover_image_url && (
                  <img 
                    src={generatedSong.cover_image_url} 
                    alt="Cover" 
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    {generatedSong.title}
                  </CardTitle>
                  <CardDescription>{generatedSong.prompt}</CardDescription>
                </div>
              </div>
              {generatedSong.is_published && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/published/songs/ai/${generatedSong.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public
                </Button>
              )}
            </div>
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
              {generatedSong.id && (
                <Button
                  onClick={publishSong}
                  disabled={publishing || generatedSong.is_published}
                  variant={generatedSong.is_published ? "secondary" : "default"}
                >
                  {publishing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  {generatedSong.is_published ? "Published" : "Publish"}
                </Button>
              )}
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
          <p>• <strong>Add a cover:</strong> Upload your own or generate one with AI for a complete package</p>
        </CardContent>
      </Card>
    </div>
  );
}
