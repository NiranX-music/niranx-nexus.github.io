import { Badge } from "@/components/ui/badge";
import { Clock, GripVertical, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeGridTask } from "@/hooks/useTimeGridTasks";

interface TimeGridTaskCardProps {
  task: TimeGridTask;
  onClick: () => void;
  isDragging?: boolean;
}

export function TimeGridTaskCard({ task, onClick, isDragging }: TimeGridTaskCardProps) {
  const heightMultiplier = Math.max(1, Math.ceil(task.duration_minutes / 60));

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl p-2.5 cursor-pointer transition-all duration-200",
        "border border-white/10 backdrop-blur-md shadow-lg",
        "hover:scale-[1.02] hover:shadow-xl hover:border-white/20",
        isDragging && "opacity-50 scale-95 rotate-2"
      )}
      style={{
        backgroundColor: task.color + "22",
        borderLeftColor: task.color,
        borderLeftWidth: "3px",
        minHeight: `${heightMultiplier * 36}px`,
      }}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="w-3 h-3 mt-0.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0 cursor-grab" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold truncate text-foreground">{task.title}</p>
          {task.subject && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{ backgroundColor: task.color + "33", color: task.color }}
            >
              {task.subject}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" />
            {task.start_time || task.time_row} – {task.end_time || ""}
          </div>
          {task.class_link && <Link2 className="w-2.5 h-2.5 text-primary" />}
        </div>
      </div>
      {task.priority === "high" && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive animate-pulse" />
      )}
    </div>
  );
}
