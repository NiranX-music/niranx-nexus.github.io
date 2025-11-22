import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface QAItem {
  id: string;
  user_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  upvotes: number;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface LiveQAQueueProps {
  classId: string;
}

export function LiveQAQueue({ classId }: LiveQAQueueProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQuestions();
    subscribeToQuestions();
  }, [classId]);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('live_class_qa')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading Q&A:', error);
      return;
    }

    // Fetch profile data separately
    const questionsWithProfiles = await Promise.all(
      (data || []).map(async (qa) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', qa.user_id)
          .single();
        return { ...qa, profiles: profile };
      })
    );

    setQuestions(questionsWithProfiles);
  };

  const subscribeToQuestions = () => {
    const channel = supabase
      .channel(`qa-${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_class_qa',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          loadQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !user) return;

    const { error } = await supabase.from('live_class_qa').insert({
      class_id: classId,
      user_id: user.id,
      question: newQuestion,
    });

    if (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to submit question');
    } else {
      toast.success('Question submitted!');
      setNewQuestion('');
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    const answer = answerText[questionId];
    if (!answer?.trim() || !user) return;

    const { error } = await supabase
      .from('live_class_qa')
      .update({
        answer,
        answered_at: new Date().toISOString(),
        answered_by: user.id,
      })
      .eq('id', questionId);

    if (error) {
      console.error('Error answering question:', error);
      toast.error('Failed to submit answer');
    } else {
      toast.success('Answer submitted!');
      setAnswerText({ ...answerText, [questionId]: '' });
    }
  };

  const handleUpvote = async (questionId: string, currentUpvotes: number) => {
    const { error } = await supabase
      .from('live_class_qa')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', questionId);

    if (error) {
      console.error('Error upvoting question:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Live Q&A
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Ask a question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAskQuestion} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((qa) => (
            <Card key={qa.id} className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{qa.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(qa.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(qa.id, qa.upvotes)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {qa.upvotes}
                  </Button>
                </div>
                
                <p className="text-sm mb-3">{qa.question}</p>

                {qa.answer ? (
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Badge variant="default" className="mb-2">Answer</Badge>
                    <p className="text-sm">{qa.answer}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your answer..."
                      value={answerText[qa.id] || ''}
                      onChange={(e) =>
                        setAnswerText({ ...answerText, [qa.id]: e.target.value })
                      }
                      rows={2}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAnswerQuestion(qa.id)}
                      disabled={!answerText[qa.id]?.trim()}
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {questions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No questions yet. Be the first to ask!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
