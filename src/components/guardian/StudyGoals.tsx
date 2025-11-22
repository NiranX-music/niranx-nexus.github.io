import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Target, Trash2, CheckCircle, XCircle } from "lucide-react";

interface StudyGoalsProps {
  studentId: string;
  guardianId: string;
  mode: 'view' | 'manage';
}

export function StudyGoals({ studentId, guardianId, mode }: StudyGoalsProps) {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'weekly_study_time',
    target_value: 300
  });

  useEffect(() => {
    fetchGoals();

    // Subscribe to changes
    const channel = supabase
      .channel('study_goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guardian_study_goals',
          filter: `student_id=eq.${studentId}`
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guardian_study_goals')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const { error } = await supabase
        .from('guardian_study_goals')
        .insert({
          student_id: studentId,
          guardian_id: guardianId,
          goal_type: newGoal.goal_type,
          target_value: newGoal.target_value,
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Goal Created",
        description: "New study goal has been set for the student",
      });

      setShowAddForm(false);
      setNewGoal({ goal_type: 'weekly_study_time', target_value: 300 });
      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('guardian_study_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Goal Removed",
        description: "Study goal has been deleted",
      });

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily_study_time: 'Daily Study Time',
      weekly_study_time: 'Weekly Study Time',
      tasks_per_week: 'Tasks Per Week',
      focus_sessions: 'Focus Sessions',
      exam_preparation: 'Exam Preparation'
    };
    return labels[type] || type;
  };

  const getGoalUnit = (type: string) => {
    if (type.includes('time')) return 'minutes';
    if (type.includes('tasks')) return 'tasks';
    if (type.includes('sessions')) return 'sessions';
    return 'items';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Goals
            </CardTitle>
            <CardDescription>
              {mode === 'manage' ? 'Set and manage study goals' : 'Current weekly goals'}
            </CardDescription>
          </div>
          {mode === 'manage' && (
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && mode === 'manage' && (
          <div className="p-4 border rounded-lg space-y-4">
            <div>
              <Label>Goal Type</Label>
              <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal({ ...newGoal, goal_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly_study_time">Weekly Study Time</SelectItem>
                  <SelectItem value="tasks_per_week">Tasks Per Week</SelectItem>
                  <SelectItem value="focus_sessions">Focus Sessions</SelectItem>
                  <SelectItem value="exam_preparation">Exam Preparation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Value</Label>
              <Input
                type="number"
                value={newGoal.target_value}
                onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) })}
                placeholder="Enter target value"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {getGoalUnit(newGoal.goal_type)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddGoal} className="flex-1">Create Goal</Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active goals. {mode === 'manage' && 'Click "Add Goal" to create one.'}
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
              const isComplete = goal.current_value >= goal.target_value;

              return (
                <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{getGoalTypeLabel(goal.goal_type)}</h4>
                        {isComplete ? (
                          <Badge variant="default" className="bg-green-600 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {goal.current_value} / {goal.target_value} {getGoalUnit(goal.goal_type)}
                      </p>
                    </div>
                    {mode === 'manage' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
