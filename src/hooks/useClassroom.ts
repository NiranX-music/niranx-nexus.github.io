import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useClassroom(classroomId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: classrooms, isLoading: classroomsLoading } = useQuery({
    queryKey: ["teacher-classrooms", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .eq("teacher_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: classroom, isLoading: classroomLoading } = useQuery({
    queryKey: ["classroom", classroomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .eq("id", classroomId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!classroomId,
  });

  const { data: members } = useQuery({
    queryKey: ["classroom-members", classroomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classroom_members")
        .select(`
          *,
          profiles:student_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("classroom_id", classroomId)
        .eq("enrollment_status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!classroomId,
  });

  const createClassroom = useMutation({
    mutationFn: async (data: any) => {
      const { data: newClassroom, error } = await supabase
        .from("classrooms")
        .insert({
          ...data,
          teacher_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newClassroom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-classrooms"] });
      toast({
        title: "Classroom created",
        description: "Your classroom has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create classroom: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateClassroom = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: updated, error } = await supabase
        .from("classrooms")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-classrooms"] });
      queryClient.invalidateQueries({ queryKey: ["classroom", classroomId] });
      toast({
        title: "Classroom updated",
        description: "Your classroom has been updated successfully.",
      });
    },
  });

  const deleteClassroom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("classrooms")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-classrooms"] });
      toast({
        title: "Classroom deleted",
        description: "The classroom has been deleted successfully.",
      });
    },
  });

  return {
    classrooms,
    classroom,
    members,
    classroomsLoading,
    classroomLoading,
    createClassroom,
    updateClassroom,
    deleteClassroom,
  };
}
