import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TimeGridTask {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  description: string | null;
  notes: string | null;
  day_column: string;
  time_row: string;
  duration_minutes: number;
  priority: string;
  color: string;
  tags: string[];
  checklist: any[];
  linked_pdfs: any[];
  deadline: string | null;
  class_link: string | null;
  start_time: string | null;
  end_time: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const DEFAULT_TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00"
];

export const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#ef4444",
  Physics: "#3b82f6",
  Chemistry: "#22c55e",
  Biology: "#a855f7",
  English: "#f59e0b",
  History: "#ec4899",
  Computer: "#06b6d4",
  default: "#7c3aed"
};

export function useTimeGridTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TimeGridTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("timegrid_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setTasks((data as any[]) || []);
    } catch (e: any) {
      console.error("Error fetching timegrid tasks:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("timegrid-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "timegrid_tasks", filter: `user_id=eq.${user.id}` }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchTasks]);

  const addTask = async (task: Partial<TimeGridTask>) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("timegrid_tasks")
        .insert({ ...task, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      toast.success("Task added!");
      return data;
    } catch (e: any) {
      toast.error("Failed to add task: " + e.message);
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<TimeGridTask>) => {
    try {
      const { error } = await supabase
        .from("timegrid_tasks")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
      toast.success("Task updated!");
    } catch (e: any) {
      toast.error("Failed to update: " + e.message);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("timegrid_tasks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Task deleted!");
    } catch (e: any) {
      toast.error("Failed to delete: " + e.message);
    }
  };

  const moveTask = async (taskId: string, newDay: string, newTime: string) => {
    await updateTask(taskId, { day_column: newDay, time_row: newTime } as any);
  };

  const getTasksForCell = (day: string, time: string) => {
    return tasks.filter(t => t.day_column === day && t.time_row === time);
  };

  return { tasks, loading, addTask, updateTask, deleteTask, moveTask, getTasksForCell, fetchTasks };
}
