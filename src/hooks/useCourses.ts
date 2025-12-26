import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  quiz?: CourseQuiz;
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string;
  duration_minutes: number;
}

export interface CourseQuiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface GeneratedCourse {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  difficulty: string;
  modules: CourseModule[];
  ai_provider: string | null;
  estimated_hours: number | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  course_id: string;
  user_id: string;
  current_module: number;
  completed_modules: number[];
  completed_lessons: Record<string, string[]>;
  quiz_scores: Record<string, number>;
  started_at: string;
  last_activity: string;
}

export const useCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<GeneratedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('generated_courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsedCourses = (data || []).map(course => ({
        ...course,
        modules: Array.isArray(course.modules) ? course.modules as unknown as CourseModule[] : [],
      })) as GeneratedCourse[];
      
      setCourses(parsedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (course: Partial<GeneratedCourse>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('generated_courses')
        .insert([{
          title: course.title || 'Untitled',
          user_id: user.id,
          description: course.description,
          subject: course.subject,
          difficulty: course.difficulty,
          modules: course.modules as unknown as any[] || [],
          ai_provider: course.ai_provider,
          estimated_hours: course.estimated_hours,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const parsedCourse = {
        ...data,
        modules: Array.isArray(data.modules) ? data.modules as unknown as CourseModule[] : [],
      } as GeneratedCourse;
      
      setCourses([parsedCourse, ...courses]);
      toast.success('Course created!');
      return parsedCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCourses(courses.filter(c => c.id !== id));
      toast.success('Course deleted!');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const getCourseProgress = async (courseId: string): Promise<CourseProgress | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        return {
          ...data,
          completed_modules: Array.isArray(data.completed_modules) ? data.completed_modules : [],
          completed_lessons: (data.completed_lessons as Record<string, string[]>) || {},
          quiz_scores: (data.quiz_scores as Record<string, number>) || {},
        } as CourseProgress;
      }
      return null;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  };

  const updateProgress = async (courseId: string, updates: Partial<CourseProgress>) => {
    if (!user) return;

    try {
      const existing = await getCourseProgress(courseId);

      if (existing) {
        const { error } = await supabase
          .from('course_progress')
          .update({
            ...updates,
            last_activity: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('course_progress')
          .insert({
            course_id: courseId,
            user_id: user.id,
            ...updates,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  return {
    courses,
    loading,
    createCourse,
    deleteCourse,
    getCourseProgress,
    updateProgress,
    refreshCourses: fetchCourses,
  };
};
