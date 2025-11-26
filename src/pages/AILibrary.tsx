import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  Download, 
  ExternalLink,
  Trash2,
  Calendar,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface AIGeneration {
  id: string;
  tool_type: string;
  prompt: string | null;
  result_data: any;
  status: string;
  created_at: string;
}

export default function AILibrary() {
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchGenerations();
  }, [filter]);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("ai_generations")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("tool_type", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error("Error fetching generations:", error);
      toast.error("Failed to load AI library");
    } finally {
      setLoading(false);
    }
  };

  const deleteGeneration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ai_generations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Generation deleted");
      fetchGenerations();
    } catch (error) {
      console.error("Error deleting generation:", error);
      toast.error("Failed to delete generation");
    }
  };

  const getIcon = (toolType: string) => {
    switch (toolType) {
      case "song":
        return <Music className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "presentation":
        return <FileText className="h-5 w-5" />;
      case "website":
        return <Globe className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getToolLabel = (toolType: string) => {
    const labels: Record<string, string> = {
      song: "AI Song",
      image: "AI Image",
      presentation: "Presentation",
      website: "Website",
      study_path: "Study Path",
      note_summary: "Note Summary",
    };
    return labels[toolType] || toolType;
  };

  const renderGenerationCard = (gen: AIGeneration) => {
    const resultData = gen.result_data || {};

    return (
      <Card key={gen.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {getIcon(gen.tool_type)}
              </div>
              <div>
                <CardTitle className="text-lg">{resultData.title || "Untitled"}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(gen.created_at), "MMM dd, yyyy HH:mm")}
                </CardDescription>
              </div>
            </div>
            <Badge variant={gen.status === "completed" ? "default" : "secondary"}>
              {gen.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gen.prompt && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {gen.prompt}
            </div>
          )}

          {/* Song specific rendering */}
          {gen.tool_type === "song" && resultData.audio_url && (
            <div className="space-y-2">
              <audio controls className="w-full" src={resultData.audio_url} />
              {resultData.stems && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Stems Available:</p>
                  {Object.entries(resultData.stems).map(([name, url]: [string, any]) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <span className="capitalize">{name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Image specific rendering */}
          {gen.tool_type === "image" && resultData.image_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={resultData.image_url}
                alt={resultData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Presentation specific rendering */}
          {gen.tool_type === "presentation" && resultData.download_url && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{resultData.slides || 0} slides</span>
            </div>
          )}

          {/* Website specific rendering */}
          {gen.tool_type === "website" && resultData.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(resultData.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Website
            </Button>
          )}

          <div className="flex items-center gap-2">
            {resultData.audio_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = resultData.audio_url;
                  a.download = `${resultData.title || "song"}.mp3`;
                  a.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {resultData.image_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = resultData.image_url;
                  a.download = `${resultData.title || "image"}.png`;
                  a.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {resultData.download_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resultData.download_url, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteGeneration(gen.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Library</h1>
          <p className="text-muted-foreground">
            All your AI-generated content in one place
          </p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="song">Songs</TabsTrigger>
          <TabsTrigger value="image">Images</TabsTrigger>
          <TabsTrigger value="presentation">Presentations</TabsTrigger>
          <TabsTrigger value="website">Websites</TabsTrigger>
          <TabsTrigger value="study_path">Study Paths</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading generations...</p>
            </div>
          ) : generations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No {filter !== "all" ? getToolLabel(filter).toLowerCase() + "s" : "generations"} yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start creating with AI tools to see your generations here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map(renderGenerationCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
