import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, BookOpen, AlertTriangle, Users, Brain, Trophy, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isTomorrow, differenceInMinutes, addDays } from "date-fns";
import { LiveClassCard } from "@/components/scheduler/LiveClassCard";
import { HomeworkCard } from "@/components/scheduler/HomeworkCard";
import { UnifiedCalendar } from "@/components/scheduler/UnifiedCalendar";
import { WorkloadMeter } from "@/components/scheduler/WorkloadMeter";
import { ConflictAlert } from "@/components/scheduler/ConflictAlert";
import { AddItemDialog } from "@/components/scheduler/AddItemDialog";
import { AIInsightsPanel } from "@/components/scheduler/AIInsightsPanel";
import { NaturalLanguageInput } from "@/components/scheduler/NaturalLanguageInput";
import { StudyBuddyPanel } from "@/components/scheduler/StudyBuddyPanel";
import { GamificationStats } from "@/components/scheduler/GamificationStats";
import { SmartSchedulingAssistant } from "@/components/scheduler/SmartSchedulingAssistant";
import { ClassLeaderboard } from "@/components/scheduler/ClassLeaderboard";
import { HomeworkBossBattles } from "@/components/scheduler/HomeworkBossBattles";

interface LiveClass {
  id: string;
  title: string;
  class_link: string | null;
  start_time: string;
  end_time: string;
  subject: string;
  status: string;
  attendance_count: number;
  recording_url: string | null;
  notes: string | null;
}

interface Homework {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  due_date: string;
  estimated_time: number | null;
  actual_time: number | null;
  priority: string;
  status: string;
  exam_link: string | null;
  dependency_ids: string[] | null;
  progress_checkpoints: any;
  collaboration_enabled: boolean;
}

interface Exam {
  id: string;
  name: string;
  subject: string;
  exam_date: string;
  exam_time: string;
  duration: string;
  preparation_progress: number;
}

interface Conflict {
  id: string;
  conflict_type: string;
  items: any;
  detected_at: string;
  resolved: boolean;
}

interface WorkloadData {
  stress_level: number;
  classes_count: number;
  homework_count: number;
  exams_count: number;
  total_estimated_hours: number;
}

const ClassScheduler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [workload, setWorkload] = useState<WorkloadData>({
    stress_level: 0,
    classes_count: 0,
    homework_count: 0,
    exams_count: 0,
    total_estimated_hours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<"class" | "homework">("class");

  useEffect(() => {
    fetchAllData();
    subscribeToRealtime();
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch live classes
      const { data: classesData } = await supabase
        .from("live_classes")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });

      // Fetch homework
      const { data: homeworkData } = await supabase
        .from("homework_assignments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      // Fetch exams
      const { data: examsData } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", user.id)
        .order("exam_date", { ascending: true });

      // Fetch conflicts
      const { data: conflictsData } = await supabase
        .from("schedule_conflicts")
        .select("*")
        .eq("user_id", user.id)
        .eq("resolved", false)
        .order("detected_at", { ascending: false });

      setLiveClasses(classesData || []);
      setHomework(homeworkData || []);
      setExams(examsData || []);
      setConflicts(conflictsData || []);

      // Calculate workload
      await calculateWorkload(classesData || [], homeworkData || [], examsData || []);
      
      // Detect conflicts
      await detectConflicts(classesData || [], homeworkData || [], examsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkload = async (classes: LiveClass[], hw: Homework[], exs: Exam[]) => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    const upcomingClasses = classes.filter(c => {
      const start = new Date(c.start_time);
      return start >= today && start <= nextWeek;
    });

    const upcomingHomework = hw.filter(h => {
      const due = new Date(h.due_date);
      return due >= today && due <= nextWeek && h.status !== "completed";
    });

    const upcomingExams = exs.filter(e => {
      const examDate = new Date(e.exam_date);
      return examDate >= today && examDate <= nextWeek;
    });

    const totalHours = upcomingHomework.reduce((sum, h) => sum + (h.estimated_time || 0), 0) / 60;
    const totalItems = upcomingClasses.length + upcomingHomework.length + upcomingExams.length;
    
    // Calculate stress level (0-100)
    const stressLevel = Math.min(100, (totalItems * 10) + (totalHours * 5));

    const workloadData = {
      stress_level: Math.round(stressLevel),
      classes_count: upcomingClasses.length,
      homework_count: upcomingHomework.length,
      exams_count: upcomingExams.length,
      total_estimated_hours: Math.round(totalHours),
    };

    setWorkload(workloadData);

    // Save workload snapshot
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("workload_snapshots").upsert({
        user_id: user.id,
        date: format(today, "yyyy-MM-dd"),
        ...workloadData,
      }, {
        onConflict: "user_id,date",
      });
    }
  };

  const detectConflicts = async (classes: LiveClass[], hw: Homework[], exs: Exam[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newConflicts: any[] = [];

    // Check for overlapping classes
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const class1Start = new Date(classes[i].start_time);
        const class1End = new Date(classes[i].end_time);
        const class2Start = new Date(classes[j].start_time);
        const class2End = new Date(classes[j].end_time);

        if (
          (class1Start >= class2Start && class1Start < class2End) ||
          (class2Start >= class1Start && class2Start < class1End)
        ) {
          newConflicts.push({
            user_id: user.id,
            conflict_type: "overlapping_classes",
            items: { class1: classes[i], class2: classes[j] },
            resolved: false,
          });
        }
      }
    }

    // Check for homework due during class
    for (const cls of classes) {
      for (const hw of homework) {
        const classStart = new Date(cls.start_time);
        const classEnd = new Date(cls.end_time);
        const hwDue = new Date(hw.due_date);

        if (hwDue >= classStart && hwDue <= classEnd) {
          newConflicts.push({
            user_id: user.id,
            conflict_type: "homework_during_class",
            items: { class: cls, homework: hw },
            resolved: false,
          });
        }
      }
    }

    // Save new conflicts
    if (newConflicts.length > 0) {
      await supabase.from("schedule_conflicts").insert(newConflicts);
    }
  };

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel("schedule-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_classes" },
        () => fetchAllData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homework_assignments" },
        () => fetchAllData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exams" },
        () => fetchAllData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getTodaySchedule = () => {
    const todayClasses = liveClasses.filter(c => isToday(new Date(c.start_time)));
    const todayHomework = homework.filter(h => isToday(new Date(h.due_date)));
    const todayExams = exams.filter(e => isToday(new Date(e.exam_date)));
    return { todayClasses, todayHomework, todayExams };
  };

  const getUpcoming = () => {
    const now = new Date();
    const upcomingClasses = liveClasses.filter(c => new Date(c.start_time) > now).slice(0, 5);
    const upcomingHomework = homework.filter(h => new Date(h.due_date) > now && h.status !== "completed").slice(0, 5);
    const upcomingExams = exams.filter(e => new Date(e.exam_date) > now).slice(0, 5);
    return { upcomingClasses, upcomingHomework, upcomingExams };
  };

  const { todayClasses, todayHomework, todayExams } = getTodaySchedule();
  const { upcomingClasses, upcomingHomework, upcomingExams } = getUpcoming();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Unified Schedule Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your classes, exams, and homework in one place with AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setAddDialogType("class"); setAddDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
          <Button onClick={() => { setAddDialogType("homework"); setAddDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Homework
          </Button>
        </div>
      </div>

      {/* Natural Language Quick Add */}
      <NaturalLanguageInput onSuccess={fetchAllData} />

      {/* Quick Stats & Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayClasses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayClasses.filter(c => c.status === "live").length} live now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Homework</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homework.filter(h => h.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayHomework.length} due today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayExams.length} scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workload Stress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <WorkloadMeter level={workload.stress_level} />
          </CardContent>
        </Card>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Schedule Conflicts Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflicts.map((conflict) => (
              <ConflictAlert
                key={conflict.id}
                conflict={conflict}
                onResolve={() => fetchAllData()}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Live Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {todayClasses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No classes today</p>
                  ) : (
                    <div className="space-y-2">
                      {todayClasses.map((cls) => (
                        <LiveClassCard
                          key={cls.id}
                          liveClass={cls}
                          onUpdate={fetchAllData}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Homework Due */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Homework Due
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {todayHomework.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No homework due today</p>
                  ) : (
                    <div className="space-y-2">
                      {todayHomework.map((hw) => (
                        <HomeworkCard
                          key={hw.id}
                          homework={hw}
                          onUpdate={fetchAllData}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Today's Exams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Exams Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {todayExams.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No exams today</p>
                  ) : (
                    <div className="space-y-2">
                      {todayExams.map((exam) => (
                        <Card key={exam.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{exam.name}</h4>
                              <Badge>{exam.subject}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {exam.exam_time} • {exam.duration}
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Preparation</span>
                                <span>{exam.preparation_progress}%</span>
                              </div>
                              <Progress value={exam.preparation_progress} />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {upcomingClasses.map((cls) => (
                    <LiveClassCard
                      key={cls.id}
                      liveClass={cls}
                      onUpdate={fetchAllData}
                    />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Homework</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {upcomingHomework.map((hw) => (
                    <HomeworkCard
                      key={hw.id}
                      homework={hw}
                      onUpdate={fetchAllData}
                    />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {upcomingExams.map((exam) => (
                    <Card key={exam.id} className="p-4 mb-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{exam.name}</h4>
                          <Badge>{exam.subject}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(exam.exam_date), "PPP")} at {exam.exam_time}
                        </div>
                        <Progress value={exam.preparation_progress} />
                      </div>
                    </Card>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <UnifiedCalendar
            classes={liveClasses}
            homework={homework}
            exams={exams}
            onUpdate={fetchAllData}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Smart Scheduling Assistant */}
          <SmartSchedulingAssistant 
            liveClasses={liveClasses}
            homework={homework}
            exams={exams}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* AI Insights */}
            <div>
              <AIInsightsPanel 
                homework={homework}
                exams={exams}
                liveClasses={liveClasses}
                workload={workload}
              />
            </div>

            {/* Study Buddies & Streaks */}
            <div>
              <StudyBuddyPanel homework={homework} />
            </div>

            {/* Gamification */}
            <div>
              <GamificationStats homework={homework} exams={exams} />
            </div>
          </div>

          {/* Homework Boss Battles & Leaderboards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HomeworkBossBattles homework={homework} />
            <ClassLeaderboard />
          </div>

          {/* Workload Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Workload Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="text-sm font-medium">{workload.total_estimated_hours}h estimated</span>
                </div>
                <Progress value={(workload.total_estimated_hours / 40) * 100} />
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <div className="text-2xl font-bold text-blue-600">{workload.classes_count}</div>
                    <p className="text-xs text-muted-foreground mt-1">Classes</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                    <div className="text-2xl font-bold text-green-600">{workload.homework_count}</div>
                    <p className="text-xs text-muted-foreground mt-1">Homework</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-500/10">
                    <div className="text-2xl font-bold text-purple-600">{workload.exams_count}</div>
                    <p className="text-xs text-muted-foreground mt-1">Exams</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        type={addDialogType}
        onSuccess={fetchAllData}
      />
    </div>
  );
};

export default ClassScheduler;
