import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Image as ImageIcon, MessageCircle, Sparkles, Upload, X, Eye, Download, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";


const TEXT_MODELS_COMMUNITY = [
  { id: "deepseek-v3.2", name: "DeepSeek V3.2", ctx: "128K", desc: "Latest with enhanced reasoning" },
  { id: "deepseek-r1", name: "DeepSeek R1", ctx: "128K", desc: "Advanced reasoning" },
  { id: "deepseek-v3", name: "DeepSeek V3", ctx: "128K", desc: "General-purpose" },
  { id: "qwen3-coder-plus", name: "Qwen3 Coder Plus", ctx: "128K", desc: "Code generation" },
  { id: "qwen3-max", name: "Qwen3 Max", ctx: "128K", desc: "Maximum capability" },
  { id: "qwen3-max-preview", name: "Qwen3 Max Preview", ctx: "128K", desc: "Preview next Max" },
  { id: "qwen3-vl-plus", name: "Qwen3 VL Plus", ctx: "128K", desc: "Vision-language" },
  { id: "qwen3-235b-a22b-thinking-2507", name: "Qwen3 235B Thinking", ctx: "128K", desc: "235B w/ thinking" },
  { id: "qwen3-235b-a22b-instruct", name: "Qwen3 235B Instruct", ctx: "128K", desc: "235B instruction-tuned" },
  { id: "qwen3-235b", name: "Qwen3 235B", ctx: "128K", desc: "235B parameter" },
  { id: "qwen3-32b", name: "Qwen3 32B", ctx: "128K", desc: "Efficient 32B" },
  { id: "kimi-k2-0905", name: "Kimi K2 Instruct", ctx: "128K", desc: "Moonshot instruction" },
  { id: "kimi-k2", name: "Kimi K2", ctx: "128K", desc: "Moonshot flagship" },
  { id: "tstars2.0", name: "TStars 2.0", ctx: "32K", desc: "Efficient multi-purpose" },
];

const TEXT_MODELS_PARTNER = [
  { id: "gpt-5-nano", name: "GPT-5 Nano", ctx: "128K", desc: "Partner tier" },
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", ctx: "128K", desc: "Partner tier" },
  { id: "chickytutor-ai", name: "ChickyTutor AI", ctx: "32K", desc: "Partner tier" },
];

const IMAGE_MODELS = [
  { id: "flux", name: "Flux", desc: "High-quality generation" },
  { id: "turbo", name: "Turbo", desc: "Fast generation" },
  { id: "sdxl-turbo", name: "SDXL Turbo", desc: "Fast Stable Diffusion XL" },
  { id: "gpt-image-1", name: "GPT Image", desc: "DALL-E powered" },
  { id: "gpt-image-1-hd", name: "GPT Image HD", desc: "High-definition DALL-E" },
  { id: "kontext", name: "Kontext", desc: "Context-aware" },
  { id: "seedream-4.0", name: "Seedream 4.0", desc: "ByteDance model" },
  { id: "seedream-4.5", name: "Seedream 4.5", desc: "Latest Seedream" },
  { id: "gemini-2.0-flash-preview-image-generation", name: "Gemini Flash Image", desc: "Google Gemini" },
  { id: "gemini-2.0-pro-exp-image-generation", name: "Gemini Pro Image", desc: "Gemini Pro" },
];

const VIDEO_MODELS = [
  { id: "seedance-1-pro-fast", name: "Seedance Pro-Fast", desc: "Fast video by ByteDance" },
  { id: "seedance-1-lite", name: "Seedance Lite", desc: "Lightweight video" },
  { id: "veo-3.1", name: "Veo 3.1", desc: "Google DeepMind video" },
];

const AUDIO_MODELS = [
  { id: "midijourney", name: "MIDIjourney", desc: "AI music generation" },
];

type Msg = { role: "user" | "assistant"; content: string };

const IMAGE_SIZES = ["256x256", "512x512", "1024x1024", "1024x1792", "1792x1024"];

export default function ScitelyAI() {
  const [activeTab, setActiveTab] = useState("chat");
  
  // Chat state
  const [chatModel, setChatModel] = useState("deepseek-v3.2");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [imgModel, setImgModel] = useState("flux");
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgSize, setImgSize] = useState("1024x1024");
  const [imgLoading, setImgLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendChat = useCallback(async () => {
    if (!input.trim() && !uploadedImage) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in first");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scitely-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            type: "chat",
            messages: [...messages, userMsg],
            model: chatModel,
            stream: true,
            imageUrl: uploadedImage || undefined,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      setUploadedImage(null);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, chatModel, uploadedImage]);

  const generateImage = useCallback(async () => {
    if (!imgPrompt.trim()) return;
    setImgLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in first");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scitely-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            type: "image",
            model: imgModel,
            prompt: imgPrompt,
            size: imgSize,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Image generation failed");
      }

      const data = await res.json();
      const urls = data.data?.map((d: any) => d.url || d.b64_json) || [];
      setGeneratedImages(prev => [...urls, ...prev]);
      toast({ title: "Image generated!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setImgLoading(false);
    }
  }, [imgPrompt, imgModel, imgSize]);

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Scitely AI</h1>
            <p className="text-xs text-muted-foreground">50+ Free AI Models — Unlimited Access</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat"><MessageCircle className="h-4 w-4 mr-1" />Chat</TabsTrigger>
            <TabsTrigger value="image"><ImageIcon className="h-4 w-4 mr-1" />Image</TabsTrigger>
            <TabsTrigger value="models"><Eye className="h-4 w-4 mr-1" />Models</TabsTrigger>
          </TabsList>

          {/* CHAT TAB */}
          <TabsContent value="chat" className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={chatModel} onValueChange={setChatModel}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Community (Free)</div>
                  {TEXT_MODELS_COMMUNITY.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">{m.name} <span className="text-xs text-muted-foreground">{m.ctx}</span></span>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-1">Partner</div>
                  {TEXT_MODELS_PARTNER.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">{m.name} <Badge variant="secondary" className="text-[10px] px-1">Partner</Badge></span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => { setMessages([]); setUploadedImage(null); }}>Clear</Button>
            </div>

            <Card className="min-h-[400px] max-h-[500px] overflow-y-auto">
              <CardContent className="p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">Start chatting with {TEXT_MODELS_COMMUNITY.find(m => m.id === chatModel)?.name || chatModel}</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => copyText(msg.content, i)}
                          className="mt-1 text-xs opacity-50 hover:opacity-100 flex items-center gap-1"
                        >
                          {copied === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied === i ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </CardContent>
            </Card>

            {/* Upload preview */}
            {uploadedImage && (
              <div className="relative inline-block">
                <img src={uploadedImage} alt="Upload" className="h-16 rounded-lg border" />
                <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Upload image for vision models">
                <Upload className="h-4 w-4" />
              </Button>
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-[120px] resize-none"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              />
              <Button onClick={sendChat} disabled={loading || (!input.trim() && !uploadedImage)} size="icon">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>

          {/* IMAGE TAB */}
          <TabsContent value="image" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Select value={imgModel} onValueChange={setImgModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {IMAGE_MODELS.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name} — {m.desc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <Select value={imgSize} onValueChange={setImgSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {IMAGE_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              value={imgPrompt}
              onChange={e => setImgPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="min-h-[80px]"
            />
            <Button onClick={generateImage} disabled={imgLoading || !imgPrompt.trim()} className="w-full">
              {imgLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
              Generate Image
            </Button>

            {generatedImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedImages.map((url, i) => (
                  <Card key={i} className="overflow-hidden">
                    <img src={url.startsWith("data:") ? url : url} alt={`Generated ${i + 1}`} className="w-full aspect-square object-cover" />
                    <CardContent className="p-2 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer"><Download className="h-3 w-3 mr-1" />Download</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MODELS TAB */}
          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Text Models — Community (Free)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TEXT_MODELS_COMMUNITY.map(m => (
                    <div key={m.id} className="flex items-center justify-between border rounded-lg p-2.5">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{m.ctx}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Text Models — Partner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TEXT_MODELS_PARTNER.map(m => (
                    <div key={m.id} className="flex items-center justify-between border rounded-lg p-2.5">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      <Badge className="text-[10px]">Partner</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image Models (Partner)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {IMAGE_MODELS.map(m => (
                    <div key={m.id} className="flex items-center justify-between border rounded-lg p-2.5">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      <Badge className="text-[10px]">Partner</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">🎬 Video Models (Partner)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {VIDEO_MODELS.map(m => (
                    <div key={m.id} className="flex items-center justify-between border rounded-lg p-2.5">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">🎵 Audio Models (Partner)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {AUDIO_MODELS.map(m => (
                    <div key={m.id} className="flex items-center justify-between border rounded-lg p-2.5">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
