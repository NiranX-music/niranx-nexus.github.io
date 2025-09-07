import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFDocument {
  name: string;
  url: string;
  numPages: number;
  uploadedAt: Date;
}

export default function PDFViewer() {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfHistory, setPdfHistory] = useState<PDFDocument[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load saved PDFs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pdf-history');
    if (saved) {
      try {
        setPdfHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load PDF history:', error);
      }
    }
  }, []);

  // Save PDF history to localStorage
  const savePdfHistory = (history: PDFDocument[]) => {
    try {
      localStorage.setItem('pdf-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save PDF history:', error);
    }
  };

  const loadPDF = async (file: File | string) => {
    setLoading(true);
    try {
      let pdfData;
      let fileName = '';
      
      if (typeof file === 'string') {
        // URL
        pdfData = file;
        fileName = file.split('/').pop() || 'Remote PDF';
      } else {
        // File
        pdfData = await file.arrayBuffer();
        fileName = file.name;
      }

      const pdf = await pdfjsLib.getDocument(pdfData).promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      
      // Add to history if it's a new file
      if (typeof file !== 'string') {
        const url = URL.createObjectURL(file);
        const newDoc: PDFDocument = {
          name: fileName,
          url,
          numPages: pdf.numPages,
          uploadedAt: new Date()
        };
        const updatedHistory = [newDoc, ...pdfHistory.filter(doc => doc.name !== fileName)].slice(0, 10);
        setPdfHistory(updatedHistory);
        savePdfHistory(updatedHistory);
      }

      toast({
        title: "PDF Loaded Successfully",
        description: `${fileName} (${pdf.numPages} pages)`,
      });
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error Loading PDF",
        description: "Please check if the file is a valid PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale, rotation });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
      toast({
        title: "Error Rendering Page",
        description: "Failed to render the current page",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, rotation]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      loadPDF(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleUrlLoad = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = formData.get('pdfUrl') as string;
    
    if (url.trim()) {
      loadPDF(url.trim());
      (event.target as HTMLFormElement).reset();
    }
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => setScale(Math.min(scale + 0.25, 3));
  const zoomOut = () => setScale(Math.max(scale - 0.25, 0.5));
  const rotate = () => setRotation((rotation + 90) % 360);

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadPDF = () => {
    const currentDoc = pdfHistory[0];
    if (currentDoc) {
      const link = document.createElement('a');
      link.href = currentDoc.url;
      link.download = currentDoc.name;
      link.click();
    }
  };

  return (
    <div className="container mx-auto p-6" ref={containerRef}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">PDF Viewer</h1>
        <p className="text-muted-foreground">
          Upload PDF files or load from URL to view and navigate through documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PDF Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Upload PDF</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>

              {/* URL Input */}
              <form onSubmit={handleUrlLoad}>
                <label className="text-sm font-medium mb-2 block">Load from URL</label>
                <div className="flex gap-2">
                  <Input
                    name="pdfUrl"
                    placeholder="https://example.com/file.pdf"
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">Load</Button>
                </div>
              </form>

              {/* Navigation */}
              {pdfDoc && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Page Navigation</span>
                    <Badge variant="secondary">
                      {currentPage} / {numPages}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={prevPage} 
                      disabled={currentPage <= 1}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={nextPage} 
                      disabled={currentPage >= numPages}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={numPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= numPages) {
                        setCurrentPage(page);
                      }
                    }}
                    placeholder="Go to page..."
                  />
                </div>
              )}

              {/* Zoom Controls */}
              {pdfDoc && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Zoom & Rotate</span>
                  <div className="flex gap-2">
                    <Button onClick={zoomOut} size="sm" variant="outline">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button onClick={zoomIn} size="sm" variant="outline">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button onClick={rotate} size="sm" variant="outline">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Zoom: {Math.round(scale * 100)}%
                  </div>
                </div>
              )}

              {/* Actions */}
              {pdfDoc && (
                <div className="space-y-2">
                  <Button onClick={toggleFullscreen} className="w-full" variant="outline">
                    {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </Button>
                  <Button onClick={downloadPDF} className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent PDFs */}
          {pdfHistory.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Recent PDFs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pdfHistory.slice(0, 5).map((doc, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => loadPDF(doc.url)}
                    >
                      <div className="text-sm font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.numPages} pages • {doc.uploadedAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* PDF Viewer */}
        <div className="lg:col-span-3">
          <Card className="h-[80vh]">
            <CardContent className="p-0 h-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading PDF...</p>
                  </div>
                </div>
              ) : pdfDoc ? (
                <div className="h-full overflow-auto bg-gray-100 p-4">
                  <div className="flex justify-center">
                    <canvas 
                      ref={canvasRef}
                      className="shadow-lg border border-gray-300 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No PDF Loaded</h3>
                    <p className="text-muted-foreground mb-4">Upload a PDF file or load from URL to get started</p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}