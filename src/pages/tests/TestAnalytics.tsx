import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, Users, Clock, Target, 
  Award, Brain, Download, Filter, Calendar,
  ChevronDown, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

// Mock data
const overviewStats = [
  { label: "Tests Created", value: 24, change: 12, icon: BarChart3 },
  { label: "Total Attempts", value: 1248, change: 8, icon: Users },
  { label: "Avg. Score", value: "72%", change: -2, icon: Target },
  { label: "Avg. Time", value: "45 min", change: 5, icon: Clock },
];

const performanceData = [
  { month: "Jan", avgScore: 68, attempts: 120 },
  { month: "Feb", avgScore: 72, attempts: 145 },
  { month: "Mar", avgScore: 70, attempts: 132 },
  { month: "Apr", avgScore: 75, attempts: 168 },
  { month: "May", avgScore: 78, attempts: 189 },
  { month: "Jun", avgScore: 82, attempts: 210 },
];

const subjectPerformance = [
  { subject: "Mathematics", avgScore: 78, students: 320, color: "#8b5cf6" },
  { subject: "Physics", avgScore: 72, students: 280, color: "#06b6d4" },
  { subject: "Chemistry", avgScore: 68, students: 245, color: "#10b981" },
  { subject: "Biology", avgScore: 75, students: 198, color: "#f59e0b" },
  { subject: "English", avgScore: 82, students: 156, color: "#ef4444" },
];

const questionAnalysis = [
  { id: 1, question: "What is the derivative of x²?", difficulty: 0.35, discrimination: 0.72, attempts: 450, correct: 292 },
  { id: 2, question: "Define Newton's First Law", difficulty: 0.42, discrimination: 0.65, attempts: 450, correct: 261 },
  { id: 3, question: "Balance the equation: H2 + O2 → H2O", difficulty: 0.58, discrimination: 0.78, attempts: 450, correct: 189 },
  { id: 4, question: "What is mitochondria?", difficulty: 0.28, discrimination: 0.55, attempts: 450, correct: 324 },
  { id: 5, question: "Solve: 2x + 5 = 15", difficulty: 0.22, discrimination: 0.48, attempts: 450, correct: 351 },
];

const topPerformers = [
  { rank: 1, name: "Alex Johnson", score: 98, time: "32 min", tests: 12 },
  { rank: 2, name: "Sarah Williams", score: 95, time: "38 min", tests: 10 },
  { rank: 3, name: "Michael Chen", score: 94, time: "35 min", tests: 11 },
  { rank: 4, name: "Emma Davis", score: 92, time: "40 min", tests: 9 },
  { rank: 5, name: "James Wilson", score: 91, time: "42 min", tests: 8 },
];

const skillRadarData = [
  { skill: "Problem Solving", A: 85, fullMark: 100 },
  { skill: "Conceptual", A: 72, fullMark: 100 },
  { skill: "Application", A: 78, fullMark: 100 },
  { skill: "Analysis", A: 68, fullMark: 100 },
  { skill: "Memory", A: 90, fullMark: 100 },
  { skill: "Speed", A: 75, fullMark: 100 },
];

const scoreDistribution = [
  { range: "0-20", count: 12, color: "#ef4444" },
  { range: "21-40", count: 45, color: "#f59e0b" },
  { range: "41-60", count: 156, color: "#eab308" },
  { range: "61-80", count: 289, color: "#22c55e" },
  { range: "81-100", count: 198, color: "#10b981" },
];

export default function TestAnalytics() {
  const [selectedTest, setSelectedTest] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty < 0.3) return <Badge className="bg-green-500/20 text-green-300">Easy</Badge>;
    if (difficulty < 0.6) return <Badge className="bg-yellow-500/20 text-yellow-300">Medium</Badge>;
    return <Badge className="bg-red-500/20 text-red-300">Hard</Badge>;
  };

  const getDiscriminationBadge = (discrimination: number) => {
    if (discrimination >= 0.7) return <Badge className="bg-green-500/20 text-green-300">Good</Badge>;
    if (discrimination >= 0.4) return <Badge className="bg-yellow-500/20 text-yellow-300">Fair</Badge>;
    return <Badge className="bg-red-500/20 text-red-300">Poor</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Test Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into test performance and student progress
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="math-final">Math Final Exam</SelectItem>
                <SelectItem value="physics-mid">Physics Midterm</SelectItem>
                <SelectItem value="chemistry-quiz">Chemistry Quiz</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <div className={`flex items-center gap-1 text-sm mt-2 ${
                        stat.change > 0 ? "text-green-400" : stat.change < 0 ? "text-red-400" : "text-muted-foreground"
                      }`}>
                        {stat.change > 0 ? <ArrowUp className="h-3 w-3" /> : 
                         stat.change < 0 ? <ArrowDown className="h-3 w-3" /> : 
                         <Minus className="h-3 w-3" />}
                        {Math.abs(stat.change)}% vs last period
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
            <TabsTrigger value="students">Student Performance</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trend */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1a1a2e", 
                          border: "1px solid #333",
                          borderRadius: "8px"
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgScore" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="range" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1a1a2e", 
                          border: "1px solid #333",
                          borderRadius: "8px"
                        }} 
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Subject-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectPerformance.map((subject, index) => (
                    <motion.div
                      key={subject.subject}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{subject.subject}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{subject.students} students</span>
                          <span className="font-bold" style={{ color: subject.color }}>
                            {subject.avgScore}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={subject.avgScore} 
                        className="h-2"
                        style={{ 
                          "--progress-background": subject.color 
                        } as React.CSSProperties}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Question Analysis Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Question-wise Analysis
                  </span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Difficulty Index</TableHead>
                      <TableHead>Discrimination</TableHead>
                      <TableHead className="text-right">Correct Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionAnalysis.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{q.question}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDifficultyBadge(q.difficulty)}
                            <span className="text-sm text-muted-foreground">
                              ({(q.difficulty * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDiscriminationBadge(q.discrimination)}
                            <span className="text-sm text-muted-foreground">
                              ({q.discrimination.toFixed(2)})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            (q.correct / q.attempts) > 0.7 ? "text-green-400" :
                            (q.correct / q.attempts) > 0.4 ? "text-yellow-400" :
                            "text-red-400"
                          }`}>
                            {((q.correct / q.attempts) * 100).toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground text-sm ml-1">
                            ({q.correct}/{q.attempts})
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Performance Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformers.map((student, index) => (
                      <motion.div
                        key={student.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          student.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                          student.rank === 2 ? "bg-gray-400/20 text-gray-300" :
                          student.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {student.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.tests} tests completed
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{student.score}%</p>
                          <p className="text-sm text-muted-foreground">{student.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Analysis */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Skill Analysis (Class Average)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={skillRadarData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "#888", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#888" }} />
                      <Radar
                        name="Average"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Test Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis yAxisId="left" stroke="#888" />
                    <YAxis yAxisId="right" orientation="right" stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a2e", 
                        border: "1px solid #333",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar yAxisId="left" dataKey="avgScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Score" />
                    <Bar yAxisId="right" dataKey="attempts" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Attempts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
