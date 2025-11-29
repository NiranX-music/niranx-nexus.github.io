import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

const MODELS = [
  { id: "flux-dev", name: "FLUX Dev", description: "High quality, slower" },
  { id: "flux-schnell", name: "FLUX Schnell", description: "Fast generation" },
  { id: "flux-pro", name: "FLUX Pro", description: "Premium quality" },
];

const SIZES = [
  { width: 1024, height: 1024, label: "Square (1024x1024)" },
  { width: 1024, height: 768, label: "Landscape (1024x768)" },
  { width: 768, height: 1024, label: "Portrait (768x1024)" },
  { width: 1280, height: 720, label: "Wide (1280x720)" },
];

export default function FluxAPIImageGen() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("flux-dev");
  const [selectedSize, setSelectedSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate images");
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('fluxapi-image', {
        body: {
          prompt: prompt.trim(),
          model: selectedModel,
          width: SIZES[selectedSize].width,
          height: SIZES[selectedSize].height,
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // FluxAPI returns the image URL in the response
      const imageUrl = data.url || data.image_url || data.data?.url;
      
      if (!imageUrl) {
        throw new Error("No image URL in response");
      }

      setGeneratedImage(imageUrl);

      // Save to database
      await supabase.from('ai_generations').insert({
        user_id: user.id,
        tool_type: 'fluxapi-image',
        prompt: prompt.trim(),
        result_data: {
          image_url: imageUrl,
          model: selectedModel,
          width: SIZES[selectedSize].width,
          height: SIZES[selectedSize].height,
        },
        status: 'completed',
      });

      toast.success("Image generated successfully!");
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluxapi-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Multi-Model Image Generator</h1>
          <p className="text-muted-foreground">Powered by FluxAPI.ai</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Image</CardTitle>
            <CardDescription>
              Create stunning images using state-of-the-art AI models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Image Size</Label>
              <Select value={selectedSize.toString()} onValueChange={(v) => setSelectedSize(parseInt(v))}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((size, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
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

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated masterpiece will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-auto"
                  />
                </div>
                <Button onClick={downloadImage} className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated image will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About FluxAPI Models</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODELS.map((model) => (
            <div key={model.id} className="space-y-1">
              <h3 className="font-semibold">{model.name}</h3>
              <p className="text-sm text-muted-foreground">{model.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
