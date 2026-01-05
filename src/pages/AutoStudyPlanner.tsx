import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarClock, 
  Loader2, 
  Sparkles,
  Clock,
  Target,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Save,
  Download,
  Check,
  AlertCircle,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIProviderSelector, useAIProvider } from "@/components/ai/AIProviderSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subject {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  hoursPerWeek: number;
  deadline?: string;
}

interface StudyBlock {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  type: "study" | "review" | "practice" | "break";
}

interface StudyPlan {
  id: string;
  name: string;
  subjects: Subject[];
  schedule: StudyBlock[];
  createdAt: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const priorityColors = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-success/20 text-success border-success/30",
};

export default function AutoStudyPlanner() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [schedule, setSchedule] = useState<StudyBlock[]>([]);
  const [studyHoursPerDay, setStudyHoursPerDay] = useState([4]);
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [preferMornings, setPreferMornings] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPlans, setSavedPlans] = useState<StudyPlan[]>([]);
  const [currentPlanName, setCurrentPlanName] = useState("My Study Plan");
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('study-planner');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavedPlans();
    }
  }, [user]);

  const loadSavedPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generations")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tool_type", "study_planner")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const plans = data?.map((item: any) => ({
        id: item.id,
        name: item.result_data?.name || "Untitled Plan",
        subjects: item.result_data?.subjects || [],
        schedule: item.result_data?.schedule || [],
        createdAt: item.created_at,
      })) || [];

      setSavedPlans(plans);
    } catch (error) {
      console.error("Error loading plans:", error);
    }
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject,
      priority: "medium",
      hoursPerWeek: 5,
    };
    
    setSubjects(prev => [...prev, subject]);
    setNewSubject("");
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => 
      prev.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const generateSchedule = async () => {
    if (subjects.length === 0) {
      toast({
        title: "No subjects",
        description: "Please add at least one subject to generate a schedule",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await supabase.functions.invoke("auto-study-planner", {
        body: {
          subjects,
          preferences: {
            hoursPerDay: studyHoursPerDay[0],
            includeBreaks,
            preferMornings,
            daysOfWeek,
          },
          provider,
          model,
        },
      });

      if (response.error) throw response.error;

      const generatedSchedule = response.data.schedule || [];
      setSchedule(generatedSchedule);

      toast({
        title: "Schedule generated",
        description: `Created ${generatedSchedule.length} study blocks for your week`,
      });
    } catch (error: any) {
      console.error("Error generating schedule:", error);
      
      let errorMessage = "Failed to generate schedule. Please try again.";
      if (error.message?.includes("429")) {
        errorMessage = "Rate limit reached. Please wait and try again.";
      } else if (error.message?.includes("402")) {
        errorMessage = "API quota exceeded. Try a different AI provider.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your study plan",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("ai_generations").insert({
        user_id: user.id,
        tool_type: "study_planner",
        prompt: subjects.map(s => s.name).join(", "),
        result_data: {
          name: currentPlanName,
          subjects,
          schedule,
        },
      });

      if (error) throw error;

      toast({
        title: "Plan saved",
        description: "Your study plan has been saved",
      });

      loadSavedPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive",
      });
    }
  };

  const loadPlan = (plan: StudyPlan) => {
    setSubjects(plan.subjects);
    setSchedule(plan.schedule);
    setCurrentPlanName(plan.name);
    toast({
      title: "Plan loaded",
      description: `Loaded "${plan.name}"`,
    });
  };

  const exportToCal = () => {
    // Generate ICS file
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NiranX//Study Planner//EN
`;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    schedule.forEach(block => {
      const dayIndex = daysOfWeek.indexOf(block.day);
      const blockDate = new Date(startOfWeek);
      blockDate.setDate(startOfWeek.getDate() + dayIndex);

      const [startHour, startMin] = block.startTime.split(":").map(Number);
      const [endHour, endMin] = block.endTime.split(":").map(Number);

      const startDate = new Date(blockDate);
      startDate.setHours(startHour, startMin, 0);
      const endDate = new Date(blockDate);
      endDate.setHours(endHour, endMin, 0);

      icsContent += `BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${block.type === 'break' ? '☕ Break' : `📚 ${block.subject}`}
DESCRIPTION:${block.type.charAt(0).toUpperCase() + block.type.slice(1)} session
END:VEVENT
`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Calendar exported",
      description: "Import the .ics file into your calendar app",
    });
  };

  const getBlocksForDay = (day: string) => {
    return schedule
      .filter(block => block.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
            <CalendarClock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Auto Study Planner
            </h1>
            <p className="text-muted-foreground">
              AI-powered personalized study schedule generator
            </p>
          </div>
        </div>
        <AIProviderSelector selectedProvider={provider} selectedModel={model} onProviderChange={setProvider} onModelChange={setModel} />
      </motion.div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="create">Create Plan</TabsTrigger>
          <TabsTrigger value="schedule">View Schedule</TabsTrigger>
          <TabsTrigger value="saved">Saved Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subjects Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Subjects
                  </CardTitle>
                  <CardDescription>
                    Add the subjects you want to study
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Add a subject..."
                      onKeyDown={(e) => e.key === "Enter" && addSubject()}
                    />
                    <Button onClick={addSubject}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {subjects.map((subject, index) => (
                          <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-xl border bg-card space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{subject.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSubject(subject.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              {(["high", "medium", "low"] as const).map((priority) => (
                                <Badge
                                  key={priority}
                                  variant="outline"
                                  className={cn(
                                    "cursor-pointer transition-all",
                                    subject.priority === priority 
                                      ? priorityColors[priority] 
                                      : "opacity-50 hover:opacity-100"
                                  )}
                                  onClick={() => updateSubject(subject.id, { priority })}
                                >
                                  {priority}
                                </Badge>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Hours/week</span>
                                <span className="font-medium">{subject.hoursPerWeek}h</span>
                              </div>
                              <Slider
                                value={[subject.hoursPerWeek]}
                                onValueChange={([value]) => updateSubject(subject.id, { hoursPerWeek: value })}
                                max={20}
                                min={1}
                                step={1}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>

                  {subjects.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Add subjects to create your study plan
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Preferences Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your study schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Plan Name</Label>
                    <Input
                      value={currentPlanName}
                      onChange={(e) => setCurrentPlanName(e.target.value)}
                      placeholder="My Study Plan"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Study hours per day</Label>
                      <span className="text-sm font-medium">{studyHoursPerDay[0]}h</span>
                    </div>
                    <Slider
                      value={studyHoursPerDay}
                      onValueChange={setStudyHoursPerDay}
                      max={12}
                      min={1}
                      step={0.5}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include breaks</Label>
                      <p className="text-xs text-muted-foreground">
                        Add 15-min breaks between study sessions
                      </p>
                    </div>
                    <Switch
                      checked={includeBreaks}
                      onCheckedChange={setIncludeBreaks}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Prefer mornings</Label>
                      <p className="text-xs text-muted-foreground">
                        Schedule difficult subjects in the morning
                      </p>
                    </div>
                    <Switch
                      checked={preferMornings}
                      onCheckedChange={setPreferMornings}
                    />
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={generateSchedule}
                      disabled={isGenerating || subjects.length === 0}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-5 w-5 mr-2" />
                      )}
                      Generate Schedule
                    </Button>

                    {schedule.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={savePlan}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Plan
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={exportToCal}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                Your AI-generated study schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.length > 0 ? (
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, dayIndex) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIndex * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="text-center font-semibold text-sm py-2 bg-muted rounded-lg">
                        {day.substring(0, 3)}
                      </div>
                      <div className="space-y-1 min-h-[300px]">
                        {getBlocksForDay(day).map((block, blockIndex) => (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (dayIndex * 0.05) + (blockIndex * 0.02) }}
                            className={cn(
                              "p-2 rounded-lg text-xs",
                              block.type === "break"
                                ? "bg-muted/50 text-muted-foreground"
                                : block.type === "review"
                                ? "bg-accent/20 text-accent-foreground"
                                : block.type === "practice"
                                ? "bg-success/20 text-success"
                                : "bg-primary/20 text-primary"
                            )}
                          >
                            <div className="font-medium truncate">
                              {block.type === "break" ? "☕ Break" : block.subject}
                            </div>
                            <div className="text-[10px] opacity-70">
                              {block.startTime} - {block.endTime}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No schedule generated yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Add subjects and click "Generate Schedule" to create your plan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Plans</CardTitle>
              <CardDescription>
                Your previously created study plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPlans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => loadPlan(plan)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {plan.subjects.slice(0, 3).map(subject => (
                              <Badge key={subject.id} variant="secondary" className="text-xs">
                                {subject.name}
                              </Badge>
                            ))}
                            {plan.subjects.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{plan.subjects.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No saved plans yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Create and save a study plan to see it here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
