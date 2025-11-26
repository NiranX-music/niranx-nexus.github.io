import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreditsDisplay } from "@/components/ui/CreditsDisplay";

interface Model {
  model: string;
  provider: string;
}

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("turbo");
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch("https://subnp.com/api/free/models");
      const data = await response.json();
      if (data.success && data.models) {
        setModels(data.models);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setProgress("Starting generation...");
    setImageUrl(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('AIImageGenerator session', session, sessionError);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subnp-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, model }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 402) {
          throw new Error("Payment required. Please check your SubNP credits.");
        } else if (response.status === 400) {
          throw new Error(errorData.error || errorData.message || "Invalid request. Please check your input.");
        } else {
          throw new Error(errorData.error || errorData.message || `Failed to generate image (Status: ${response.status})`);
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.status === "processing") {
                setProgress(data.message || "Processing...");
              } else if (data.status === "complete") {
                setImageUrl(data.imageUrl);
                setProgress("Generation complete!");
                toast.success("Image generated successfully!");
                setLoading(false);

                // Save to AI library
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from("ai_generations").insert({
                      user_id: user.id,
                      tool_type: "image",
                      prompt: prompt,
                      result_data: {
                        image_url: data.imageUrl,
                        title: prompt.slice(0, 50),
                        model: model
                      },
                      status: "completed"
                    });
                  }
                } catch (saveError) {
                  console.error("Error saving to library:", saveError);
                }
              } else if (data.status === "error") {
                throw new Error(data.message || "Generation failed");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CreditsDisplay />
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <ImageIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Image Generator</h1>
          <p className="text-muted-foreground">
            Create stunning images with AI powered by SubNP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Image
            </CardTitle>
            <CardDescription>
              Describe what you want to see and our AI will create it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <Textarea
                placeholder="A serene Japanese garden with a red bridge over a koi pond, cherry blossoms in full bloom, early morning mist..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.model} value={m.model}>
                      {m.model} - {m.provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated image will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            ) : (
              <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No image generated yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Be specific with details: style, mood, lighting, and composition</p>
          <p>• Include artistic references: "in the style of Van Gogh" or "photorealistic"</p>
          <p>• Describe the scene thoroughly: foreground, middle ground, background</p>
          <p>• Use descriptive adjectives: vibrant, serene, dramatic, ethereal</p>
        </CardContent>
      </Card>
    </div>
  );
}
