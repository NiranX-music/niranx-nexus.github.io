import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WorkloadMeterProps {
  level: number;
}

export const WorkloadMeter = ({ level }: WorkloadMeterProps) => {
  const getColor = () => {
    if (level >= 75) return "bg-destructive";
    if (level >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getLabel = () => {
    if (level >= 75) return "High";
    if (level >= 50) return "Moderate";
    if (level >= 25) return "Light";
    return "Minimal";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">{level}%</span>
        <span className={cn("text-sm font-medium", {
          "text-destructive": level >= 75,
          "text-yellow-600": level >= 50 && level < 75,
          "text-green-600": level < 50,
        })}>
          {getLabel()}
        </span>
      </div>
      <div className="relative">
        <Progress value={level} className="h-2" />
        <div className={cn("absolute inset-0 h-2 rounded-full transition-all", getColor())} style={{ width: `${level}%` }} />
      </div>
    </div>
  );
};
