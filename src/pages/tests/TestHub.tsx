import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherCheck } from '@/hooks/useTeacherCheck';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTests, useUserAttempts } from '@/hooks/useTests';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, Plus, Sparkles, Upload, ClipboardList, Radio, 
  CheckCircle2, BarChart3, Search, Clock, Users, Trophy,
  Target, TrendingUp, LayoutGrid, List, GraduationCap, Play, FileEdit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestHub() {
  const { user } = useAuth();
  const { isTeacher, isLoading: teacherLoading } = useTeacherCheck();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { tests, loading: testsLoading, publishedTests, myTests, liveTests } = useTests();
  const { attempts } = useUserAttempts();
  
  const initialTab = searchParams.get('tab') || (isTeacher ? 'my-tests' : 'all-tests');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

  const filteredAllTests = publishedTests.filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const filteredTeacherTests = myTests.filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Get draft tests
  const draftTests = myTests.filter(t => t.status === 'draft');
  const filteredDraftTests = draftTests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Calculate real stats
  const totalTests = isTeacher ? myTests.length : publishedTests.length;
  const completedTests = attempts.filter(a => a.status === 'submitted').length;
  const avgScore = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / attempts.length)
    : 0;

  if (teacherLoading || testsLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            {isTeacher 
              ? 'Create, manage, and analyze tests & assessments' 
              : 'Browse available tests and track your progress'}
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
                <p className="text-2xl font-bold">{totalTests}</p>
                <p className="text-xs text-muted-foreground">{isTeacher ? 'Created Tests' : 'Available Tests'}</p>
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
                <p className="text-2xl font-bold">{isTeacher ? myTests.filter(t => t.status === 'published').length : completedTests}</p>
                <p className="text-xs text-muted-foreground">{isTeacher ? 'Published' : 'Completed'}</p>
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
                <p className="text-2xl font-bold">{avgScore || '-'}%</p>
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
                <p className="text-2xl font-bold">{attempts.length}</p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="bg-muted/50 p-1 flex-wrap">
            {/* All Tests Tab - Available for everyone */}
            <TabsTrigger value="all-tests" className="gap-2 data-[state=active]:bg-background">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">All Tests</span>
            </TabsTrigger>

            {/* Teacher-only tabs */}
            {isTeacher && (
              <>
                <TabsTrigger value="my-tests" className="gap-2 data-[state=active]:bg-background">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">My Tests</span>
                </TabsTrigger>
                <TabsTrigger value="drafts" className="gap-2 data-[state=active]:bg-background">
                  <FileEdit className="h-4 w-4" />
                  <span className="hidden sm:inline">Drafts</span>
                  {draftTests.length > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                      {draftTests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="teacher-analytics" className="gap-2 data-[state=active]:bg-background">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </>
            )}

            {/* Common tabs */}
            <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-background">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Live</span>
              {liveTests.length > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {liveTests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attempted" className="gap-2 data-[state=active]:bg-background">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">My Attempts</span>
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

        {/* All Tests Tab - For Students to Browse and Attempt */}
        <TabsContent value="all-tests" className="space-y-6">
          <AnimatePresence mode="wait">
            {filteredAllTests.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No tests available</h3>
                <p className="text-muted-foreground">Check back later for new tests.</p>
              </Card>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredAllTests.map((test, index) => (
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
                            <CardDescription>{test.subject || 'General'}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{test.duration_minutes} mins</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{test.total_marks} Marks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getDifficultyColor(test.difficulty)}>
                              {test.difficulty}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Button 
                            size="sm" 
                            className="gap-2 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/niranx/tests/${test.id}`);
                            }}
                          >
                            <Play className="h-4 w-4" />
                            View Test
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
                className="space-y-3"
              >
                {filteredAllTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/niranx/tests/${test.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{test.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span>{test.subject || 'General'}</span>
                              <span>•</span>
                              <span>{test.duration_minutes} mins</span>
                              <span>•</span>
                              <span>{test.total_marks} marks</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getDifficultyColor(test.difficulty)}>
                            {test.difficulty}
                          </Badge>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                          <Button size="sm" className="gap-2">
                            <Play className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* My Tests Tab - Teacher Only */}
        {isTeacher && (
          <TabsContent value="my-tests" className="space-y-6">
            {filteredTeacherTests.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No tests created yet</h3>
                <p className="text-muted-foreground mb-4">Create your first test to get started.</p>
                <Button onClick={() => navigate('/niranx/tests/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeacherTests.map((test, index) => (
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
                            <CardDescription>{test.subject || 'General'}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{test.duration_minutes} mins</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{test.total_marks} Marks</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                          <span>Created {new Date(test.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* Drafts Tab - Teacher Only */}
        {isTeacher && (
          <TabsContent value="drafts" className="space-y-6">
            {filteredDraftTests.length === 0 ? (
              <Card className="p-8 text-center">
                <FileEdit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No draft tests</h3>
                <p className="text-muted-foreground mb-4">Create a test and save it as draft to see it here.</p>
                <Button onClick={() => navigate('/niranx/tests/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDraftTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all cursor-pointer border-dashed" onClick={() => navigate(`/niranx/tests/${test.id}`)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg line-clamp-1">{test.title}</CardTitle>
                            <CardDescription>{test.subject || 'General'}</CardDescription>
                          </div>
                          <Badge className="bg-muted text-muted-foreground">
                            Draft
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{test.duration_minutes} mins</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>{test.total_marks} Marks</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                          <span>Created {new Date(test.created_at).toLocaleDateString()}</span>
                          <Button size="sm" variant="outline" className="gap-1">
                            <FileEdit className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        )}
        {isTeacher && (
          <TabsContent value="teacher-analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Analytics</CardTitle>
                <CardDescription>View performance data for your tests</CardDescription>
              </CardHeader>
              <CardContent>
                {myTests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Create tests to see analytics</p>
                ) : (
                  <div className="space-y-4">
                    {myTests.map(test => (
                      <div key={test.id} className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/niranx/tests/${test.id}`)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{test.title}</h3>
                            <p className="text-sm text-muted-foreground">{test.subject || 'General'}</p>
                          </div>
                          <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Live Tests */}
        <TabsContent value="live" className="space-y-6">
          {liveTests.length === 0 ? (
            <Card className="p-8 text-center">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No live tests</h3>
              <p className="text-muted-foreground">There are no active tests right now.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {liveTests.map(test => (
                <Card key={test.id} className="border-red-500/50 bg-red-500/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                    </div>
                    <CardDescription>{test.subject || 'General'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full gap-2" onClick={() => navigate(`/niranx/tests/${test.id}`)}>
                      <Play className="h-4 w-4" />
                      Join Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Attempts */}
        <TabsContent value="attempted" className="space-y-6">
          {attempts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No attempts yet</h3>
              <p className="text-muted-foreground">Start attempting tests to see your history here.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {attempts.map(attempt => (
                <Card key={attempt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Test Attempt</h3>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(attempt.started_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {attempt.status === 'submitted' ? (
                        <div className="text-right">
                          <p className="text-2xl font-bold">{attempt.score}/{attempt.total_marks}</p>
                          <p className="text-sm text-muted-foreground">{attempt.percentage}%</p>
                        </div>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-500">In Progress</Badge>
                      )}
                      <Badge className={attempt.status === 'submitted' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                        {attempt.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
