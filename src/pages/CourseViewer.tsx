import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCourses, GeneratedCourse, CourseProgress, CourseModule, CourseLesson } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, ChevronLeft, ChevronRight, Check, X, 
  Play, Clock, Award, Menu, CheckCircle2, Circle
} from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getCourseProgress, updateProgress } = useCourses();
  
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        const { data, error } = await supabase
          .from('generated_courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) throw error;
        
        const parsedCourse = {
          ...data,
          modules: Array.isArray(data.modules) ? data.modules as unknown as CourseModule[] : [],
        } as GeneratedCourse;
        
        setCourse(parsedCourse);
        
        const courseProgress = await getCourseProgress(courseId);
        if (courseProgress) {
          setProgress(courseProgress);
          setCurrentModuleIndex(courseProgress.current_module);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const currentModule = course?.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  const isLessonCompleted = (moduleId: string, lessonId: string) => {
    return progress?.completed_lessons?.[moduleId]?.includes(lessonId) || false;
  };

  const isModuleCompleted = (moduleIndex: number) => {
    return progress?.completed_modules?.includes(moduleIndex) || false;
  };

  const markLessonComplete = async () => {
    if (!course || !currentModule || !currentLesson || !courseId) return;

    const newCompletedLessons = {
      ...progress?.completed_lessons || {},
      [currentModule.id]: [
        ...(progress?.completed_lessons?.[currentModule.id] || []),
        currentLesson.id,
      ].filter((v, i, a) => a.indexOf(v) === i),
    };

    await updateProgress(courseId, {
      completed_lessons: newCompletedLessons,
      current_module: currentModuleIndex,
    });

    setProgress(prev => prev ? {
      ...prev,
      completed_lessons: newCompletedLessons,
    } : null);

    // Move to next lesson or quiz
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModule.quiz) {
      setShowQuiz(true);
    } else {
      handleModuleComplete();
    }

    toast.success('Lesson completed!');
  };

  const handleModuleComplete = async () => {
    if (!courseId) return;

    const newCompletedModules = [
      ...(progress?.completed_modules || []),
      currentModuleIndex,
    ].filter((v, i, a) => a.indexOf(v) === i);

    await updateProgress(courseId, {
      completed_modules: newCompletedModules,
      current_module: currentModuleIndex + 1,
    });

    setProgress(prev => prev ? {
      ...prev,
      completed_modules: newCompletedModules,
    } : null);

    if (currentModuleIndex < (course?.modules.length || 0) - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
      setShowQuiz(false);
    } else {
      toast.success('🎉 Congratulations! You completed the course!');
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentModule?.quiz || !courseId) return;

    let correct = 0;
    currentModule.quiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct_answer) correct++;
    });

    const score = Math.round((correct / currentModule.quiz.questions.length) * 100);
    
    const newQuizScores = {
      ...progress?.quiz_scores || {},
      [currentModule.id]: score,
    };

    await updateProgress(courseId, { quiz_scores: newQuizScores });

    setProgress(prev => prev ? { ...prev, quiz_scores: newQuizScores } : null);
    setQuizSubmitted(true);

    if (score >= 70) {
      toast.success(`Quiz passed with ${score}%! 🎉`);
    } else {
      toast.error(`Score: ${score}%. You need 70% to pass.`);
    }
  };

  const retakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const calculateOverallProgress = () => {
    if (!course) return 0;
    const completedModules = progress?.completed_modules?.length || 0;
    return Math.round((completedModules / course.modules.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <Button onClick={() => navigate('/course-generator')}>Back to Courses</Button>
      </div>
    );
  }

  const Sidebar = () => (
    <div className="space-y-4">
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-2">{course.title}</h2>
        <Progress value={calculateOverallProgress()} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {calculateOverallProgress()}% complete
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-2">
          {course.modules.map((module, moduleIdx) => (
            <div key={module.id}>
              <button
                onClick={() => {
                  setCurrentModuleIndex(moduleIdx);
                  setCurrentLessonIndex(0);
                  setShowQuiz(false);
                }}
                className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentModuleIndex === moduleIdx
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {isModuleCompleted(moduleIdx) ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium line-clamp-1">
                  {moduleIdx + 1}. {module.title}
                </span>
              </button>
              
              {currentModuleIndex === moduleIdx && (
                <div className="ml-6 mt-1 space-y-1">
                  {module.lessons.map((lesson, lessonIdx) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setCurrentLessonIndex(lessonIdx);
                        setShowQuiz(false);
                      }}
                      className={`w-full text-left p-1.5 rounded text-sm flex items-center gap-2 ${
                        currentLessonIndex === lessonIdx && !showQuiz
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {isLessonCompleted(module.id, lesson.id) ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      <span className="line-clamp-1">{lesson.title}</span>
                    </button>
                  ))}
                  {module.quiz && (
                    <button
                      onClick={() => setShowQuiz(true)}
                      className={`w-full text-left p-1.5 rounded text-sm flex items-center gap-2 ${
                        showQuiz ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
                      }`}
                    >
                      <Award className="h-3 w-3" />
                      <span>Quiz</span>
                      {progress?.quiz_scores?.[module.id] !== undefined && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {progress.quiz_scores[module.id]}%
                        </Badge>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 border-r bg-card">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-4 mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <div>
              <h2 className="font-semibold line-clamp-1">{course.title}</h2>
              <p className="text-sm text-muted-foreground">
                Module {currentModuleIndex + 1} of {course.modules.length}
              </p>
            </div>
          </div>

          {showQuiz && currentModule?.quiz ? (
            /* Quiz View */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Module Quiz: {currentModule.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentModule.quiz.questions.map((question, qIdx) => (
                  <div key={question.id} className="space-y-3">
                    <p className="font-medium">
                      {qIdx + 1}. {question.question}
                    </p>
                    <RadioGroup
                      value={quizAnswers[question.id]?.toString()}
                      onValueChange={(v) => setQuizAnswers({
                        ...quizAnswers,
                        [question.id]: parseInt(v),
                      })}
                      disabled={quizSubmitted}
                    >
                      {question.options.map((option, optIdx) => (
                        <div 
                          key={optIdx} 
                          className={`flex items-center space-x-2 p-2 rounded ${
                            quizSubmitted && optIdx === question.correct_answer
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : quizSubmitted && quizAnswers[question.id] === optIdx && optIdx !== question.correct_answer
                                ? 'bg-red-100 dark:bg-red-900/20'
                                : ''
                          }`}
                        >
                          <RadioGroupItem value={optIdx.toString()} id={`${question.id}-${optIdx}`} />
                          <Label htmlFor={`${question.id}-${optIdx}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                          {quizSubmitted && optIdx === question.correct_answer && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {quizSubmitted && quizAnswers[question.id] === optIdx && optIdx !== question.correct_answer && (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    {quizSubmitted && question.explanation && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex gap-4">
                  {!quizSubmitted ? (
                    <Button 
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length !== currentModule.quiz.questions.length}
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <>
                      {(progress?.quiz_scores?.[currentModule.id] || 0) >= 70 ? (
                        <Button onClick={handleModuleComplete}>
                          Continue to Next Module
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button onClick={retakeQuiz} variant="outline">
                          Retake Quiz
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : currentLesson ? (
            /* Lesson View */
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Module {currentModuleIndex + 1}: {currentModule?.title}</span>
                </div>
                <CardTitle>{currentLesson.title}</CardTitle>
                {currentLesson.duration_minutes && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {currentLesson.duration_minutes} minutes
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                  {currentLesson.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentLessonIndex > 0) {
                        setCurrentLessonIndex(currentLessonIndex - 1);
                      } else if (currentModuleIndex > 0) {
                        setCurrentModuleIndex(currentModuleIndex - 1);
                        const prevModule = course.modules[currentModuleIndex - 1];
                        setCurrentLessonIndex(prevModule.lessons.length - 1);
                      }
                    }}
                    disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button onClick={markLessonComplete}>
                    {isLessonCompleted(currentModule?.id || '', currentLesson.id) 
                      ? 'Continue' 
                      : 'Mark Complete'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
