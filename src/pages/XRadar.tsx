import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, Brain, Clock, Flame, Target, TrendingUp, Zap, BarChart3, Calendar, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";

const XRadar = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  const weeklyData = [
    { day: "Mon", study: 2.5, focus: 3, tasks: 5 },
    { day: "Tue", study: 4, focus: 3.5, tasks: 8 },
    { day: "Wed", study: 1.5, focus: 2, tasks: 3 },
    { day: "Thu", study: 5, focus: 4, tasks: 12 },
    { day: "Fri", study: 3, focus: 3, tasks: 7 },
    { day: "Sat", study: 6, focus: 5, tasks: 15 },
    { day: "Sun", study: 2, focus: 2.5, tasks: 4 },
  ];

  const categoryData = [
    { name: "Math", value: 35, color: "hsl(var(--primary))" },
    { name: "Science", value: 25, color: "hsl(var(--accent-foreground))" },
    { name: "English", value: 20, color: "hsl(var(--muted-foreground))" },
    { name: "History", value: 12, color: "hsl(var(--secondary-foreground))" },
    { name: "Other", value: 8, color: "hsl(var(--destructive))" },
  ];

  const trendData = [
    { week: "W1", score: 62 }, { week: "W2", score: 68 }, { week: "W3", score: 71 },
    { week: "W4", score: 65 }, { week: "W5", score: 78 }, { week: "W6", score: 82 },
    { week: "W7", score: 85 }, { week: "W8", score: 79 }, { week: "W9", score: 88 },
    { week: "W10", score: 91 }, { week: "W11", score: 87 }, { week: "W12", score: 94 },
  ];

  const insights = useMemo(() => [
    { icon: <Flame className="h-5 w-5" />, title: "Hot Streak", desc: "You've studied 7 days in a row — your best streak this month!", color: "text-orange-500" },
    { icon: <TrendingUp className="h-5 w-5" />, title: "Productivity Up", desc: "Tasks completed increased 34% compared to last week.", color: "text-emerald-500" },
    { icon: <Brain className="h-5 w-5" />, title: "Peak Hours", desc: "You focus best between 2 PM – 5 PM. Schedule hard tasks then.", color: "text-primary" },
    { icon: <Target className="h-5 w-5" />, title: "Weak Spot", desc: "History review has been neglected — consider a 30-min session.", color: "text-yellow-500" },
  ], []);

  const stats = [
    { label: "Total Hours", value: "24.5h", change: "+12%", icon: <Clock className="h-4 w-4" /> },
    { label: "Focus Score", value: "87", change: "+5", icon: <Zap className="h-4 w-4" /> },
    { label: "Tasks Done", value: "54", change: "+18", icon: <Target className="h-4 w-4" /> },
    { label: "Streak", value: "7 days", change: "Best!", icon: <Flame className="h-4 w-4" /> },
  ];

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            XRadar
          </h1>
          <p className="text-muted-foreground mt-1">Personal analytics & performance insights</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
                  <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" /> AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className={insight.color}>{insight.icon}</div>
                <div>
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Hours Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="study" name="Study (hrs)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="focus" name="Focus (hrs)" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Subject Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 justify-center">
              {categoryData.map((cat, i) => (
                <Badge key={i} variant="outline" className="text-xs">{cat.name}: {cat.value}%</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[50, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills Radar (text-based) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skill Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { skill: "Focus & Concentration", level: 87 },
            { skill: "Task Completion", level: 72 },
            { skill: "Time Management", level: 65 },
            { skill: "Consistency", level: 91 },
            { skill: "Knowledge Retention", level: 78 },
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{s.skill}</span>
                <span className="text-muted-foreground">{s.level}%</span>
              </div>
              <Progress value={s.level} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default XRadar;
