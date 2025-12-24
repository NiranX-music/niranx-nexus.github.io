import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AIContextualSuggestions } from '@/components/AIContextualSuggestions';
import { hashPassword } from '@/lib/passwordHashing';
import { 
  GraduationCap, 
  Upload, 
  Video, 
  FileText, 
  Calendar,
  Clock,
  Target,
  Brain,
  Play,
  Download,
  Star,
  BookOpen,
  PlusCircle,
  Trash2,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  Lightbulb,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExamResource {
  id: string;
  title: string;
  type: 'video' | 'notes' | 'practice' | 'solution';
  subject: string;
  uploadDate: string;
  size?: string;
  duration?: string;
  progress?: number;
  url?: string;
  share_token?: string;
  is_shared?: boolean;
}

interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  syllabus: string[];
  resources: ExamResource[];
  preparation: number;
  priority: 'high' | 'medium' | 'low';
}

const ExamHub = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [completedTopics, setCompletedTopics] = useState<{ [examId: string]: Set<string> }>({});
  const [studyPlan, setStudyPlan] = useState<Array<{ exam: string; topic: string; priority: string; daysLeft: number }>>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ExamResource | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareExpiration, setShareExpiration] = useState("7");
  const [sharePermission, setSharePermission] = useState<"view-only" | "download-allowed">("view-only");
  const [sharePassword, setSharePassword] = useState("");
  const { toast } = useToast();

  // New exam form state
  const [newExam, setNewExam] = useState({
    name: '',
    subject: '',
    date: '',
    time: '',
    duration: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    syllabus: ['']
  });

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user]);

  useEffect(() => {
    if (exams.length > 0) {
      generateStudyPlan();
    }
  }, [exams, completedTopics]);

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', user?.id)
      .order('exam_date', { ascending: true });

    if (data && data.length > 0) {
      const examIds = data.map(e => e.id);
      
      // Fetch resources for all exams
      const { data: resourcesData } = await supabase
        .from('exam_resources')
        .select('*')
        .in('exam_id', examIds);

      const formattedExams: Exam[] = data.map(exam => ({
        id: exam.id,
        name: exam.name,
        subject: exam.subject,
        date: exam.exam_date,
        time: exam.exam_time,
        duration: exam.duration,
        syllabus: exam.syllabus || [],
        resources: resourcesData?.filter(r => r.exam_id === exam.id).map(r => ({
          id: r.id,
          title: r.title,
          type: r.type as 'video' | 'notes' | 'practice' | 'solution',
          subject: exam.subject,
          uploadDate: new Date(r.upload_date).toISOString().split('T')[0],
          size: r.file_size ? `${(r.file_size / 1024 / 1024).toFixed(1)} MB` : undefined,
          duration: r.duration,
          url: r.file_path,
          share_token: r.share_token,
          is_shared: r.is_shared
        })) || [],
        preparation: exam.preparation_progress || 0,
        priority: (exam.priority as 'high' | 'medium' | 'low') || 'medium'
      }));
      
      setExams(formattedExams);
      if (!selectedExam && formattedExams.length > 0) {
        setSelectedExam(formattedExams[0].id);
      }
    }
  };

  const createExam = async () => {
    if (!newExam.name || !newExam.subject || !newExam.date || !newExam.time) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('exams')
      .insert({
        user_id: user?.id,
        name: newExam.name,
        subject: newExam.subject,
        exam_date: newExam.date,
        exam_time: newExam.time,
        duration: newExam.duration || '2 hours',
        priority: newExam.priority,
        syllabus: newExam.syllabus.filter(s => s.trim() !== ''),
        preparation_progress: 0
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exam Created! 📚",
      description: `${newExam.name} has been added to your exam schedule`
    });

    setIsCreateDialogOpen(false);
    setNewExam({
      name: '',
      subject: '',
      date: '',
      time: '',
      duration: '',
      priority: 'medium',
      syllabus: ['']
    });
    fetchExams();
  };

  const toggleTopicCompletion = async (examId: string, topic: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const currentCompleted = completedTopics[examId] || new Set();
    const newCompleted = new Set(currentCompleted);
    
    if (newCompleted.has(topic)) {
      newCompleted.delete(topic);
    } else {
      newCompleted.add(topic);
    }
    
    setCompletedTopics({ ...completedTopics, [examId]: newCompleted });
    
    // Calculate new progress percentage
    const progress = Math.round((newCompleted.size / exam.syllabus.length) * 100);
    
    // Update in database
    const { error } = await supabase
      .from('exams')
      .update({ preparation_progress: progress })
      .eq('id', examId);

    if (!error) {
      setExams(exams.map(e => e.id === examId ? { ...e, preparation: progress } : e));
      toast({
        title: "Progress Updated! 📈",
        description: `Preparation progress: ${progress}%`
      });
    }
  };

  const deleteExam = async (examId: string) => {
    try {
      // Get all resources for this exam
      const { data: resources } = await supabase
        .from('exam_resources')
        .select('file_path')
        .eq('exam_id', examId);

      // Delete files from storage
      if (resources && resources.length > 0) {
        for (const resource of resources) {
          const fileName = resource.file_path.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('exam-resources')
              .remove([`${user?.id}/${examId}/${fileName}`]);
          }
        }
      }

      // Delete resources from database
      await supabase
        .from('exam_resources')
        .delete()
        .eq('exam_id', examId);

      // Delete exam
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;

      toast({
        title: "Exam Deleted! 🗑️",
        description: "Exam and all associated resources have been removed"
      });

      fetchExams();
      if (selectedExam === examId) {
        setSelectedExam('');
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateStudyPlan = () => {
    const today = new Date();
    const plan: Array<{ exam: string; topic: string; priority: string; daysLeft: number }> = [];

    exams.forEach(exam => {
      const examDate = new Date(exam.date);
      const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0 && exam.preparation < 100) {
        const completed = completedTopics[exam.id] || new Set();
        const incompleteTopic = exam.syllabus.find(topic => !completed.has(topic));
        
        if (incompleteTopic) {
          let priority = 'medium';
          if (daysLeft <= 7) priority = 'high';
          else if (daysLeft > 30) priority = 'low';
          
          // Adjust priority based on exam priority
          if (exam.priority === 'high' && priority === 'medium') priority = 'high';
          
          plan.push({
            exam: exam.name,
            topic: incompleteTopic,
            priority,
            daysLeft
          });
        }
      }
    });

    // Sort by priority and days left
    plan.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (priorityWeight[a.priority as keyof typeof priorityWeight] !== priorityWeight[b.priority as keyof typeof priorityWeight]) {
        return priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight];
      }
      return a.daysLeft - b.daysLeft;
    });

    setStudyPlan(plan.slice(0, 5));
  };

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const days = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getCountdownColor = (days: number) => {
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-orange-500';
    if (days <= 14) return 'text-yellow-500';
    return 'text-green-500';
  };

  const generateShareLink = async (resource: ExamResource) => {
    try {
      // Generate share token using database function
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_share_token');

      if (tokenError) throw tokenError;

      // Calculate expiration date
      const expirationDate = shareExpiration !== "never" 
        ? new Date(Date.now() + parseInt(shareExpiration) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Update resource with share token and settings
      const { error: updateError } = await supabase
        .from('exam_resources')
        .update({
          share_token: tokenData,
          is_shared: true,
          shared_until: expirationDate,
          permission_level: sharePermission,
          password_hash: sharePassword ? await hashPassword(sharePassword) : null,
        })
        .eq('id', resource.id);

      if (updateError) throw updateError;

      const link = `${window.location.origin}/shared/resource/${tokenData}`;
      setShareLink(link);
      setSelectedResource({ ...resource, share_token: tokenData, is_shared: true });
      setShareDialogOpen(true);

      // Refresh exams to update share status
      await fetchExams();

      toast({
        title: "Share link generated! 🔗",
        description: "Resource can now be shared with others",
      });
    } catch (error: any) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate share link",
        variant: "destructive",
      });
    }
  };

  const toggleSharing = async (resource: ExamResource, enable: boolean) => {
    try {
      const { error } = await supabase
        .from('exam_resources')
        .update({ is_shared: enable })
        .eq('id', resource.id);

      if (error) throw error;

      toast({
        title: enable ? "Sharing enabled ✅" : "Sharing disabled 🔒",
        description: enable 
          ? "Resource is now accessible via share link" 
          : "Share link has been deactivated",
      });

      await fetchExams();
    } catch (error: any) {
      console.error('Error toggling sharing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update sharing settings",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied! 📋",
      description: "Share link copied to clipboard",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'notes') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${selectedExam}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('exam-resources')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exam-resources')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data: resourceData, error: dbError } = await supabase
        .from('exam_resources')
        .insert({
          exam_id: selectedExam,
          user_id: user?.id,
          title: file.name,
          type: type,
          file_path: publicUrl,
          file_size: file.size,
          duration: type === 'video' ? '30 min' : undefined
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "File Uploaded! 📁",
        description: `${file.name} has been added to your exam resources`
      });

      fetchExams();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const getCurrentExam = () => {
    return exams.find(exam => exam.id === selectedExam);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'notes': return <FileText className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'solution': return <Brain className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500';
      case 'notes': return 'bg-blue-500';
      case 'practice': return 'bg-green-500';
      case 'solution': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const currentExam = getCurrentExam();

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Exam Hub
          </h1>
          <Brain className="w-6 h-6 text-accent animate-pulse" />
        </div>
        <p className="text-muted-foreground">
          Organize videos, notes & practice materials by exam 📚
        </p>
      </div>

      {/* Study Plan Generator & Calendar View */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Study Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI Study Plan
            </CardTitle>
            <CardDescription>
              Prioritized topics based on exam dates and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studyPlan.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Complete your profile to get personalized study suggestions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studyPlan.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                        {item.priority} priority
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.daysLeft} days left
                      </span>
                    </div>
                    <div className="font-medium">{item.topic}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {item.exam}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Exam Calendar
            </CardTitle>
            <CardDescription>
              Countdown to upcoming exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No exams scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => {
                  const daysLeft = getDaysUntilExam(exam.date);
                  return (
                    <div key={exam.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{exam.name}</div>
                        <Badge variant="outline">{exam.subject}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{exam.date}</span>
                        <span className={`font-bold ${getCountdownColor(daysLeft)}`}>
                          {daysLeft > 0 ? `${daysLeft} days` : daysLeft === 0 ? 'TODAY!' : 'Past'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>Preparation</span>
                          <span>{exam.preparation}%</span>
                        </div>
                        <Progress value={exam.preparation} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Exams
            </span>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Add Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Exam</DialogTitle>
                  <DialogDescription>
                    Add a new exam to your schedule with syllabus topics
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Exam Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Mathematics Final"
                        value={newExam.name}
                        onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={newExam.subject}
                        onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newExam.date}
                        onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newExam.time}
                        onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 3 hours"
                        value={newExam.duration}
                        onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      className="w-full p-2 rounded-md border border-input bg-background"
                      value={newExam.priority}
                      onChange={(e) => setNewExam({ ...newExam, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Syllabus Topics</Label>
                    {newExam.syllabus.map((topic, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Topic ${index + 1}`}
                          value={topic}
                          onChange={(e) => {
                            const updated = [...newExam.syllabus];
                            updated[index] = e.target.value;
                            setNewExam({ ...newExam, syllabus: updated });
                          }}
                        />
                        {index === newExam.syllabus.length - 1 && (
                          <Button
                            type="button"
                            size="icon"
                            onClick={() => setNewExam({ ...newExam, syllabus: [...newExam.syllabus, ''] })}
                          >
                            <PlusCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button onClick={createExam} className="w-full">
                    Create Exam
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <Card 
                key={exam.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedExam === exam.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedExam(exam.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{exam.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(exam.priority)}>
                          {exam.priority}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{exam.name}" and all associated resources including uploaded files. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteExam(exam.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {exam.date} at {exam.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Duration: {exam.duration}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Preparation</span>
                        <span>{exam.preparation}%</span>
                      </div>
                      <Progress value={exam.preparation} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span>{exam.resources.length} resources</span>
                      <Badge variant="outline" className="text-xs">
                        {exam.subject}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Exam Details */}
      {currentExam && (
        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Study Resources - {currentExam.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentExam.resources.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No resources uploaded yet</p>
                      <p className="text-sm">Switch to Upload tab to add videos and notes</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {currentExam.resources.map((resource) => (
                        <Card key={resource.id} className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${getTypeColor(resource.type)} text-white`}>
                              {getResourceIcon(resource.type)}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{resource.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>Uploaded: {resource.uploadDate}</span>
                                {resource.size && <span>Size: {resource.size}</span>}
                                {resource.duration && <span>Duration: {resource.duration}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{resource.type}</Badge>
                              <Button
                                size="sm"
                                variant={resource.is_shared ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (resource.is_shared && resource.share_token) {
                                    const link = `${window.location.origin}/shared/resource/${resource.share_token}`;
                                    setShareLink(link);
                                    setSelectedResource(resource);
                                    setShareDialogOpen(true);
                                  } else {
                                    generateShareLink(resource);
                                  }
                                }}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                {resource.is_shared ? 'Shared' : 'Share'}
                              </Button>
                              {resource.type === 'video' ? (
                                <Button size="sm" variant="outline">
                                  <Play className="w-4 h-4 mr-2" />
                                  Play
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  Open
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Syllabus Tab */}
          <TabsContent value="syllabus">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Syllabus Coverage
                  </span>
                  <div className="text-sm text-muted-foreground">
                    {completedTopics[currentExam.id]?.size || 0} / {currentExam.syllabus.length} completed
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentExam.syllabus.map((topic, index) => {
                    const isCompleted = completedTopics[currentExam.id]?.has(topic);
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                          isCompleted ? 'bg-primary/5 border-primary/20' : 'hover:bg-accent/50'
                        }`}
                      >
                        <Checkbox
                          id={`topic-${index}`}
                          checked={isCompleted}
                          onCheckedChange={() => toggleTopicCompletion(currentExam.id, topic)}
                        />
                        <label
                          htmlFor={`topic-${index}`}
                          className={`flex-1 cursor-pointer flex items-center gap-3 ${
                            isCompleted ? 'line-through opacity-60' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{topic}</span>
                        </label>
                        {isCompleted && (
                          <Badge variant="default" className="bg-green-500">
                            ✓ Done
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">{currentExam.preparation}%</span>
                  </div>
                  <Progress value={currentExam.preparation} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Video Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Upload Videos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload Allen lectures, recorded classes, or video solutions
                    </p>
                    <Label htmlFor="video-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={uploadingFile}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingFile ? 'Uploading...' : 'Choose Video File'}
                      </Button>
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'video')}
                      />
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: MP4, AVI, MOV (Max 500MB)
                  </p>
                </CardContent>
              </Card>

              {/* Notes Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Upload Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload PDFs, handwritten notes, or study materials
                    </p>
                    <Label htmlFor="notes-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={uploadingFile}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingFile ? 'Uploading...' : 'Choose PDF/Image'}
                      </Button>
                      <Input
                        id="notes-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'notes')}
                      />
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, JPG, PNG (Max 50MB)
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Share Resource Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Resource 🔗</DialogTitle>
            <DialogDescription>
              Configure sharing settings for this resource.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiration">Link Expiration</Label>
              <select
                id="expiration"
                value={shareExpiration}
                onChange={(e) => setShareExpiration(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="never">Never expires</option>
              </select>
            </div>

            {/* Permission Level */}
            <div className="space-y-2">
              <Label htmlFor="permission">Permission Level</Label>
              <select
                id="permission"
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value as "view-only" | "download-allowed")}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="view-only">View Only</option>
                <option value="download-allowed">Download Allowed</option>
              </select>
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <Label htmlFor="password">Password Protection (Optional)</Label>
              <Input
                id="password"
                type="password"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                placeholder="Leave empty for no password"
              />
            </div>

            {/* Share Link */}
            {shareLink && (
              <div className="flex items-center space-x-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={copyShareLink}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {/* Sharing Status */}
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedResource?.is_shared ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {selectedResource?.is_shared ? 'Sharing enabled' : 'Sharing disabled'}
                </span>
              </div>
              <Button
                variant={selectedResource?.is_shared ? "destructive" : "default"}
                size="sm"
                onClick={() => {
                  if (selectedResource) {
                    if (!selectedResource.is_shared) {
                      generateShareLink(selectedResource);
                    } else {
                      toggleSharing(selectedResource, false);
                      setShareDialogOpen(false);
                    }
                  }
                }}
              >
                {selectedResource?.is_shared ? 'Disable sharing' : 'Generate link'}
              </Button>
            </div>

            {selectedResource?.is_shared && (
              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <p>💡 <strong>Tip:</strong> This link will remain active until you disable sharing or it expires. Share it with your study group or classmates!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AIContextualSuggestions 
        context="exam preparation and study resources" 
        title="Study Recommendations"
        description="AI-powered tips for effective exam preparation"
      />
    </div>
  );
};

export default ExamHub;