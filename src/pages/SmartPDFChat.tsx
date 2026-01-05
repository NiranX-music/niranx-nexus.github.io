import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X, 
  Sparkles,
  FileSearch,
  MessageSquare,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIProviderSelector, useAIProvider } from "@/components/ai/AIProviderSelector";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PDFDocument {
  name: string;
  content: string;
  pages: number;
}

export default function SmartPDFChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('smart-pdf-chat');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const extractTextFromPDF = async (file: File): Promise<{ text: string; pages: number }> => {
    // Using pdf.js for text extraction
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += `\n--- Page ${i} ---\n${pageText}`;
    }
    
    return { text: fullText, pages: pdf.numPages };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsExtracting(true);
    
    try {
      const newDocs: PDFDocument[] = [];
      
      for (const file of Array.from(files)) {
        if (file.type !== "application/pdf") {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a PDF file`,
            variant: "destructive",
          });
          continue;
        }

        const { text, pages } = await extractTextFromPDF(file);
        newDocs.push({
          name: file.name,
          content: text,
          pages,
        });
      }

      setDocuments(prev => [...prev, ...newDocs]);
      
      toast({
        title: "PDFs uploaded",
        description: `Successfully processed ${newDocs.length} document(s)`,
      });

      // Add welcome message
      if (newDocs.length > 0 && messages.length === 0) {
        setMessages([{
          id: Date.now().toString(),
          role: "assistant",
          content: `I've loaded ${newDocs.length} PDF document(s) with a total of ${newDocs.reduce((acc, doc) => acc + doc.pages, 0)} pages. You can now ask me questions about the content!`,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error("Error processing PDFs:", error);
      toast({
        title: "Error processing PDF",
        description: "Failed to extract text from the PDF",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeDocument = (name: string) => {
    setDocuments(prev => prev.filter(doc => doc.name !== name));
    toast({
      title: "Document removed",
      description: `${name} has been removed`,
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (documents.length === 0) {
      toast({
        title: "No documents",
        description: "Please upload at least one PDF document first",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const documentContext = documents
        .map(doc => `Document: ${doc.name}\n${doc.content}`)
        .join("\n\n---\n\n");

      const systemPrompt = `You are a helpful AI assistant specialized in analyzing PDF documents. You have been given the following document content to analyze:

${documentContext}

Answer questions based on the document content. If the answer cannot be found in the documents, say so clearly. Provide specific references to page numbers when relevant.`;

      const response = await supabase.functions.invoke("smart-pdf-chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: input },
          ],
          provider,
          model,
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.content || "I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      let errorMessage = "Failed to get a response. Please try again.";
      if (error.message?.includes("429") || error.message?.includes("rate limit")) {
        errorMessage = "Rate limit reached. Please wait a moment and try again.";
      } else if (error.message?.includes("402")) {
        errorMessage = "API quota exceeded. Try switching to a different AI provider.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setDocuments([]);
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
            <FileSearch className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Smart PDF Chat
            </h1>
            <p className="text-muted-foreground">
              Upload PDFs and chat with your documents using AI
            </p>
          </div>
        </div>
        <AIProviderSelector selectedProvider={provider} selectedModel={model} onProviderChange={setProvider} onModelChange={setModel} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documents
              </CardTitle>
              <CardDescription>
                Upload PDF files to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                multiple
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="w-full"
                variant="outline"
              >
                {isExtracting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isExtracting ? "Processing..." : "Upload PDFs"}
              </Button>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  <AnimatePresence>
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {doc.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {doc.pages} pages
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeDocument(doc.name)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {documents.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-center p-6">
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No documents uploaded yet
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Upload PDFs to start chatting
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Chat
                </CardTitle>
                <CardDescription>
                  Ask questions about your documents
                </CardDescription>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-[10px] mt-1 opacity-60">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Analyzing documents...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {messages.length === 0 && documents.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground font-medium">
                        Upload a PDF to get started
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        I can help you understand and analyze your documents
                      </p>
                    </div>
                  )}

                  {messages.length === 0 && documents.length > 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <MessageSquare className="h-12 w-12 text-primary/50 mb-4" />
                      <p className="text-muted-foreground font-medium">
                        Documents ready!
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Ask me anything about your uploaded PDFs
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2 pt-4 border-t mt-auto">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder={documents.length > 0 ? "Ask about your documents..." : "Upload a PDF first..."}
                  disabled={isLoading || documents.length === 0}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim() || documents.length === 0}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
