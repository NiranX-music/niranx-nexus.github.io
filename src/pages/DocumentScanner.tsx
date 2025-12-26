import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AIProviderSelector, useAIProvider, AI_PROVIDERS } from '@/components/ai/AIProviderSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Camera, Upload, FileText, Copy, Download, 
  Loader2, Sparkles, Image, Trash2, Save
} from 'lucide-react';
import { toast } from 'sonner';

interface ScannedDocument {
  id: string;
  title: string;
  image_url: string | null;
  extracted_text: string | null;
  created_at: string;
}

const DocumentScanner = () => {
  const { user } = useAuth();
  const { provider, setProvider, model, setModel } = useAIProvider('document-scanner');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setExtractedText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    
    try {
      const selectedProviderInfo = AI_PROVIDERS.find(p => p.id === provider);
      
      // Use AI vision to extract text
      const prompt = `Extract all text from this image. Return ONLY the extracted text, maintaining the original formatting and structure as much as possible. If there are tables, try to preserve them. If the image contains handwritten text, do your best to transcribe it accurately.`;

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('openrouter-chat', {
        body: {
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: selectedImage } }
            ]
          }],
          provider: provider,
          model: model,
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (response.error) throw new Error(response.error.message);
      
      const content = response.data.choices?.[0]?.message?.content || response.data.content;
      setExtractedText(content);
      toast.success('Text extracted successfully!');
    } catch (error: any) {
      console.error('Error extracting text:', error);
      toast.error(error.message || 'Failed to extract text');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveDocument = async () => {
    if (!user || !extractedText) return;

    try {
      const { data, error } = await supabase
        .from('scanned_documents')
        .insert({
          user_id: user.id,
          title: documentTitle || 'Untitled Scan',
          extracted_text: extractedText,
          ai_provider: `${provider}/${model}`,
          processing_status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;
      
      setDocuments([data, ...documents]);
      toast.success('Document saved!');
      setDocumentTitle('');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success('Text copied to clipboard!');
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle || 'extracted-text'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setExtractedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Document Scanner</h1>
        <p className="text-muted-foreground">Extract text from images using AI-powered OCR</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Upload an image of a document, notes, or any text you want to extract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected document"
                  className="w-full rounded-lg max-h-96 object-contain bg-muted"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            <AIProviderSelector
              selectedProvider={provider}
              selectedModel={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
            />

            <Button
              onClick={extractText}
              disabled={!selectedImage || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract Text
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Extracted Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extracted Text
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted text will appear here..."
              className="min-h-[300px] font-mono text-sm"
            />

            {extractedText && (
              <>
                <div>
                  <Label>Document Title</Label>
                  <Input
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter a title for this document"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={copyText}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={downloadText}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={saveDocument}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {doc.extracted_text?.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <Badge variant="secondary">1</Badge>
              Ensure good lighting when taking photos
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              Keep the document flat and avoid shadows
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary">3</Badge>
              Make sure text is in focus and clearly visible
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="secondary">4</Badge>
              Use vision-capable AI models for best accuracy
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentScanner;
