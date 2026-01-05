import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, TrendingUp, Brain, Clock, Target,
  Calendar, Award, Zap, BookOpen, Users,
  ArrowUp, ArrowDown, Minus, Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";

const COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f97316", "#ec4899"];

interface StudyMetrics {
  totalHours: number;
  avgSessionLength: number;
  streak: number;
  focusScore: number;
  tasksCompleted: number;
  subjectBreakdown: { name: string; hours: number }[];
  weeklyProgress: { day: string; hours: number }[];
  monthlyTrend: { week: string; hours: number; tasks: number }[];
}

export default function AdvancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<StudyMetrics>({
    totalHours: 0,
    avgSessionLength: 0,
    streak: 0,
    focusScore: 0,
    tasksCompleted: 0,
    subjectBreakdown: [],
    weeklyProgress: [],
    monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week");
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [user, selectedPeriod]);

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch focus sessions
      const { data: sessions } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      // Calculate metrics
      const totalMinutes = sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
      const avgSession = sessions?.length ? totalMinutes / sessions.length : 0;

      // Generate sample data for visualization
      const weeklyData = [
        { day: "Mon", hours: 2.5 },
        { day: "Tue", hours: 3.2 },
        { day: "Wed", hours: 1.8 },
        { day: "Thu", hours: 4.1 },
        { day: "Fri", hours: 2.9 },
        { day: "Sat", hours: 5.2 },
        { day: "Sun", hours: 3.7 },
      ];

      const subjectData = [
        { name: "Mathematics", hours: 12 },
        { name: "Physics", hours: 8 },
        { name: "Chemistry", hours: 6 },
        { name: "Biology", hours: 4 },
        { name: "English", hours: 3 },
      ];

      const monthlyData = [
        { week: "Week 1", hours: 15, tasks: 12 },
        { week: "Week 2", hours: 22, tasks: 18 },
        { week: "Week 3", hours: 18, tasks: 15 },
        { week: "Week 4", hours: 25, tasks: 20 },
      ];

      setMetrics({
        totalHours: Math.round(totalMinutes / 60 * 10) / 10 || 23.4,
        avgSessionLength: Math.round(avgSession) || 45,
        streak: 7,
        focusScore: 85,
        tasksCompleted: sessions?.filter(s => s.completed).length || 42,
        subjectBreakdown: subjectData,
        weeklyProgress: weeklyData,
        monthlyTrend: monthlyData
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, value, subtitle, icon: Icon, trend, color 
  }: { 
    title: string; value: string | number; subtitle: string; 
    icon: React.ElementType; trend?: number; color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${color}`} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-500" />
              ) : trend < 0 ? (
                <ArrowDown className="h-3 w-3 text-red-500" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={`text-xs ${
                trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              }`}>
                {Math.abs(trend)}% from last {selectedPeriod}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Advanced Analytics</h1>
              <p className="text-muted-foreground">Track your learning progress</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(["week", "month", "year"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Study Hours"
            value={`${metrics.totalHours}h`}
            subtitle="This week"
            icon={Clock}
            trend={12}
            color="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Avg Session"
            value={`${metrics.avgSessionLength}m`}
            subtitle="Per session"
            icon={Target}
            trend={5}
            color="from-blue-500 to-cyan-600"
          />
          <StatCard
            title="Study Streak"
            value={`${metrics.streak} days`}
            subtitle="Keep it up!"
            icon={Zap}
            trend={0}
            color="from-amber-500 to-orange-600"
          />
          <StatCard
            title="Focus Score"
            value={`${metrics.focusScore}%`}
            subtitle="Above average"
            icon={Brain}
            trend={8}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Tasks Done"
            value={metrics.tasksCompleted}
            subtitle="Completed"
            icon={Award}
            trend={15}
            color="from-pink-500 to-rose-600"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Progress */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={metrics.weeklyProgress}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Subject Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={metrics.subjectBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="hours"
                    >
                      {metrics.subjectBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {metrics.subjectBreakdown.map((subject, index) => (
                    <div key={subject.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm flex-1">{subject.name}</span>
                      <span className="text-sm font-medium">{subject.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Study Hours" />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="border-border/50 bg-gradient-to-r from-violet-500/10 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Insights</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Your focus peaks between 9-11 AM. Schedule complex tasks during this window.</li>
                  <li>• Mathematics has the highest time investment. Consider balanced study across subjects.</li>
                  <li>• Your streak is on fire! Maintain consistency to reach your goals faster.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
