import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Search, Image, MessageSquare, Send, Loader2, Download, ExternalLink, Star, Sparkles, Zap, Box } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface HFModel {
  id: string;
  modelId?: string;
  pipeline_tag?: string;
  downloads?: number;
  likes?: number;
  tags?: string[];
  lastModified?: string;
}

const CHAT_MODELS = [
  { id: "HuggingFaceH4/zephyr-7b-beta", name: "Zephyr 7B", desc: "Fine-tuned for chat" },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B", desc: "High quality" },
  { id: "microsoft/Phi-3-mini-4k-instruct", name: "Phi-3 Mini", desc: "Compact & fast" },
  { id: "google/gemma-2-2b-it", name: "Gemma 2 2B", desc: "Google Gemma" },
  { id: "meta-llama/Llama-3.2-3B-Instruct", name: "Llama 3.2 3B", desc: "Meta Llama" },
];

const TEXT_GEN_MODELS = [
  { id: "google/flan-t5-base", name: "Flan-T5 Base", desc: "Text-to-text" },
  { id: "google/flan-t5-large", name: "Flan-T5 Large", desc: "Larger T5" },
  { id: "facebook/bart-large-cnn", name: "BART CNN", desc: "Summarization" },
];

const IMAGE_MODELS = [
  { id: "stabilityai/stable-diffusion-xl-base-1.0", name: "SDXL 1.0", desc: "High quality images" },
  { id: "runwayml/stable-diffusion-v1-5", name: "SD 1.5", desc: "Classic stable diffusion" },
  { id: "stabilityai/stable-diffusion-2-1", name: "SD 2.1", desc: "Improved generation" },
];

const MODEL_FILTERS = [
  { value: "", label: "All" },
  { value: "text-generation", label: "Text Generation" },
  { value: "text2text-generation", label: "Text-to-Text" },
  { value: "text-to-image", label: "Text to Image" },
  { value: "image-classification", label: "Image Classification" },
  { value: "summarization", label: "Summarization" },
  { value: "translation", label: "Translation" },
  { value: "question-answering", label: "Question Answering" },
  { value: "fill-mask", label: "Fill Mask" },
];

export default function HuggingFaceHub() {
  const [activeTab, setActiveTab] = useState("chat");
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatModel, setChatModel] = useState(CHAT_MODELS[0].id);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Text gen state
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [textModel, setTextModel] = useState(TEXT_GEN_MODELS[0].id);
  const [textLoading, setTextLoading] = useState(false);
  
  // Image gen state
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageModel, setImageModel] = useState(IMAGE_MODELS[0].id);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Model explorer state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [searchResults, setSearchResults] = useState<HFModel[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const callHF = async (action: string, model: string, inputs: any, parameters?: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please log in to use Hugging Face Hub");
      throw new Error("Not authenticated");
    }

    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/huggingface-api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, model, inputs, parameters }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

    return resp.json();
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await callHF("chat", chatModel, newMessages);
      const content = data.choices?.[0]?.message?.content || data[0]?.generated_text || "No response";
      setChatMessages([...newMessages, { role: "assistant", content }]);
      if (data.fallback) toast.info("Used Gemini fallback (HF model unavailable)");
    } catch (e: any) {
      toast.error(e.message);
      setChatMessages(newMessages.slice(0, -1));
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const generateText = async () => {
    if (!textInput.trim()) return;
    setTextLoading(true);
    try {
      const data = await callHF("inference", textModel, textInput);
      if (Array.isArray(data)) {
        setTextOutput(data[0]?.generated_text || data[0]?.summary_text || JSON.stringify(data));
      } else {
        setTextOutput(JSON.stringify(data, null, 2));
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTextLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setGeneratedImage("");
    try {
      const data = await callHF("inference", imageModel, imagePrompt);
      if (data.image) {
        setGeneratedImage(data.image);
      } else {
        toast.error("No image returned");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImageLoading(false);
    }
  };

  const searchModels = async () => {
    setSearchLoading(true);
    try {
      const data = await callHF("search-models", "", searchQuery, { filter: searchFilter });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
          <span className="text-xl">🤗</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Hugging Face Hub</h1>
          <p className="text-sm text-muted-foreground">Chat, generate text & images, explore 500K+ models</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="chat" className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Chat
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Text
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5" /> Image
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Explore
          </TabsTrigger>
        </TabsList>

        {/* CHAT TAB */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> AI Chat
                </CardTitle>
                <Select value={chatModel} onValueChange={setChatModel}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAT_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">- {m.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] border rounded-lg p-4 mb-4">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <span className="text-4xl mb-2">🤗</span>
                    <p className="text-sm">Start chatting with Hugging Face models</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
                  disabled={chatLoading}
                />
                <Button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} size="icon">
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEXT GENERATION TAB */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Text Generation
                </CardTitle>
                <Select value={textModel} onValueChange={setTextModel}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_GEN_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">- {m.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text prompt (e.g., 'Summarize: ...' or 'Translate to French: ...')"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
              />
              <Button onClick={generateText} disabled={textLoading || !textInput.trim()} className="w-full">
                {textLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><Zap className="h-4 w-4 mr-2" /> Generate</>}
              </Button>
              {textOutput && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Output:</p>
                  <p className="text-sm whitespace-pre-wrap">{textOutput}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMAGE GENERATION TAB */}
        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image className="h-4 w-4" /> Image Generation
                </CardTitle>
                <Select value={imageModel} onValueChange={setImageModel}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">- {m.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Describe the image you want to generate..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateImage()}
              />
              <Button onClick={generateImage} disabled={imageLoading || !imagePrompt.trim()} className="w-full">
                {imageLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><Image className="h-4 w-4 mr-2" /> Generate Image</>}
              </Button>
              {generatedImage && (
                <div className="border rounded-lg p-4 flex flex-col items-center gap-3">
                  <img src={generatedImage} alt="Generated" className="max-w-full rounded-lg shadow-lg" />
                  <a href={generatedImage} download="huggingface-image.png">
                    <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" /> Download</Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MODEL EXPLORER TAB */}
        <TabsContent value="explore" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" /> Explore 500K+ Models
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchModels()}
                />
                <Select value={searchFilter} onValueChange={setSearchFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_FILTERS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={searchModels} disabled={searchLoading}>
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                {searchResults.length === 0 && !searchLoading && (
                  <div className="text-center text-muted-foreground py-10">
                    <Box className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Search for models to get started</p>
                  </div>
                )}
                <div className="space-y-2">
                  {searchResults.map((model) => (
                    <div key={model.id || model.modelId} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{model.id || model.modelId}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {model.pipeline_tag && (
                              <Badge variant="secondary" className="text-[10px]">{model.pipeline_tag}</Badge>
                            )}
                            {model.downloads !== undefined && (
                              <span className="text-xs text-muted-foreground">⬇ {(model.downloads / 1000).toFixed(1)}K</span>
                            )}
                            {model.likes !== undefined && (
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <Star className="h-3 w-3" /> {model.likes}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={`https://huggingface.co/${model.id || model.modelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
