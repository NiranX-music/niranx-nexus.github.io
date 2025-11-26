import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Network, Sparkles, FileText, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConceptNode {
  id: string;
  label: string;
  type: "main" | "subtopic" | "definition" | "formula" | "prerequisite";
  description?: string;
  connections: string[];
}

interface TopicMap {
  title: string;
  concepts: ConceptNode[];
  definitions: Record<string, string>;
  formulas: Array<{ name: string; formula: string; explanation: string }>;
  prerequisites: string[];
  flowchart: Array<{ from: string; to: string; label?: string }>;
}

export default function AITopicMapGenerator() {
  const [chapterText, setChapterText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [topicMap, setTopicMap] = useState<TopicMap | null>(null);

  const handleGenerate = async () => {
    if (!chapterText.trim()) {
      toast.error("Please paste some text to analyze");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-topic-map", {
        body: { chapterText }
      });

      if (error) throw error;

      setTopicMap(data.topicMap);
      toast.success("Topic map generated successfully!");
    } catch (error) {
      console.error("Error generating topic map:", error);
      toast.error("Failed to generate topic map");
    } finally {
      setIsGenerating(false);
    }
  };

  const getNodeColor = (type: string) => {
    const colors = {
      main: "bg-primary/20 border-primary",
      subtopic: "bg-blue-500/20 border-blue-500",
      definition: "bg-green-500/20 border-green-500",
      formula: "bg-purple-500/20 border-purple-500",
      prerequisite: "bg-orange-500/20 border-orange-500"
    };
    return colors[type as keyof typeof colors] || "bg-muted border-border";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Network className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Topic-Map Generator</h1>
          <p className="text-muted-foreground">
            Paste any chapter and get an interactive concept map with definitions, formulas, and prerequisites
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Input Chapter Text
          </CardTitle>
          <CardDescription>
            Paste your chapter, lecture notes, or study material below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={chapterText}
            onChange={(e) => setChapterText(e.target.value)}
            placeholder="Paste your chapter or study material here..."
            className="min-h-[200px] font-mono text-sm"
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !chapterText.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Topic Map...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Topic Map
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {topicMap && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {topicMap.title}
              </CardTitle>
            </CardHeader>
          </Card>

          {topicMap.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topicMap.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-500">▸</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Concept Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topicMap.concepts.map((concept) => (
                  <Card key={concept.id} className={`border-2 ${getNodeColor(concept.type)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-semibold">{concept.label}</CardTitle>
                        <span className="text-xs px-2 py-1 rounded-full bg-background/50">
                          {concept.type}
                        </span>
                      </div>
                    </CardHeader>
                    {concept.description && (
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">{concept.description}</p>
                        {concept.connections.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="font-semibold">Connects to:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {concept.connections.map((conn, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-primary/10 rounded">
                                  {conn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {Object.keys(topicMap.definitions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Definitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(topicMap.definitions).map(([term, definition], idx) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm">{term}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{definition}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {topicMap.formulas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Formulas & Relations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicMap.formulas.map((formula, idx) => (
                    <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                      <h4 className="font-semibold text-sm">{formula.name}</h4>
                      <code className="block bg-muted px-3 py-2 rounded mt-2 font-mono text-sm">
                        {formula.formula}
                      </code>
                      <p className="text-sm text-muted-foreground mt-2">{formula.explanation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {topicMap.flowchart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Process Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topicMap.flowchart.map((flow, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                      <span className="font-medium">{flow.from}</span>
                      <span className="text-primary">→</span>
                      {flow.label && <span className="text-xs text-muted-foreground italic">({flow.label})</span>}
                      <span className="font-medium">{flow.to}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
