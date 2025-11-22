import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ThumbsUp, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface QAItem {
  id: string;
  user_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  upvotes: number;
  created_at: string;
}

interface LiveQAQueueProps {
  classId: string;
}

export const LiveQAQueue = ({ classId }: LiveQAQueueProps) => {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from('live_class_qa')
        .select('*')
        .eq('class_id', classId)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: true });

      if (data) setQuestions(data);
    };

    fetchQuestions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`qa-${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_class_qa',
          filter: `class_id=eq.${classId}`
        },
        () => fetchQuestions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;

    const { error } = await supabase.from('live_class_qa').insert({
      class_id: classId,
      user_id: currentUserId,
      question: newQuestion
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit question',
        variant: 'destructive'
      });
    } else {
      setNewQuestion('');
      toast({
        title: 'Question Submitted',
        description: 'Your question has been added to the queue'
      });
    }
  };

  const upvoteQuestion = async (questionId: string, currentUpvotes: number) => {
    await supabase
      .from('live_class_qa')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', questionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          Q&A Queue ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Ask a question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={2}
          />
          <Button onClick={submitQuestion} size="sm">
            Submit Question
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-3 rounded-lg border ${
                q.answered_at ? 'bg-muted/50' : 'bg-background'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{q.question}</p>
                  {q.answer && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Check className="w-4 h-4 inline mr-1" />
                      {q.answer}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => upvoteQuestion(q.id, q.upvotes)}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {q.upvotes}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
