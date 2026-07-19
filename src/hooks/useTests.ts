import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Test {
  id: string;
  title: string;
  subject: string;
  description?: string | null;
  teacher_id: string;
  duration_minutes: number;
  total_marks: number;
  difficulty: string;
  status: string;
  scheduled_for?: string | null;
  published_at?: string | null;
  max_attempts: number | null;
  passing_percentage: number | null;
  shuffle_questions: boolean | null;
  shuffle_options: boolean | null;
  show_result_immediately: boolean | null;
  tab_switch_limit: number | null;
  allow_copy_paste: boolean | null;
  require_fullscreen: boolean | null;
  webcam_required: boolean | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  question_count?: number;
  attempt_count?: number;
  avg_score?: number;
  teacher_name?: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  question_type: string;
  options?: any;
  correct_answer?: string | null;
  marks: number;
  order_index: number;
  explanation?: string | null;
  created_at?: string;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string | null;
  score?: number | null;
  total_marks?: number | null;
  percentage?: number | null;
  status: string;
  tab_switches: number | null;
  time_spent_seconds?: number | null;
  answers: Record<string, string>;
  marked_for_review: string[];
  test?: Test;
  created_at?: string;
}

export function useTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests((data || []) as Test[]);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('tests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tests' },
        () => fetchTests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createTest = async (testData: { title: string; subject: string; [key: string]: any }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tests')
        .insert([{ ...testData, teacher_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Test created successfully!' });
      return data as Test;
    } catch (error: any) {
      toast({ title: 'Error creating test', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const updateTest = async (testId: string, updates: Partial<Test>) => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .update(updates)
        .eq('id', testId)
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Test updated successfully!' });
      return data;
    } catch (error: any) {
      toast({ title: 'Error updating test', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const publishTest = async (testId: string) => {
    return updateTest(testId, { status: 'published', published_at: new Date().toISOString() });
  };

  const deleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
      toast({ title: 'Test deleted successfully!' });
      return true;
    } catch (error: any) {
      toast({ title: 'Error deleting test', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  // Derived data
  const publishedTests = tests.filter(t => t.status === 'published');
  const myTests = user ? tests.filter(t => t.teacher_id === user.id) : [];
  const liveTests = tests.filter(t => t.status === 'live');

  return {
    tests,
    loading,
    refetch: fetchTests,
    createTest,
    updateTest,
    publishTest,
    deleteTest,
    publishedTests,
    myTests,
    liveTests,
  };
}

export function useUserAttempts() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('test_attempts')
          .select('*')
          .eq('student_id', user.id)
          .order('started_at', { ascending: false });

        if (error) throw error;
        setAttempts(data?.map(a => ({
          ...a,
          answers: a.answers as Record<string, string>,
          marked_for_review: a.marked_for_review as string[]
        })) || []);
      } catch (error) {
        console.error('Error fetching attempts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('user-attempts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_attempts', filter: `student_id=eq.${user.id}` },
        () => fetchAttempts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { attempts, loading };
}

export function useTestDetails(testId: string | undefined) {
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) return;

    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch test
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single();

        if (testError) throw testError;
        setTest(testData);

        // Fetch questions via SECURITY DEFINER RPC (strips correct_answer for non-owners)
        const { data: questionsData, error: questionsError } = await supabase
          .rpc('get_test_questions', { _test_id: testId });

        if (questionsError) throw questionsError;
        setQuestions((questionsData || []).map((q: any) => ({
          ...q,
          options: q.options as TestQuestion['options']
        })));

      } catch (error) {
        console.error('Error fetching test details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId]);

  const addQuestion = async (question: { question_text: string; question_type: string; marks: number; [key: string]: any }) => {
    if (!testId) return null;

    try {
      const { data, error } = await supabase
        .from('test_questions')
        .insert([{ ...question, test_id: testId }])
        .select()
        .single();

      if (error) throw error;
      setQuestions(prev => [...prev, data as TestQuestion]);
      return data as TestQuestion;
    } catch (error: any) {
      toast({ title: 'Error adding question', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const updateQuestion = async (questionId: string, updates: Partial<TestQuestion>) => {
    try {
      const { data, error } = await supabase
        .from('test_questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === questionId ? data as TestQuestion : q));
      return data;
    } catch (error: any) {
      toast({ title: 'Error updating question', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('test_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      return true;
    } catch (error: any) {
      toast({ title: 'Error deleting question', description: error.message, variant: 'destructive' });
      return false;
    }
  };

  return {
    test,
    questions,
    loading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
}

export function useTestAttempts(testId?: string) {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId && !user) return;

    const fetchAttempts = async () => {
      try {
        setLoading(true);
        let query = supabase.from('test_attempts').select('*');

        if (testId) {
          query = query.eq('test_id', testId);
        } else if (user) {
          query = query.eq('student_id', user.id);
        }

        const { data, error } = await query.order('started_at', { ascending: false });

        if (error) throw error;
        setAttempts(data?.map(a => ({
          ...a,
          answers: a.answers as Record<string, string>,
          marked_for_review: a.marked_for_review as string[]
        })) || []);
      } catch (error) {
        console.error('Error fetching attempts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('attempts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_attempts' },
        () => fetchAttempts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [testId, user]);

  const startAttempt = async (testId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .insert([{
          test_id: testId,
          student_id: user.id,
          status: 'in_progress',
          answers: {},
          marked_for_review: [],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({ title: 'Error starting test', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const updateAttempt = async (attemptId: string, updates: Partial<TestAttempt>) => {
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .update(updates)
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error updating attempt:', error);
      return null;
    }
  };

  const submitAttempt = async (attemptId: string, answers: Record<string, string>, status: 'submitted' | 'auto_submitted' = 'submitted') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .update({
          answers,
          submitted_at: new Date().toISOString(),
          status,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      toast({ title: status === 'auto_submitted' ? 'Test auto-submitted due to tab switches' : 'Test submitted successfully!' });
      return data;
    } catch (error: any) {
      toast({ title: 'Error submitting test', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  return {
    attempts,
    loading,
    startAttempt,
    updateAttempt,
    submitAttempt,
  };
}

export function useTestStats(testId?: string) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTests: 0,
    publishedTests: 0,
    completedTests: 0,
    avgScore: 0,
    bestRank: 0,
    totalAttempts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Get test counts
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('id, status');

        if (testsError) throw testsError;

        const totalTests = testsData?.length || 0;
        const publishedTests = testsData?.filter(t => t.status === 'published').length || 0;

        // Get attempt stats for user
        if (user) {
          const { data: attemptsData, error: attemptsError } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('student_id', user.id)
            .eq('status', 'submitted');

          if (attemptsError) throw attemptsError;

          const completedTests = attemptsData?.length || 0;
          const avgScore = attemptsData?.length 
            ? attemptsData.reduce((acc, a) => acc + (a.percentage || 0), 0) / attemptsData.length 
            : 0;

          setStats({
            totalTests,
            publishedTests,
            completedTests,
            avgScore: Math.round(avgScore),
            bestRank: 1,
            totalAttempts: attemptsData?.length || 0,
          });
        } else {
          setStats({
            totalTests,
            publishedTests,
            completedTests: 0,
            avgScore: 0,
            bestRank: 0,
            totalAttempts: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, testId]);

  return { stats, loading };
}
