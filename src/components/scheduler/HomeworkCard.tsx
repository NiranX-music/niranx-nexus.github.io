import { useState } from "react";
import { format, differenceInHours } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HomeworkCardProps {
  homework: {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    due_date: string;
    estimated_time: number | null;
    priority: string;
    status: string;
    progress_checkpoints: any;
  };
  onUpdate: () => void;
}

export const HomeworkCard = ({ homework, onUpdate }: HomeworkCardProps) => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const dueDate = new Date(homework.due_date);
  const now = new Date();
  const hoursUntilDue = differenceInHours(dueDate, now);
  const isOverdue = hoursUntilDue < 0;
  const isUrgent = hoursUntilDue > 0 && hoursUntilDue <= 24;

  const getPriorityColor = () => {
    switch (homework.priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const toggleStatus = async () => {
    setUpdating(true);
    try {
      const newStatus = homework.status === "completed" ? "pending" : "completed";
      const { error } = await supabase
        .from("homework_assignments")
        .update({ 
          status: newStatus,
          actual_time: newStatus === "completed" ? homework.estimated_time : null
        })
        .eq("id", homework.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Homework marked as ${newStatus}`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update homework status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const checkpoints = homework.progress_checkpoints || [];
  const completedCheckpoints = checkpoints.filter((c: any) => c.completed).length;
  const progress = checkpoints.length > 0 ? (completedCheckpoints / checkpoints.length) * 100 : 0;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={homework.status === "completed"}
              onCheckedChange={toggleStatus}
              disabled={updating}
            />
            <h4 className={`font-semibold ${homework.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
              {homework.title}
            </h4>
          </div>
          {homework.description && (
            <p className="text-sm text-muted-foreground pl-6">{homework.description}</p>
          )}
        </div>
        <Badge variant={getPriorityColor()} className="ml-2">
          {homework.priority}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground pl-6">
        <Badge variant="outline">{homework.subject}</Badge>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            {isOverdue ? "Overdue" : format(dueDate, "MMM dd, HH:mm")}
          </span>
        </div>
        {homework.estimated_time && (
          <span>{Math.round(homework.estimated_time / 60)}h</span>
        )}
      </div>

      {(isOverdue || isUrgent) && homework.status !== "completed" && (
        <div className={`flex items-center gap-2 text-sm font-medium pl-6 ${isOverdue ? "text-destructive" : "text-yellow-600"}`}>
          <AlertTriangle className="w-4 h-4" />
          <span>{isOverdue ? "Overdue!" : "Due in less than 24 hours"}</span>
        </div>
      )}

      {checkpoints.length > 0 && (
        <div className="space-y-2 pl-6">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completedCheckpoints}/{checkpoints.length} checkpoints</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {homework.status === "completed" && (
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 pl-6">
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed</span>
        </div>
      )}
    </Card>
  );
};
