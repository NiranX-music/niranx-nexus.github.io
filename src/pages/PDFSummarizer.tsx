import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Upload, Loader2, Download } from "lucide-react";
import { useXPReward } from "@/hooks/useXPReward";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PDFSummarizer() {
  const { user } = useAuth();
  const { awardXP } = useXPReward();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryType, setSummaryType] = useState<string>("brief");
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be less than 20MB");
        return;
      }
      setSelectedFile(file);
      setSummary("");
      toast.success("PDF file selected");
    }
  };

  const handleSummarize = async () => {
    if (!selectedFile || !user) return;

    setIsLoading(true);
    try {
      // Extract text from PDF using pdfjs
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let pdfText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        pdfText += pageText + "\n";
      }

      if (!pdfText.trim()) {
        throw new Error("Could not extract text from PDF. The PDF might be image-based.");
      }

      // Limit text to prevent token overflow (approximately 100,000 characters)
      const truncatedText = pdfText.slice(0, 100000);
      if (pdfText.length > 100000) {
        toast.info("PDF is very large. Summarizing first portion only.");
      }

      // Call edge function to summarize
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            pdfContent: truncatedText,
            summaryType 
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to summarize PDF");
      }

      const result = await response.json();
      setSummary(result.summary);
      await awardXP("USE_AI_CHAT");
      toast.success("PDF summarized successfully!");
    } catch (error) {
      console.error("Error summarizing PDF:", error);
      toast.error(error instanceof Error ? error.message : "Failed to summarize PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!summary) return;
    
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${selectedFile?.name.replace('.pdf', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded");
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to use the PDF Summarizer</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI PDF Summarizer</h1>
          <p className="text-muted-foreground">Upload a PDF and get an AI-generated summary</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>Select a PDF file to summarize (max 20MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload PDF
                </p>
                {selectedFile && (
                  <p className="text-sm font-medium text-primary">
                    {selectedFile.name}
                  </p>
                )}
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Summary Type</label>
              <Select value={summaryType} onValueChange={setSummaryType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief (3-5 sentences)</SelectItem>
                  <SelectItem value="detailed">Detailed (comprehensive)</SelectItem>
                  <SelectItem value="key-points">Key Points (bullet list)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSummarize}
              disabled={!selectedFile || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Summary</CardTitle>
                <CardDescription>AI-generated summary of your PDF</CardDescription>
              </div>
              {summary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSummary}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!summary && !isLoading && (
              <div className="text-center text-muted-foreground py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload a PDF and click Generate Summary</p>
              </div>
            )}
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing PDF and generating summary...</p>
              </div>
            )}
            {summary && (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                  {summary}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
