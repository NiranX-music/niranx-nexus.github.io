import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeGridTaskCard } from "./TimeGridTaskCard";
import { DAYS, DEFAULT_TIME_SLOTS, type TimeGridTask } from "@/hooks/useTimeGridTasks";

interface Props {
  tasks: TimeGridTask[];
  timeSlots: string[];
  days: string[];
  onCellClick: (day: string, time: string) => void;
  onTaskClick: (task: TimeGridTask) => void;
  onDrop: (taskId: string, newDay: string, newTime: string) => void;
}

export function TimeGridGrid({ tasks, timeSlots, days, onCellClick, onTaskClick, onDrop }: Props) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: string; time: string } | null>(null);

  const getTasksForCell = (day: string, time: string) =>
    tasks.filter(t => t.day_column === day && t.time_row === time);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ day, time });
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) onDrop(taskId, day, time);
    setDraggedTask(null);
    setDropTarget(null);
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="overflow-auto rounded-xl border border-border/50 bg-card/30 backdrop-blur">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid sticky top-0 z-10 bg-card/80 backdrop-blur border-b border-border/50" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
          <div className="p-2 text-xs font-medium text-muted-foreground border-r border-border/30">Time</div>
          {days.map(day => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-foreground border-r last:border-r-0 border-border/30">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Time rows */}
        {timeSlots.map((time, rowIdx) => (
          <div
            key={time}
            className={cn("grid border-b border-border/20", rowIdx % 2 === 0 ? "bg-muted/5" : "")}
            style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
          >
            {/* Time label */}
            <div className="p-2 text-[10px] font-mono text-muted-foreground border-r border-border/30 flex items-start">
              {formatTime(time)}
            </div>

            {/* Day cells */}
            {days.map(day => {
              const cellTasks = getTasksForCell(day, time);
              const isTarget = dropTarget?.day === day && dropTarget?.time === time;

              return (
                <div
                  key={`${day}-${time}`}
                  className={cn(
                    "min-h-[60px] p-1 border-r last:border-r-0 border-border/20 transition-colors relative group",
                    isTarget && "bg-primary/10 ring-1 ring-primary/30",
                    "hover:bg-muted/10"
                  )}
                  onDragOver={e => handleDragOver(e, day, time)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, day, time)}
                >
                  {/* Add button */}
                  <button
                    onClick={() => onCellClick(day, time)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-0"
                  >
                    <Plus className="w-4 h-4 text-muted-foreground/50" />
                  </button>

                  {/* Tasks */}
                  <div className="relative z-10 space-y-1">
                    {cellTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onDragEnd={() => setDraggedTask(null)}
                      >
                        <TimeGridTaskCard
                          task={task}
                          onClick={() => onTaskClick(task)}
                          isDragging={draggedTask === task.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
