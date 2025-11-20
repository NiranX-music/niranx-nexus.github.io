import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  PlusCircle
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
          url: r.file_path
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
                      <Badge variant={getPriorityColor(exam.priority)}>
                        {exam.priority}
                      </Badge>
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
    </div>
  );
};

export default ExamHub;