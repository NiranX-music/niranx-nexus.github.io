import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Presentation, Loader2, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AIPresentationGenerator() {
  const [content, setContent] = useState("");
  const [nSlides, setNSlides] = useState("10");
  const [language, setLanguage] = useState("English");
  const [template, setTemplate] = useState("general");
  const [loading, setLoading] = useState(false);
  const [generatedPresentation, setGeneratedPresentation] = useState<{
    presentation_id: string;
    download_url: string;
    edit_url: string;
    credits_consumed: number;
  } | null>(null);

  const generatePresentation = async () => {
    if (!content.trim()) {
      toast.error("Please enter presentation content");
      return;
    }

    setLoading(true);
    toast.info("Generating presentation... This may take 1-2 minutes");
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: { 
          content: content.trim(),
          n_slides: parseInt(nSlides),
          language,
          template,
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedPresentation({
        presentation_id: data.presentation_id,
        download_url: data.download_url,
        edit_url: data.edit_url,
        credits_consumed: data.credits_consumed,
      });

      toast.success("Presentation generated successfully!");
    } catch (error: any) {
      console.error('Error generating presentation:', error);
      if (error.message.includes('429')) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (error.message.includes('402') || error.message.includes('credits')) {
        toast.error("Insufficient credits. Please check your Presenton API credits.");
      } else {
        toast.error(error.message || "Failed to generate presentation");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Presentation className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Presentation Generator</h1>
          <p className="text-muted-foreground">
            Create professional presentations with Presenton AI - just describe your topic
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Your Presentation</CardTitle>
          <CardDescription>
            Describe your presentation topic and let AI create professional slides for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Presentation Topic / Content *</Label>
            <Textarea
              id="content"
              placeholder="Example: Introduction to Machine Learning - covering basics, types of ML, applications, and future trends"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="n_slides">Number of Slides</Label>
              <Input
                id="n_slides"
                type="number"
                min="3"
                max="30"
                value={nSlides}
                onChange={(e) => setNSlides(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={template} onValueChange={setTemplate} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generatePresentation} 
            disabled={loading || !content.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Presentation (1-2 min)...
              </>
            ) : (
              <>
                <Presentation className="mr-2 h-4 w-4" />
                Generate Presentation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPresentation && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-primary" />
              Presentation Ready!
            </CardTitle>
            <CardDescription>
              Credits used: {generatedPresentation.credits_consumed}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => window.open(generatedPresentation.download_url, '_blank')}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PPTX
              </Button>
              <Button 
                onClick={() => window.open(generatedPresentation.edit_url, '_blank')}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Edit in Presenton
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Presentation ID:</strong> {generatedPresentation.presentation_id}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Be specific:</strong> Include key topics, subtopics, and main points you want covered</p>
          <p>• <strong>Structure your input:</strong> Mention sections like introduction, main content, conclusion</p>
          <p>• <strong>Specify details:</strong> Include data points, examples, or case studies if relevant</p>
          <p>• <strong>Choose the right template:</strong> Business for corporate, Academic for education, Creative for design-focused</p>
          <p>• <strong>Edit after generation:</strong> Use the Presenton editor to fine-tune text, images, and layout</p>
        </CardContent>
      </Card>
    </div>
  );
}
