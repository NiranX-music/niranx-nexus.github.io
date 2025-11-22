import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, AlertTriangle } from "lucide-react";

interface ConflictAlertProps {
  conflict: {
    id: string;
    conflict_type: string;
    items: any;
    detected_at: string;
  };
  onResolve: () => void;
}

export const ConflictAlert = ({ conflict, onResolve }: ConflictAlertProps) => {
  const { toast } = useToast();

  const resolveConflict = async () => {
    try {
      const { error } = await supabase
        .from("schedule_conflicts")
        .update({ resolved: true })
        .eq("id", conflict.id);

      if (error) throw error;

      toast({
        title: "Conflict Resolved",
        description: "The schedule conflict has been marked as resolved",
      });
      onResolve();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive",
      });
    }
  };

  const getConflictMessage = () => {
    switch (conflict.conflict_type) {
      case "overlapping_classes":
        return `Classes "${conflict.items.class1?.title}" and "${conflict.items.class2?.title}" overlap`;
      case "homework_during_class":
        return `Homework "${conflict.items.homework?.title}" is due during class "${conflict.items.class?.title}"`;
      default:
        return "Schedule conflict detected";
    }
  };

  return (
    <div className="flex items-start justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
      <div className="flex items-start gap-3 flex-1">
        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{getConflictMessage()}</p>
          <p className="text-xs text-muted-foreground">
            Detected {format(new Date(conflict.detected_at), "MMM dd, HH:mm")}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={resolveConflict}
        className="text-destructive hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
