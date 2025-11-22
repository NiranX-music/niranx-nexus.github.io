import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LabQuizProps {
  labType: 'chemistry' | 'physics' | 'biology';
  quizId: string;
  questions: Question[];
}

export function LabQuiz({ labType, quizId, questions }: LabQuizProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const calculatedScore = questions.reduce((acc, question, index) => {
      return acc + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    setScore(calculatedScore);
    setShowResults(true);

    if (user) {
      try {
        await supabase.from('lab_quiz_scores').insert({
          user_id: user.id,
          lab_type: labType,
          quiz_id: quizId,
          score: calculatedScore,
          total_questions: questions.length,
          answers: selectedAnswers,
        });
        toast.success('Quiz score saved!');
      } catch (error) {
        console.error('Error saving quiz score:', error);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Quiz Results
            </CardTitle>
            <Badge variant={percentage >= 70 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {score} / {questions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold gradient-text mb-2">{percentage.toFixed(0)}%</div>
            <p className="text-muted-foreground">
              {percentage >= 90
                ? 'Excellent! You mastered this topic!'
                : percentage >= 70
                ? 'Good job! Keep practicing.'
                : 'Keep studying and try again.'}
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              return (
                <Card key={index} className={isCorrect ? 'border-green-500/50' : 'border-red-500/50'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{question.question}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your answer: {question.options[userAnswer]} {!isCorrect && '✗'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                            Correct answer: {question.options[question.correctAnswer]} ✓
                          </p>
                        )}
                        <p className="text-sm bg-muted p-2 rounded">{question.explanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button onClick={handleRestart} className="w-full" size="lg">
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>
            Question {currentQuestion + 1} of {questions.length}
          </CardTitle>
          <Badge variant="outline">{labType.charAt(0).toUpperCase() + labType.slice(1)}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          <RadioGroup
            value={selectedAnswers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
          >
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            Previous
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              className="flex-1"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="flex-1"
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
