import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Sparkles, CheckCircle2, XCircle, RotateCcw, Trophy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  showResults: boolean;
  isSubmitted: boolean;
}

export default function QuizGenerator() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('quiz-generator');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<QuizState | null>(null);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast({ title: 'Please enter a topic', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a quiz with ${numQuestions} multiple choice questions about "${topic}".
${content ? `Use this content as reference: ${content}` : ''}
Difficulty: ${difficulty}

Return ONLY a valid JSON array with this exact format (no markdown, no code blocks):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]

Make questions educational and the explanations helpful for learning.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';
      else if (provider === 'perplexity') functionName = 'perplexity-chat';
      else if (provider === 'groq') functionName = 'groq-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: model,
        },
      });

      if (error) throw error;

      const responseContent = data?.choices?.[0]?.message?.content || data?.content || '';
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Invalid response format');

      const questions: Question[] = JSON.parse(jsonMatch[0]).map((q: any, i: number) => ({
        ...q,
        id: i,
      }));

      setQuiz({
        questions,
        currentIndex: 0,
        answers: new Array(questions.length).fill(null),
        showResults: false,
        isSubmitted: false,
      });

      toast({ title: 'Quiz generated!', description: `${questions.length} questions ready` });
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast({ title: 'Failed to generate quiz', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    if (!quiz || quiz.isSubmitted) return;
    const newAnswers = [...quiz.answers];
    newAnswers[quiz.currentIndex] = answerIndex;
    setQuiz({ ...quiz, answers: newAnswers });
  };

  const submitQuiz = () => {
    if (!quiz) return;
    setQuiz({ ...quiz, isSubmitted: true, showResults: true });
  };

  const resetQuiz = () => {
    setQuiz(null);
    setTopic('');
    setContent('');
  };

  const getScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((score, q, i) => {
      return score + (quiz.answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Quiz Generator</h1>
          <p className="text-muted-foreground">Generate quizzes from any topic</p>
        </div>
      </div>

      {!quiz ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Your Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIProviderSelector
              selectedProvider={provider}
              selectedModel={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
            />

            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                placeholder="e.g., World War II, Photosynthesis, JavaScript..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Content (Optional)</Label>
              <Textarea
                placeholder="Paste notes or content to generate questions from..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Select value={numQuestions} onValueChange={setNumQuestions}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 10, 15, 20].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} Questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateQuiz} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : quiz.showResults ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-3xl font-bold mb-2">
                {getScore()} / {quiz.questions.length}
              </h2>
              <p className="text-muted-foreground mb-4">
                {getScore() === quiz.questions.length
                  ? 'Perfect score! 🎉'
                  : getScore() >= quiz.questions.length / 2
                  ? 'Good job! Keep learning 📚'
                  : 'Keep practicing! 💪'}
              </p>
              <Button onClick={resetQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Quiz
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {quiz.questions.map((q, i) => (
              <Card key={q.id} className={quiz.answers[i] === q.correctAnswer ? 'border-green-500' : 'border-red-500'}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2 mb-3">
                    {quiz.answers[i] === q.correctAnswer ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <p className="font-medium">{q.question}</p>
                  </div>
                  <div className="grid gap-2 ml-7">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`p-2 rounded-lg text-sm ${
                          oi === q.correctAnswer
                            ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                            : quiz.answers[i] === oi
                            ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                            : 'bg-muted'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 ml-7 italic">{q.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={quiz.currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Question {quiz.currentIndex + 1} of {quiz.questions.length}
                  </Badge>
                  <div className="flex gap-1">
                    {quiz.questions.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          quiz.answers[i] !== null
                            ? 'bg-primary'
                            : i === quiz.currentIndex
                            ? 'bg-primary/50'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl mt-4">{quiz.questions[quiz.currentIndex].question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quiz.questions[quiz.currentIndex].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      quiz.answers[quiz.currentIndex] === i
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                ))}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setQuiz({ ...quiz, currentIndex: quiz.currentIndex - 1 })}
                    disabled={quiz.currentIndex === 0}
                  >
                    Previous
                  </Button>
                  {quiz.currentIndex < quiz.questions.length - 1 ? (
                    <Button
                      onClick={() => setQuiz({ ...quiz, currentIndex: quiz.currentIndex + 1 })}
                      className="flex-1"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={submitQuiz}
                      className="flex-1"
                      disabled={quiz.answers.some((a) => a === null)}
                    >
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
