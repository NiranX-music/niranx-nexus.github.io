import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, Plus, Sparkles, Upload, ClipboardList, Radio, 
  CheckCircle2, BarChart3, Search, Clock, Users, Trophy,
  Brain, Target, Zap, BookOpen, Calendar, TrendingUp,
  Play, Eye, Edit, Trash2, Copy, Share2, MoreVertical,
  Filter, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Mock data for tests
const mockTests = [
  {
    id: '1',
    title: 'Mathematics Mid-Term Exam',
    subject: 'Mathematics',
    questions: 50,
    duration: 120,
    totalMarks: 100,
    difficulty: 'medium',
    status: 'published',
    attempts: 156,
    avgScore: 72,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Physics Chapter 5 Quiz',
    subject: 'Physics',
    questions: 25,
    duration: 45,
    totalMarks: 50,
    difficulty: 'easy',
    status: 'draft',
    attempts: 0,
    avgScore: 0,
    createdAt: '2024-01-18',
  },
  {
    id: '3',
    title: 'Chemistry Final Exam',
    subject: 'Chemistry',
    questions: 75,
    duration: 180,
    totalMarks: 150,
    difficulty: 'hard',
    status: 'scheduled',
    attempts: 0,
    avgScore: 0,
    createdAt: '2024-01-20',
    scheduledFor: '2024-02-01',
  },
];

const mockLiveTests = [
  {
    id: '1',
    title: 'Weekly Math Challenge',
    subject: 'Mathematics',
    participants: 45,
    timeRemaining: '23:45',
    status: 'live',
  },
];

const mockAttemptedTests = [
  {
    id: '1',
    title: 'Physics Practice Test',
    subject: 'Physics',
    score: 85,
    totalMarks: 100,
    rank: 12,
    totalParticipants: 156,
    attemptedAt: '2024-01-16',
  },
  {
    id: '2',
    title: 'Chemistry Quiz',
    subject: 'Chemistry',
    score: 42,
    totalMarks: 50,
    rank: 5,
    totalParticipants: 89,
    attemptedAt: '2024-01-14',
  },
];

export default function TestHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // For demo, assume teacher role
  const isTeacher = true;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'hard': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-500';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'scheduled': return 'bg-blue-500/10 text-blue-500';
      case 'live': return 'bg-red-500/10 text-red-500 animate-pulse';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            Test Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and analyze tests & assessments
          </p>
        </div>
        
        {isTeacher && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/niranx/tests/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Test
            </Button>
            <Button variant="outline" onClick={() => navigate('/niranx/tests/ai-generate')} className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Button>
            <Button variant="outline" onClick={() => navigate('/niranx/tests/upload')} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Test
            </Button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 border-none bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 border-none bg-gradient-to-br from-green-500/10 to-green-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 border-none bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">#5</p>
                <p className="text-xs text-muted-foreground">Best Rank</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="bg-muted/50 p-1">
            {isTeacher && (
              <>
                <TabsTrigger value="create" className="gap-2 data-[state=active]:bg-background">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </TabsTrigger>
                <TabsTrigger value="ai-generate" className="gap-2 data-[state=active]:bg-background">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Generate</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-background">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="my-tests" className="gap-2 data-[state=active]:bg-background">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">My Tests</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-background">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Live</span>
              {mockLiveTests.length > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {mockLiveTests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attempted" className="gap-2 data-[state=active]:bg-background">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Attempted</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Create Test Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card className="p-8 text-center border-dashed border-2">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Plus className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Create New Test</h3>
                <p className="text-muted-foreground mt-1">
                  Build a custom test with our powerful test builder
                </p>
              </div>
              <Button size="lg" onClick={() => navigate('/niranx/tests/create')}>
                Start Building
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* AI Generate Tab */}
        <TabsContent value="ai-generate" className="space-y-6">
          <Card className="p-8 text-center border-dashed border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Sparkles className="h-12 w-12 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">AI Test Generator</h3>
                <p className="text-muted-foreground mt-1">
                  Generate tests instantly using AI based on your parameters
                </p>
              </div>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate('/niranx/tests/ai-generate')}>
                <Brain className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="p-8 text-center border-dashed border-2">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Upload Test</h3>
                <p className="text-muted-foreground mt-1">
                  Upload PDF, DOCX, or CSV files - AI will auto-parse questions
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">DOCX</Badge>
                <Badge variant="outline">CSV</Badge>
              </div>
              <Button size="lg" variant="outline" onClick={() => navigate('/niranx/tests/upload')}>
                Upload File
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* My Tests Tab */}
        <TabsContent value="my-tests" className="space-y-6">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {mockTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/niranx/tests/${test.id}`)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg line-clamp-1">{test.title}</CardTitle>
                            <CardDescription>{test.subject}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{test.questions} Questions</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{test.duration} mins</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{test.totalMarks} Marks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getDifficultyColor(test.difficulty)}>
                              {test.difficulty}
                            </Badge>
                          </div>
                        </div>
                        
                        {test.status === 'published' && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{test.attempts} attempts</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">{test.avgScore}% avg</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1 gap-1">
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button size="sm" className="flex-1 gap-1">
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <div className="divide-y">
                    {mockTests.map((test, index) => (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/niranx/tests/${test.id}`)}
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <FileText className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{test.title}</span>
                            <Badge className={getStatusColor(test.status)}>
                              {test.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{test.subject}</span>
                            <span>{test.questions} Q</span>
                            <span>{test.duration}m</span>
                            <Badge variant="outline" className={getDifficultyColor(test.difficulty)}>
                              {test.difficulty}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {test.status === 'published' && (
                            <div className="text-right text-sm mr-4">
                              <p className="font-medium">{test.attempts} attempts</p>
                              <p className="text-muted-foreground">{test.avgScore}% avg</p>
                            </div>
                          )}
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Live Tests Tab */}
        <TabsContent value="live" className="space-y-6">
          {mockLiveTests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {mockLiveTests.map((test) => (
                <Card key={test.id} className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                          {test.title}
                        </CardTitle>
                        <CardDescription>{test.subject}</CardDescription>
                      </div>
                      <Badge variant="destructive">LIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{test.participants} participating</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-mono">
                        <Clock className="h-4 w-4" />
                        <span>{test.timeRemaining}</span>
                      </div>
                    </div>
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Join Test
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Live Tests</h3>
              <p className="text-muted-foreground">There are no live tests at the moment</p>
            </Card>
          )}
        </TabsContent>

        {/* Attempted Tests Tab */}
        <TabsContent value="attempted" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockAttemptedTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <CardDescription>{test.subject}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-primary">
                        {test.score}/{test.totalMarks}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round((test.score / test.totalMarks) * 100)}% Score
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>Rank #{test.rank} of {test.totalParticipants}</span>
                      </div>
                      <span className="text-muted-foreground">{test.attemptedAt}</span>
                    </div>
                    
                    <Button variant="outline" className="w-full gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Analysis
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Performance chart coming soon</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Subject-wise Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Mathematics', 'Physics', 'Chemistry'].map((subject) => (
                    <div key={subject} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{subject}</span>
                        <span className="font-medium">{Math.floor(Math.random() * 30 + 70)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-green-500/10">
                    <h4 className="font-medium text-green-600">Strengths</h4>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>• Algebra & Equations</li>
                      <li>• Organic Chemistry</li>
                      <li>• Mechanics</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10">
                    <h4 className="font-medium text-red-600">Areas to Improve</h4>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>• Calculus</li>
                      <li>• Electrochemistry</li>
                      <li>• Optics</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10">
                    <h4 className="font-medium text-blue-600">Recommendations</h4>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>• Practice more calculus</li>
                      <li>• Review optics concepts</li>
                      <li>• Take more mock tests</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
