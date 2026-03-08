import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Image as ImageIcon, Sparkles, History, Trash2, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SubnpModel {
  model: string;
  provider: string;
}

interface HistoryItem {
  id: string;
  prompt: string;
  result_data: any;
  created_at: string;
  tool_type: string;
  status: string;
  is_published: boolean;
}

const PROVIDERS = [
  {
    id: "lovable",
    name: "Lovable AI (Gemini)",
    description: "Google Gemini image generation — no API key needed",
    models: [
      { value: "google/gemini-2.5-flash-image", label: "Nano Banana (Fast)" },
      { value: "google/gemini-3-pro-image-preview", label: "Nano Banana Pro (HQ)" },
    ],
  },
  {
    id: "subnp",
    name: "SubNP (Free)",
    description: "Free image generation with multiple models",
    models: [], // loaded dynamically
  },
  {
    id: "pollinations",
    name: "Pollinations AI (Free)",
    description: "Open-source, free, no API key required",
    models: [
      { value: "flux", label: "Flux" },
      { value: "flux-realism", label: "Flux Realism" },
      { value: "flux-anime", label: "Flux Anime" },
      { value: "flux-3d", label: "Flux 3D" },
      { value: "turbo", label: "Turbo (Fast)" },
    ],
  },
];

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState("lovable");
  const [model, setModel] = useState("google/gemini-2.5-flash-image");
  const [subnpModels, setSubnpModels] = useState<SubnpModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    fetchSubnpModels();
    loadHistory();
  }, []);

  useEffect(() => {
    const p = PROVIDERS.find((p) => p.id === provider);
    if (p && p.models.length > 0) {
      setModel(p.models[0].value);
    } else if (provider === "subnp" && subnpModels.length > 0) {
      setModel(subnpModels[0].model);
    }
  }, [provider, subnpModels]);

  const fetchSubnpModels = async () => {
    try {
      const response = await fetch("https://subnp.com/api/free/models");
      const data = await response.json();
      if (data.success && data.models) {
        setSubnpModels(data.models);
      }
    } catch (error) {
      console.error("Error fetching SubNP models:", error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHistoryLoading(false); return; }

      const { data, error } = await supabase
        .from("ai_generations")
        .select("*")
        .eq("user_id", user.id)
        .eq("tool_type", "image")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) setHistory(data as HistoryItem[]);
    } catch (e) {
      console.error("Error loading history:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveToHistory = useCallback(async (imgUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("ai_generations").insert({
        user_id: user.id,
        tool_type: "image",
        prompt,
        result_data: { image_url: imgUrl, title: prompt.slice(0, 50), model, provider },
        status: "completed",
      });
      loadHistory();
    } catch (e) {
      console.error("Error saving:", e);
    }
  }, [prompt, model, provider]);

  const generateWithLovable = async () => {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lovable-image-gen`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed (${response.status})`);
    }
    const data = await response.json();
    return data.url || data.imageUrl || data.image_url;
  };

  const generateWithSubnp = async () => {
    const { data: session } = await supabase.auth.getSession();
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subnp-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt, model }),
      }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();
    let buffer = "";
    let resultUrl: string | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const d = JSON.parse(line.slice(6));
            if (d.status === "processing") setProgress(d.message || "Processing...");
            else if (d.status === "complete") resultUrl = d.imageUrl;
            else if (d.status === "error") throw new Error(d.message);
          } catch {}
        }
      }
    }
    if (!resultUrl) throw new Error("No image URL returned");
    return resultUrl;
  };

  const generateWithPollinations = async () => {
    const encoded = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${encoded}?model=${model}&width=1024&height=1024&seed=${seed}&nologo=true`;
    
    // Pre-fetch to ensure it's generated
    setProgress("Generating with Pollinations...");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Pollinations generation failed");
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  const generateImage = async () => {
    if (!prompt.trim()) { toast.error("Please enter a prompt"); return; }

    setLoading(true);
    setProgress("Starting...");
    setImageUrl(null);

    try {
      let url: string;
      if (provider === "lovable") url = await generateWithLovable();
      else if (provider === "subnp") url = await generateWithSubnp();
      else url = await generateWithPollinations();

      setImageUrl(url);
      setProgress("Complete!");
      toast.success("Image generated!");
      await saveToHistory(url);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url?: string) => {
    const targetUrl = url || imageUrl;
    if (!targetUrl) return;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      toast.success("Downloaded!");
    } catch {
      toast.error("Failed to download");
    }
  };

  const deleteHistoryItem = async (id: string) => {
    const { error } = await supabase.from("ai_generations").delete().eq("id", id);
    if (!error) {
      setHistory((h) => h.filter((item) => item.id !== id));
      toast.success("Deleted");
    }
  };

  const currentModels =
    provider === "subnp"
      ? subnpModels.map((m) => ({ value: m.model, label: `${m.model} — ${m.provider}` }))
      : PROVIDERS.find((p) => p.id === provider)?.models || [];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <ImageIcon className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Image Generator</h1>
          <p className="text-muted-foreground text-sm">
            Create images with multiple free AI providers
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">
            <Sparkles className="h-4 w-4 mr-1.5" /> Generate
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-1.5" /> History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Create Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Provider */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Provider</label>
                  <Select value={provider} onValueChange={setProvider} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {PROVIDERS.find((p) => p.id === provider)?.description}
                  </p>
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Model</label>
                  <Select value={model} onValueChange={setModel} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentModels.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    placeholder="A serene Japanese garden with a red bridge, cherry blossoms, morning mist..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    disabled={loading}
                  />
                </div>

                <Button onClick={generateImage} disabled={loading || !prompt.trim()} className="w-full" size="lg">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{progress}</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Generate Image</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right: Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Result</CardTitle>
              </CardHeader>
              <CardContent>
                {imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
                    </div>
                    <Button onClick={() => downloadImage()} variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No image yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Provider comparison */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Free AI Image Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-background/50 border">
                  <p className="font-semibold text-primary">Lovable AI (Gemini)</p>
                  <p className="text-muted-foreground text-xs mt-1">Best quality. Uses Google Gemini models. Built-in, no extra key needed.</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border">
                  <p className="font-semibold text-primary">SubNP</p>
                  <p className="text-muted-foreground text-xs mt-1">Multiple models (Flux, SDXL, etc). Free tier available. Streaming progress.</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border">
                  <p className="font-semibold text-primary">Pollinations AI</p>
                  <p className="text-muted-foreground text-xs mt-1">100% free, open-source. No API key. Supports Flux, anime, realism styles.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" /> Generation History
              </CardTitle>
              <CardDescription>Your previously generated images</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No images generated yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((item) => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden border bg-card">
                      <div className="aspect-square bg-muted">
                        {item.result_data?.image_url ? (
                          <img
                            src={item.result_data.image_url}
                            alt={item.prompt || "AI image"}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setImageUrl(item.result_data.image_url)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs line-clamp-2 text-foreground">{item.prompt}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.result_data?.image_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => downloadImage(item.result_data.image_url)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => deleteHistoryItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {item.result_data?.provider && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                            {item.result_data.provider}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
