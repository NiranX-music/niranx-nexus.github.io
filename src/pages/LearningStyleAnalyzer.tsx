import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, ChevronLeft, Sparkles, Eye, Ear, BookOpen, Hand, Loader2, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';

interface Question {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    style: 'visual' | 'auditory' | 'readWrite' | 'kinesthetic';
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'When learning something new, I prefer to:',
    options: [
      { value: 'a', label: 'Watch a demonstration or video', style: 'visual' },
      { value: 'b', label: 'Listen to an explanation or podcast', style: 'auditory' },
      { value: 'c', label: 'Read about it in a book or article', style: 'readWrite' },
      { value: 'd', label: 'Try it out myself hands-on', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q2',
    text: 'When I need to remember something important, I usually:',
    options: [
      { value: 'a', label: 'Visualize it or create a mental image', style: 'visual' },
      { value: 'b', label: 'Repeat it out loud or create a rhyme', style: 'auditory' },
      { value: 'c', label: 'Write it down multiple times', style: 'readWrite' },
      { value: 'd', label: 'Associate it with a physical action', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q3',
    text: 'In a classroom, I learn best when the teacher:',
    options: [
      { value: 'a', label: 'Uses diagrams, charts, and visual aids', style: 'visual' },
      { value: 'b', label: 'Explains things verbally with stories', style: 'auditory' },
      { value: 'c', label: 'Provides handouts and reading materials', style: 'readWrite' },
      { value: 'd', label: 'Includes experiments and activities', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q4',
    text: 'When giving directions to someone, I would:',
    options: [
      { value: 'a', label: 'Draw a map or show pictures', style: 'visual' },
      { value: 'b', label: 'Tell them verbally step by step', style: 'auditory' },
      { value: 'c', label: 'Write out the directions', style: 'readWrite' },
      { value: 'd', label: 'Walk them through it personally', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q5',
    text: 'When studying for an exam, I prefer to:',
    options: [
      { value: 'a', label: 'Review diagrams and color-coded notes', style: 'visual' },
      { value: 'b', label: 'Discuss topics with study partners', style: 'auditory' },
      { value: 'c', label: 'Read and rewrite my notes', style: 'readWrite' },
      { value: 'd', label: 'Practice problems and simulations', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q6',
    text: 'I find it easier to understand when:',
    options: [
      { value: 'a', label: 'I can see patterns and connections', style: 'visual' },
      { value: 'b', label: 'Someone explains it to me', style: 'auditory' },
      { value: 'c', label: 'I can read detailed explanations', style: 'readWrite' },
      { value: 'd', label: 'I can physically manipulate things', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q7',
    text: 'When I am anxious, I tend to:',
    options: [
      { value: 'a', label: 'Visualize calming scenes', style: 'visual' },
      { value: 'b', label: 'Talk to myself or listen to music', style: 'auditory' },
      { value: 'c', label: 'Write in a journal', style: 'readWrite' },
      { value: 'd', label: 'Exercise or move around', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q8',
    text: 'When assembling something new, I usually:',
    options: [
      { value: 'a', label: 'Look at the diagrams and pictures', style: 'visual' },
      { value: 'b', label: 'Ask someone to explain the steps', style: 'auditory' },
      { value: 'c', label: 'Read the written instructions carefully', style: 'readWrite' },
      { value: 'd', label: 'Start building and figure it out', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q9',
    text: 'I remember people best by their:',
    options: [
      { value: 'a', label: 'Face and appearance', style: 'visual' },
      { value: 'b', label: 'Name and voice', style: 'auditory' },
      { value: 'c', label: 'Written introduction or bio', style: 'readWrite' },
      { value: 'd', label: 'Handshake and interactions', style: 'kinesthetic' },
    ],
  },
  {
    id: 'q10',
    text: 'When solving a complex problem, I:',
    options: [
      { value: 'a', label: 'Draw diagrams to visualize it', style: 'visual' },
      { value: 'b', label: 'Talk through it out loud', style: 'auditory' },
      { value: 'c', label: 'List out all the details', style: 'readWrite' },
      { value: 'd', label: 'Build models or prototypes', style: 'kinesthetic' },
    ],
  },
];

interface StyleResults {
  styles: {
    visual: number;
    auditory: number;
    readWrite: number;
    kinesthetic: number;
  };
  primaryStyle: string;
  secondaryStyle: string;
  summary: string;
  recommendations: { title: string; description: string; style: string }[];
  subjectTips: {
    math: string;
    science: string;
    languages: string;
    history: string;
    arts: string;
  };
}

const STYLE_INFO = {
  visual: { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Visual' },
  auditory: { icon: Ear, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Auditory' },
  readWrite: { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Read/Write' },
  kinesthetic: { icon: Hand, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Kinesthetic' },
};

export default function LearningStyleAnalyzer() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<StyleResults | null>(null);
  const { provider, model, setProvider, setModel } = useAIProvider('learning-style');

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentQuestion].id]: value }));
  };

  const goNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const analyzeResults = async () => {
    setIsAnalyzing(true);

    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => {
        const question = QUESTIONS.find(q => q.id === questionId);
        const option = question?.options.find(o => o.value === answer);
        return {
          questionId,
          answer: option?.label || answer,
        };
      });

      const { data, error } = await supabase.functions.invoke('analyze-learning-style', {
        body: { responses, provider, model },
      });

      if (error) throw error;

      setResults(data);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('learning_style_assessments').insert({
          user_id: user.id,
          responses: answers,
          style_results: data.styles,
          primary_style: data.primaryStyle,
          secondary_style: data.secondaryStyle,
          recommendations: data.recommendations,
        });
      }

      toast.success('Analysis complete!');
    } catch (error: any) {
      console.error('Analysis error:', error);
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message?.includes('402') || error.message?.includes('Payment')) {
        toast.error('Credits exhausted. Please add credits to continue.');
      } else {
        toast.error(error.message || 'Failed to analyze learning style');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  };

  if (results) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Learning Style Profile</h1>
            <p className="text-muted-foreground">{results.summary}</p>
          </div>

          {/* Style Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Style Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(results.styles).map(([style, percentage]) => {
                const info = STYLE_INFO[style as keyof typeof STYLE_INFO];
                const Icon = info.icon;
                const isPrimary = style === results.primaryStyle;
                const isSecondary = style === results.secondaryStyle;

                return (
                  <div key={style} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${info.bg}`}>
                          <Icon className={`h-4 w-4 ${info.color}`} />
                        </div>
                        <span className="font-medium">{info.label}</span>
                        {isPrimary && <Badge>Primary</Badge>}
                        {isSecondary && <Badge variant="secondary">Secondary</Badge>}
                      </div>
                      <span className="font-bold">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>Study tips tailored to your learning style</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {results.recommendations.map((rec, idx) => {
                  const info = STYLE_INFO[rec.style as keyof typeof STYLE_INFO];
                  return (
                    <div key={idx} className={`p-4 rounded-lg ${info?.bg || 'bg-muted'}`}>
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Subject Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-Specific Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results.subjectTips).map(([subject, tip]) => (
                  <div key={subject} className="flex gap-4">
                    <Badge variant="outline" className="capitalize shrink-0">
                      {subject}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={resetQuiz}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Learning Style Analyzer</h1>
          <p className="text-muted-foreground">
            Discover how you learn best with our AI-powered assessment
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {QUESTIONS[currentQuestion].text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[QUESTIONS[currentQuestion].id] || ''}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {QUESTIONS[currentQuestion].options.map(option => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        answers[QUESTIONS[currentQuestion].id] === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAnswer(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === QUESTIONS.length - 1 ? (
            <Button
              onClick={analyzeResults}
              disabled={Object.keys(answers).length < QUESTIONS.length || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Results
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!answers[QUESTIONS[currentQuestion].id]}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* AI Provider Note */}
        <div className="text-center text-sm text-muted-foreground">
          <AIProviderSelector
            selectedProvider={provider}
            selectedModel={model}
            onProviderChange={setProvider}
            onModelChange={setModel}
          />
        </div>
      </motion.div>
    </div>
  );
}
