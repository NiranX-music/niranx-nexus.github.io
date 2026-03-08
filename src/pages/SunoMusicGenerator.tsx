import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music, Loader2, Play, Pause, Download, Clock, Sparkles,
  History, Trash2, Share2, Volume2, SkipBack, SkipForward,
  Disc3, Mic2, ListMusic
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedSong {
  id: string;
  title: string;
  prompt: string;
  audio_url: string;
  cover_image_url?: string;
  created_at: string;
  duration?: number;
  status: string;
}

export default function SunoMusicGenerator() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState(120);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GeneratedSong[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadHistory();
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from("ai_generations")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("tool_type", "song")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setHistory(
          data.map((d) => ({
            id: d.id,
            title: (d.result_data as any)?.title || d.prompt || "Untitled",
            prompt: d.prompt || "",
            audio_url: (d.result_data as any)?.audio_url || "",
            cover_image_url: d.cover_image_url,
            created_at: d.created_at || "",
            status: d.status || "completed",
          }))
        );
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateSong = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe the song you want to create");
      return;
    }

    setLoading(true);
    toast.info("Generating your song... This may take 1-2 minutes");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in first");
        return;
      }

      const fullPrompt = genre ? `${genre} style: ${prompt}` : prompt;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-song`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            prompt: fullPrompt,
            title: title || "AI Generated Song",
            duration: Math.max(30, Math.min(300, duration)),
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate song");
      }

      const result = await response.json();

      if (result.audio_url) {
        toast.success("Song generated successfully!");

        // Save to history
        await supabase.from("ai_generations").insert([{
          user_id: session.user.id,
          tool_type: "song",
          prompt: fullPrompt,
          result_data: {
            title: title || "AI Generated Song",
            audio_url: result.audio_url,
            genre,
          } as any,
          status: "completed",
        }]);

        loadHistory();
        setPrompt("");
        setTitle("");
        setGenre("");
      }
    } catch (error: any) {
      console.error("Song generation error:", error);
      toast.error(error.message || "Failed to generate song");
    } finally {
      setLoading(false);
    }
  };

  const playSong = (audioUrl: string, songId: string) => {
    if (currentPlaying === songId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setCurrentPlaying(songId);

    audio.play();
    setIsPlaying(true);

    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    }, 200);

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentPlaying(null);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  };

  const deleteSong = async (id: string) => {
    const { error } = await supabase.from("ai_generations").delete().eq("id", id);
    if (!error) {
      setHistory((prev) => prev.filter((s) => s.id !== id));
      toast.success("Song deleted");
    }
  };

  const genres = [
    "Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic",
    "R&B", "Country", "Lo-fi", "Ambient", "Metal", "Reggae"
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl">
          <Music className="h-6 w-6 text-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Music Studio</h1>
          <p className="text-sm text-muted-foreground">
            Create original music with AI — powered by Sonauto
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
            {history.length > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5">{history.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mic2 className="h-4 w-4 text-pink-500" />
                  Song Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Song Title</label>
                  <Input
                    placeholder="My AI Song"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block">Description / Lyrics</label>
                  <Textarea
                    placeholder="Describe the mood, lyrics, or style...&#10;&#10;Example: An upbeat pop song about summer road trips with catchy chorus and guitar riffs"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block">Genre</label>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenre(genre === g ? "" : g)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          genre === g
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 hover:bg-muted border-border"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium">Duration</span>
                    <span className="text-muted-foreground">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}</span>
                  </div>
                  <Slider
                    value={[duration]}
                    onValueChange={(v) => setDuration(v[0])}
                    min={30}
                    max={300}
                    step={15}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0:30</span>
                    <span>5:00</span>
                  </div>
                </div>

                <Button
                  onClick={generateSong}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Song
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview / Now Playing */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Disc3 className={`h-4 w-4 text-pink-500 ${isPlaying ? "animate-spin" : ""}`} />
                  Now Playing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 && !loading ? (
                  <div className="py-16 text-center">
                    <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No songs yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first AI song using the form
                    </p>
                  </div>
                ) : loading ? (
                  <div className="py-16 text-center space-y-4">
                    <Disc3 className="h-16 w-16 mx-auto text-pink-500 animate-spin" />
                    <p className="font-medium">Creating your song...</p>
                    <p className="text-sm text-muted-foreground">
                      This usually takes 1-2 minutes
                    </p>
                    <div className="w-48 mx-auto bg-muted rounded-full h-1.5">
                      <div className="bg-pink-500 h-1.5 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 5).map((song) => (
                      <div
                        key={song.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          currentPlaying === song.id
                            ? "border-pink-500/30 bg-pink-500/5"
                            : "border-border hover:border-pink-500/20"
                        }`}
                      >
                        <button
                          onClick={() => song.audio_url && playSong(song.audio_url, song.id)}
                          className="shrink-0 w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center hover:bg-pink-500/20 transition-colors"
                          disabled={!song.audio_url}
                        >
                          {currentPlaying === song.id && isPlaying ? (
                            <Pause className="h-4 w-4 text-pink-500" />
                          ) : (
                            <Play className="h-4 w-4 text-pink-500 ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.prompt}</p>
                          {currentPlaying === song.id && (
                            <div className="w-full bg-muted rounded-full h-1 mt-1.5">
                              <div
                                className="bg-pink-500 h-1 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 shrink-0">
                          {song.audio_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(song.audio_url, "_blank")}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteSong(song.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-pink-500" />
                Generation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center">
                  <Music className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No songs generated yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-pink-500/20 transition-colors"
                    >
                      <button
                        onClick={() => song.audio_url && playSong(song.audio_url, song.id)}
                        className="shrink-0 w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center"
                        disabled={!song.audio_url}
                      >
                        {currentPlaying === song.id && isPlaying ? (
                          <Pause className="h-3.5 w-3.5 text-pink-500" />
                        ) : (
                          <Play className="h-3.5 w-3.5 text-pink-500 ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.prompt}</p>
                      </div>

                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(song.created_at).toLocaleDateString()}
                      </span>

                      <div className="flex gap-1 shrink-0">
                        {song.audio_url && (
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => window.open(song.audio_url, "_blank")}>
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => deleteSong(song.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
