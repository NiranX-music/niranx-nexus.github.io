import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Clock, Flag, ChevronLeft, ChevronRight, Send, 
  Maximize, Minimize, AlertTriangle, CheckCircle2,
  Circle, Bookmark, SkipForward, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  type: 'mcq' | 'numerical' | 'short' | 'long';
  options?: string[];
  marks: number;
}

// Mock test data
const mockTest = {
  id: '1',
  title: 'Mathematics Mid-Term Exam',
  subject: 'Mathematics',
  duration: 120,
  totalMarks: 100,
  questions: [
    {
      id: '1',
      question: 'What is the value of x in the equation 2x + 5 = 15?',
      type: 'mcq' as const,
      options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 4'],
      marks: 4,
    },
    {
      id: '2',
      question: 'Calculate the derivative of f(x) = x³ + 2x² - 5x + 3',
      type: 'mcq' as const,
      options: ['3x² + 4x - 5', '3x² + 2x - 5', 'x² + 4x - 5', '3x² + 4x + 5'],
      marks: 4,
    },
    {
      id: '3',
      question: 'Find the value of sin(30°) + cos(60°)',
      type: 'numerical' as const,
      marks: 4,
    },
    {
      id: '4',
      question: 'Solve the quadratic equation: x² - 5x + 6 = 0. Show all steps.',
      type: 'short' as const,
      marks: 6,
    },
    {
      id: '5',
      question: 'Explain the concept of limits in calculus with examples.',
      type: 'long' as const,
      marks: 10,
    },
  ],
};

export default function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(mockTest.duration * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPalette, setShowPalette] = useState(true);

  const currentQuestion = mockTest.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / mockTest.questions.length) * 100;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Autosave
  useEffect(() => {
    const autoSave = setInterval(() => {
      localStorage.setItem(`test_${testId}_answers`, JSON.stringify(answers));
      localStorage.setItem(`test_${testId}_marked`, JSON.stringify([...markedForReview]));
    }, 30000);

    return () => clearInterval(autoSave);
  }, [answers, markedForReview, testId]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleMarkForReview = (questionId: string) => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(questionId)) {
      newMarked.delete(questionId);
    } else {
      newMarked.add(questionId);
    }
    setMarkedForReview(newMarked);
  };

  const handleSubmit = () => {
    localStorage.removeItem(`test_${testId}_answers`);
    localStorage.removeItem(`test_${testId}_marked`);
    toast({ title: 'Test submitted successfully!' });
    navigate(`/niranx/tests/${testId}/results`);
  };

  const getQuestionStatus = (qId: string) => {
    if (markedForReview.has(qId)) return 'review';
    if (answers[qId]) return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">{mockTest.title}</h1>
              <p className="text-sm text-muted-foreground">{mockTest.subject}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${
                timeRemaining < 300 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-muted'
              }`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
              
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="space-y-2">
                        <p>Are you sure you want to submit? This action cannot be undone.</p>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <div className="p-3 rounded-lg bg-green-500/10 text-center">
                            <p className="text-2xl font-bold text-green-600">{answeredCount}</p>
                            <p className="text-xs text-muted-foreground">Answered</p>
                          </div>
                          <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{markedForReview.size}</p>
                            <p className="text-xs text-muted-foreground">Marked</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted text-center">
                            <p className="text-2xl font-bold">{mockTest.questions.length - answeredCount}</p>
                            <p className="text-xs text-muted-foreground">Unanswered</p>
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Test</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Submit Test</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{answeredCount}/{mockTest.questions.length} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          Q{currentQuestionIndex + 1}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{currentQuestion.type.toUpperCase()}</Badge>
                          <Badge variant="outline">{currentQuestion.marks} marks</Badge>
                        </div>
                      </div>
                      <Button
                        variant={markedForReview.has(currentQuestion.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleMarkForReview(currentQuestion.id)}
                        className="gap-2"
                      >
                        <Bookmark className={`h-4 w-4 ${markedForReview.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                        {markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-lg leading-relaxed">
                      {currentQuestion.question}
                    </div>

                    {/* Answer Input based on question type */}
                    {currentQuestion.type === 'mcq' && currentQuestion.options && (
                      <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={(v) => handleAnswer(currentQuestion.id, v)}
                        className="space-y-3"
                      >
                        {currentQuestion.options.map((option, i) => (
                          <div
                            key={i}
                            className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                              answers[currentQuestion.id] === String.fromCharCode(65 + i)
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => handleAnswer(currentQuestion.id, String.fromCharCode(65 + i))}
                          >
                            <RadioGroupItem value={String.fromCharCode(65 + i)} id={`option-${i}`} />
                            <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {currentQuestion.type === 'numerical' && (
                      <div className="space-y-2">
                        <Label>Enter your answer:</Label>
                        <Input
                          type="number"
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                          placeholder="Enter numerical value"
                          className="text-lg"
                        />
                      </div>
                    )}

                    {currentQuestion.type === 'short' && (
                      <div className="space-y-2">
                        <Label>Your answer:</Label>
                        <Textarea
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                          placeholder="Write your answer here..."
                          rows={4}
                        />
                      </div>
                    )}

                    {currentQuestion.type === 'long' && (
                      <div className="space-y-2">
                        <Label>Your answer:</Label>
                        <Textarea
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                          placeholder="Write your detailed answer here..."
                          rows={8}
                        />
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setCurrentQuestionIndex(Math.min(mockTest.questions.length - 1, currentQuestionIndex + 1));
                          }}
                          className="gap-2"
                        >
                          <SkipForward className="h-4 w-4" />
                          Skip
                        </Button>
                      </div>

                      <Button
                        onClick={() => setCurrentQuestionIndex(Math.min(mockTest.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === mockTest.questions.length - 1}
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Question Palette</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowPalette(!showPalette)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              {showPalette && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {mockTest.questions.map((q, i) => (
                      <Button
                        key={q.id}
                        variant="outline"
                        size="sm"
                        className={`h-10 w-10 p-0 ${getStatusColor(getQuestionStatus(q.id))} ${
                          i === currentQuestionIndex ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setCurrentQuestionIndex(i)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <span>Answered ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded bg-yellow-500" />
                      <span>Marked for Review ({markedForReview.size})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded bg-muted border" />
                      <span>Not Answered ({mockTest.questions.length - answeredCount})</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
