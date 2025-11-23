import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useGrading(classroomDebateId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rubrics } = useQuery({
    queryKey: ["teacher-rubrics", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grading_rubrics")
        .select("*")
        .eq("teacher_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: grades } = useQuery({
    queryKey: ["classroom-grades", classroomDebateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_grades")
        .select(`
          *,
          student:student_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("classroom_debate_id", classroomDebateId);

      if (error) throw error;
      return data;
    },
    enabled: !!classroomDebateId,
  });

  const createRubric = useMutation({
    mutationFn: async (data: any) => {
      const { data: newRubric, error } = await supabase
        .from("grading_rubrics")
        .insert({
          ...data,
          teacher_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newRubric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-rubrics"] });
      toast({
        title: "Rubric created",
        description: "Your rubric has been created successfully.",
      });
    },
  });

  const submitGrade = useMutation({
    mutationFn: async (data: any) => {
      const { data: newGrade, error } = await supabase
        .from("student_grades")
        .upsert({
          ...data,
          graded_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newGrade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classroom-grades"] });
      toast({
        title: "Grade submitted",
        description: "The grade has been submitted successfully.",
      });
    },
  });

  return {
    rubrics,
    grades,
    createRubric,
    submitGrade,
  };
}
