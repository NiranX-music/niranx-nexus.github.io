import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Upload, Sparkles, Brain, Tag, Network } from "lucide-react";

export default function NoteSummarizer() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [summaries, setSummaries] = useState<any[]>([]);
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      setNoteContent(text);
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      toast.success("File loaded successfully!");
    } catch (error) {
      toast.error("Failed to read file");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!noteContent || !title) {
      toast.error("Please provide both title and content");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("summarize-notes", {
        body: { noteContent, title, subject },
      });

      if (error) throw error;

      const summaryData = data.summary;
      setCurrentSummary(summaryData);
      toast.success("Notes summarized successfully!");

      // Save to database
      const { error: saveError } = await supabase.from("note_summaries").insert({
        user_id: user.id,
        title,
        subject,
        summary: summaryData.summary,
        key_points: summaryData.keyPoints,
        mind_map: summaryData.mindMap,
        tags: summaryData.tags,
      });

      if (saveError) throw saveError;
      loadSummaries();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to summarize notes");
    } finally {
      setLoading(false);
    }
  };

  const loadSummaries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("note_summaries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error("Error loading summaries:", error);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Note Summarizer
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload notes and get AI-powered summaries, key points, and mind maps
          </p>
        </div>

        <Tabs defaultValue="summarize" className="w-full">
          <TabsList>
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="library">My Summaries</TabsTrigger>
          </TabsList>

          <TabsContent value="summarize" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Notes</CardTitle>
                  <CardDescription>
                    Paste text or upload a file (.txt, .md, .pdf)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="E.g., Introduction to React Hooks"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (optional)</Label>
                    <Input
                      id="subject"
                      placeholder="E.g., Computer Science"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Or Paste Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste your notes here..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={12}
                    />
                  </div>

                  <Button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Analyzing..." : "Generate Summary"}
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {currentSummary && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{currentSummary.summary}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Key Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentSummary.keyPoints?.map((point: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-sm">
                            <span className="text-primary">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {currentSummary.mindMap && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-5 w-5" />
                          Mind Map
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <Badge variant="default" className="text-base px-4 py-2">
                              {currentSummary.mindMap.central}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            {currentSummary.mindMap.branches?.map((branch: any, idx: number) => (
                              <Card key={idx} className="border-l-4 border-primary">
                                <CardContent className="p-3">
                                  <h4 className="font-semibold mb-2">{branch.title}</h4>
                                  <ul className="space-y-1 text-sm">
                                    {branch.concepts?.map((concept: string, i: number) => (
                                      <li key={i} className="text-muted-foreground">• {concept}</li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentSummary.tags && currentSummary.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          Tags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {currentSummary.tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="library">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaries.map((summary) => (
                <Card
                  key={summary.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setCurrentSummary(summary)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{summary.title}</CardTitle>
                    {summary.subject && (
                      <Badge variant="outline">{summary.subject}</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {summary.summary}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {summary.tags?.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {summaries.length === 0 && (
                <Card className="col-span-full p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No summaries yet. Upload your first notes!
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
