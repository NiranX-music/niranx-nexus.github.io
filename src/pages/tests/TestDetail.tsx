import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherCheck } from '@/hooks/useTeacherCheck';
import { useTestDetails, useTestAttempts } from '@/hooks/useTests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, FileText, Target, Users, Play, Edit, 
  Settings, BarChart3, Shield, AlertTriangle, 
  ChevronLeft, CheckCircle2, Timer, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function TestDetail() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTeacher } = useTeacherCheck();
  const { test, questions, loading } = useTestDetails(testId);
  const { attempts, startAttempt } = useTestAttempts(testId);
  
  const [isOwner, setIsOwner] = useState(false);
  const [testSettings, setTestSettings] = useState({
    duration_minutes: 60,
    tab_switch_limit: 5,
    require_fullscreen: false,
    allow_copy_paste: false,
    shuffle_questions: false,
    shuffle_options: false,
    show_result_immediately: true,
  });

  useEffect(() => {
    if (test && user) {
      setIsOwner(test.teacher_id === user.id);
      setTestSettings({
        duration_minutes: test.duration_minutes,
        tab_switch_limit: test.tab_switch_limit,
        require_fullscreen: test.require_fullscreen,
        allow_copy_paste: test.allow_copy_paste,
        shuffle_questions: test.shuffle_questions,
        shuffle_options: test.shuffle_options,
        show_result_immediately: test.show_result_immediately,
      });
    }
  }, [test, user]);

  const handleStartTest = async () => {
    if (!testId || !user) return;
    
    const attempt = await startAttempt(testId);
    if (attempt) {
      navigate(`/niranx/tests/${testId}/attempt/${attempt.id}`);
    }
  };

  const handleSaveSettings = async () => {
    if (!testId) return;

    try {
      const { error } = await supabase
        .from('tests')
        .update(testSettings)
        .eq('id', testId);

      if (error) throw error;
      toast({ title: 'Settings saved successfully!' });
    } catch (error: any) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <h1 className="text-2xl font-bold">Test not found</h1>
        <Button onClick={() => navigate('/niranx/tests')} className="mt-4">
          Back to Tests
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/niranx/tests')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
          </div>
          <p className="text-muted-foreground">{test.subject}</p>
        </div>
        {isOwner && (
          <Button variant="outline" onClick={() => navigate(`/niranx/tests/${testId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Test
          </Button>
        )}
      </div>

      {/* Test Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{test.duration_minutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{test.total_marks}</p>
              <p className="text-xs text-muted-foreground">Total Marks</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{attempts.length}</p>
              <p className="text-xs text-muted-foreground">Attempts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Protection Info */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium">Test Protection Active</p>
              <p className="text-sm text-muted-foreground">
                Tab switch limit: {test.tab_switch_limit} • {test.require_fullscreen ? 'Fullscreen required' : 'Fullscreen optional'} • {test.allow_copy_paste ? 'Copy/paste allowed' : 'Copy/paste disabled'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isOwner ? (
        // Teacher View - Settings and Analytics
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <FileText className="h-4 w-4" />
              Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Attempts</CardTitle>
                <CardDescription>View who has attempted this test</CardDescription>
              </CardHeader>
              <CardContent>
                {attempts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No attempts yet</p>
                ) : (
                  <div className="space-y-3">
                    {attempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{attempt.student_id.slice(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(attempt.started_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">{attempt.score || '-'}/{attempt.total_marks || test.total_marks}</p>
                            <p className="text-sm text-muted-foreground">
                              {attempt.percentage ? `${attempt.percentage}%` : 'In Progress'}
                            </p>
                          </div>
                          <Badge className={attempt.status === 'submitted' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                            {attempt.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Settings</CardTitle>
                <CardDescription>Configure test duration, protection, and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={testSettings.duration_minutes}
                    onChange={(e) => setTestSettings(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                    min={5}
                    max={300}
                  />
                </div>

                {/* Tab Switch Limit */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Tab Switch Limit</Label>
                      <p className="text-sm text-muted-foreground">Auto-submit after {testSettings.tab_switch_limit} tab switches</p>
                    </div>
                    <span className="font-bold text-2xl">{testSettings.tab_switch_limit}</span>
                  </div>
                  <Slider
                    value={[testSettings.tab_switch_limit]}
                    onValueChange={([value]) => setTestSettings(prev => ({ ...prev, tab_switch_limit: value }))}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {/* Toggle Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Fullscreen</Label>
                      <p className="text-sm text-muted-foreground">Force students to use fullscreen mode</p>
                    </div>
                    <Switch
                      checked={testSettings.require_fullscreen}
                      onCheckedChange={(checked) => setTestSettings(prev => ({ ...prev, require_fullscreen: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Copy/Paste</Label>
                      <p className="text-sm text-muted-foreground">Enable text copying during test</p>
                    </div>
                    <Switch
                      checked={testSettings.allow_copy_paste}
                      onCheckedChange={(checked) => setTestSettings(prev => ({ ...prev, allow_copy_paste: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Shuffle Questions</Label>
                      <p className="text-sm text-muted-foreground">Randomize question order for each student</p>
                    </div>
                    <Switch
                      checked={testSettings.shuffle_questions}
                      onCheckedChange={(checked) => setTestSettings(prev => ({ ...prev, shuffle_questions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Shuffle Options</Label>
                      <p className="text-sm text-muted-foreground">Randomize MCQ option order</p>
                    </div>
                    <Switch
                      checked={testSettings.shuffle_options}
                      onCheckedChange={(checked) => setTestSettings(prev => ({ ...prev, shuffle_options: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Results Immediately</Label>
                      <p className="text-sm text-muted-foreground">Show score after submission</p>
                    </div>
                    <Switch
                      checked={testSettings.show_result_immediately}
                      onCheckedChange={(checked) => setTestSettings(prev => ({ ...prev, show_result_immediately: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No questions added yet</p>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <div key={q.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Badge variant="secondary">{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{q.question_text}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{q.question_type.toUpperCase()}</Badge>
                                <span className="text-sm text-muted-foreground">{q.marks} marks</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Student View - Start Test
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Ready to Start?</h3>
              <p className="text-muted-foreground mt-1">
                This test has {questions.length} questions and {test.duration_minutes} minutes time limit.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Max {test.tab_switch_limit} tab switches allowed</span>
              </div>
              {test.require_fullscreen && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Fullscreen required</span>
                </div>
              )}
            </div>

            <Button size="lg" onClick={handleStartTest} className="gap-2">
              <Play className="h-5 w-5" />
              Start Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
