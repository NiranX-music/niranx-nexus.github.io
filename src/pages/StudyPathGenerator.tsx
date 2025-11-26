import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Calendar, Target, BookOpen, TrendingUp, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StudyPathGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("");
  const [subjects, setSubjects] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [exams, setExams] = useState("");
  const [generatedPath, setGeneratedPath] = useState<any>(null);
  const [studyPaths, setStudyPaths] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "my-paths">("create");

  const handleGenerate = async () => {
    if (!goal || !subjects || !targetDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const subjectArray = subjects.split(",").map(s => s.trim());
      const examArray = exams ? exams.split(",").map(e => e.trim()) : [];

      const { data, error } = await supabase.functions.invoke("generate-study-path", {
        body: {
          goal,
          subjects: subjectArray,
          targetDate,
          currentLevel,
          exams: examArray,
        },
      });

      if (error) throw error;

      setGeneratedPath(data.studyPath);
      toast.success("Study path generated successfully!");

      // Save to database
      const { error: saveError } = await supabase.from("study_paths").insert({
        user_id: user.id,
        title: goal,
        goal,
        target_date: targetDate,
        difficulty_level: currentLevel,
        subjects: subjectArray,
        roadmap: data.studyPath.roadmap,
      });

      if (saveError) throw saveError;
      
      // Save to AI generations history
      await supabase.from("ai_generations").insert({
        user_id: user.id,
        tool_type: "study_path",
        prompt: `Goal: ${goal}\nSubjects: ${subjectArray.join(", ")}\nLevel: ${currentLevel}`,
        result_data: {
          goal,
          subjects: subjectArray,
          target_date: targetDate,
          current_level: currentLevel,
          roadmap: data.studyPath.roadmap,
        },
        status: "completed",
      });
      
      loadStudyPaths();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to generate study path");
    } finally {
      setLoading(false);
    }
  };

  const loadStudyPaths = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("study_paths")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudyPaths(data || []);
    } catch (error) {
      console.error("Error loading paths:", error);
    }
  };

  useEffect(() => {
    loadStudyPaths();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Study Path Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Create personalized learning roadmaps powered by AI
            </p>
          </div>
        </div>

        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "create" ? "default" : "ghost"}
            onClick={() => setActiveTab("create")}
          >
            <Target className="h-4 w-4 mr-2" />
            Create Path
          </Button>
          <Button
            variant={activeTab === "my-paths" ? "default" : "ghost"}
            onClick={() => setActiveTab("my-paths")}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            My Paths
          </Button>
        </div>

        {activeTab === "create" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Define Your Learning Goals</CardTitle>
                <CardDescription>
                  Tell us about your goals and we'll create a personalized roadmap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Learning Goal *</Label>
                  <Textarea
                    id="goal"
                    placeholder="E.g., Master React and TypeScript for web development"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects (comma-separated) *</Label>
                  <Input
                    id="subjects"
                    placeholder="E.g., React, TypeScript, Node.js"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Current Level</Label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exams">Upcoming Exams (optional)</Label>
                  <Input
                    id="exams"
                    placeholder="E.g., AWS Certification, React Interview"
                    value={exams}
                    onChange={(e) => setExams(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Generating..." : "Generate Study Path"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {generatedPath && (
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Your Learning Roadmap
                  </CardTitle>
                  <CardDescription>
                    {generatedPath.totalWeeks} weeks • {generatedPath.difficulty} level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {generatedPath.roadmap?.map((milestone: any, idx: number) => (
                      <Card key={idx} className="border-l-4 border-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant="outline" className="mb-2">
                                Week {milestone.week}
                              </Badge>
                              <h4 className="font-semibold">{milestone.title}</h4>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {milestone.estimatedHours}h
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground">Topics:</p>
                              <ul className="list-disc list-inside">
                                {milestone.topics?.map((topic: string, i: number) => (
                                  <li key={i}>{topic}</li>
                                ))}
                              </ul>
                            </div>
                            {milestone.skills && milestone.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {milestone.skills.map((skill: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {generatedPath.tips && generatedPath.tips.length > 0 && (
                    <Card className="mt-4 bg-primary/5">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Study Tips
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {generatedPath.tips.map((tip: string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <span>•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "my-paths" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyPaths.map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <CardDescription>
                    {path.subjects.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Target: {new Date(path.target_date).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{path.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={path.progress_percentage || 0} />
                    </div>
                    <Badge variant={path.is_active ? "default" : "secondary"}>
                      {path.is_active ? "Active" : "Completed"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {studyPaths.length === 0 && (
              <Card className="col-span-full p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No study paths yet. Create your first one!
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
