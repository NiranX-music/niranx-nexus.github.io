import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Download, Play, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CoquiTTS() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [speaker, setSpeaker] = useState("default");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [clonedVoiceName, setClonedVoiceName] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
    { value: "pl", label: "Polish" },
    { value: "tr", label: "Turkish" },
    { value: "ru", label: "Russian" },
    { value: "nl", label: "Dutch" },
    { value: "cs", label: "Czech" },
    { value: "ar", label: "Arabic" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
  ];

  const handleTextToSpeech = async () => {
    if (!text.trim()) {
      toast.error("Please enter text to synthesize");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coqui-tts', {
        body: {
          action: 'text-to-speech',
          text,
          language,
          speaker,
        },
      });

      if (error) throw error;

      if (data.audio_url) {
        setAudioUrl(data.audio_url);
        toast.success("Audio generated successfully!");
      }
    } catch (error: any) {
      console.error('TTS error:', error);
      toast.error(error.message || "Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceClone = async () => {
    if (!voiceFile) {
      toast.error("Please upload an audio file");
      return;
    }

    if (!clonedVoiceName.trim()) {
      toast.error("Please enter a name for the cloned voice");
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Audio = e.target?.result;

        const { data, error } = await supabase.functions.invoke('coqui-tts', {
          body: {
            action: 'voice-clone',
            audioFile: base64Audio,
            speaker: clonedVoiceName,
          },
        });

        if (error) throw error;

        toast.success("Voice cloned successfully!");
        setSpeaker(clonedVoiceName);
        setVoiceFile(null);
        setClonedVoiceName("");
      };
      reader.readAsDataURL(voiceFile);
    } catch (error: any) {
      console.error('Voice clone error:', error);
      toast.error(error.message || "Failed to clone voice");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `coqui-tts-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audio downloaded!");
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Coqui TTS</h1>
        <p className="text-muted-foreground">
          Free & open-source text-to-speech with voice cloning capabilities
        </p>
      </div>

      <Tabs defaultValue="tts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tts">Text-to-Speech</TabsTrigger>
          <TabsTrigger value="clone">Voice Cloning</TabsTrigger>
        </TabsList>

        <TabsContent value="tts">
          <Card>
            <CardHeader>
              <CardTitle>Generate Speech</CardTitle>
              <CardDescription>
                Convert text to natural-sounding speech in multiple languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Text to Synthesize</Label>
                <Textarea
                  placeholder="Enter text to convert to speech..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Input
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="Speaker name"
                  />
                </div>
              </div>

              <Button
                onClick={handleTextToSpeech}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Generate Speech
                  </>
                )}
              </Button>

              {audioUrl && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <audio ref={audioRef} src={audioUrl} className="w-full mb-4" controls />
                    <div className="flex gap-2">
                      <Button onClick={handlePlay} variant="outline" className="flex-1">
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Button>
                      <Button onClick={handleDownload} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clone">
          <Card>
            <CardHeader>
              <CardTitle>Clone Your Voice</CardTitle>
              <CardDescription>
                Upload audio samples to create a custom voice model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Voice Name</Label>
                <Input
                  value={clonedVoiceName}
                  onChange={(e) => setClonedVoiceName(e.target.value)}
                  placeholder="Enter a name for your cloned voice"
                />
              </div>

              <div className="space-y-2">
                <Label>Audio Sample</Label>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a clear audio sample (at least 10 seconds recommended)
                </p>
              </div>

              <Button
                onClick={handleVoiceClone}
                disabled={loading || !voiceFile || !clonedVoiceName}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cloning Voice...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Clone Voice
                  </>
                )}
              </Button>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tips for best results:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use high-quality audio with minimal background noise</li>
                  <li>• Record at least 10-30 seconds of speech</li>
                  <li>• Speak naturally with varied intonation</li>
                  <li>• Avoid long pauses or interruptions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
