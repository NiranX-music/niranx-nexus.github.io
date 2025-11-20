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
  const { toast } = useToast();

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
      const formattedExams: Exam[] = data.map(exam => ({
        id: exam.id,
        name: exam.name,
        subject: exam.subject,
        date: exam.exam_date,
        time: exam.exam_time,
        duration: exam.duration,
        syllabus: exam.syllabus || [],
        resources: [],
        preparation: exam.preparation_progress || 0,
        priority: (exam.priority as 'high' | 'medium' | 'low') || 'medium'
      }));
      setExams(formattedExams);
      if (!selectedExam) {
        setSelectedExam(formattedExams[0].id);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'notes') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newResource: ExamResource = {
        id: Date.now().toString(),
        title: file.name,
        type: type,
        subject: getCurrentExam()?.subject || 'General',
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        duration: type === 'video' ? '30 min' : undefined
      };

      setExams(prev => prev.map(exam => 
        exam.id === selectedExam 
          ? { ...exam, resources: [...exam.resources, newResource] }
          : exam
      ));

      setUploadingFile(false);
      toast({
        title: "File Uploaded! 📁",
        description: `${file.name} has been added to your exam resources`
      });
    }, 2000);
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
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Exam
            </Button>
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
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Syllabus Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentExam.syllabus.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {Math.floor(Math.random() * 30) + 70}% covered
                        </Badge>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  ))}
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