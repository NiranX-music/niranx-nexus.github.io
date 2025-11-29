import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Wand2, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function LovableImageGen() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editImage, setEditImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string);
        toast.success("Image loaded for editing");
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('lovable-image-gen', {
        body: { 
          prompt: prompt.trim(),
          editImage: editImage 
        }
      });

      if (error) throw error;

      if (data.url) {
        setGeneratedImage(data.url);
        toast.success(editImage ? "Image edited successfully!" : "Image generated successfully!");
        
        // Save to history
        await supabase.from('ai_generations').insert({
          user_id: user?.id,
          tool_type: editImage ? 'image-edit' : 'image-generation',
          prompt: prompt.trim(),
          result_data: { image_url: data.url }
        });
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `lovable-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-muted-foreground">Please log in to generate images.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-primary" />
          AI Image Generator
        </h1>
        <p className="text-muted-foreground">
          Powered by Lovable AI (Nano Banana) - Generate or edit images with AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate or how you want to edit it..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="image-upload">Upload Image to Edit (Optional)</Label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {editImage ? "Change Image" : "Upload Image"}
                </Button>
                {editImage && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditImage(null);
                      toast.info("Image removed");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {editImage && (
                <div className="mt-2">
                  <img
                    src={editImage}
                    alt="To edit"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {editImage ? "Editing Image..." : "Generating Image..."}
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  {editImage ? "Edit Image" : "Generate Image"}
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Generate: Describe what you want to see</p>
              <p>• Edit: Upload an image and describe your changes</p>
              <p>• Powered by Google's Nano Banana (Gemini 2.5 Flash)</p>
            </div>
          </div>
        </Card>

        {/* Output Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Generated Image</Label>
            {generatedImage ? (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full rounded-lg border"
                />
                <Button onClick={downloadImage} className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated image will appear here</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
