import { format, differenceInMinutes } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Video, Users, ExternalLink, Repeat } from "lucide-react";

interface LiveClassCardProps {
  liveClass: {
    id: string;
    title: string;
    class_link: string | null;
    start_time: string;
    end_time: string;
    subject: string;
    status: string;
    attendance_count: number;
    is_recurring?: boolean;
    recurring_pattern?: string;
    recurring_days?: number[];
  };
  onUpdate: () => void;
}

export const LiveClassCard = ({ liveClass, onUpdate }: LiveClassCardProps) => {
  const startTime = new Date(liveClass.start_time);
  const endTime = new Date(liveClass.end_time);
  const now = new Date();
  const minutesUntilStart = differenceInMinutes(startTime, now);
  const isLive = now >= startTime && now <= endTime;
  const isUpcoming = now < startTime;

  const getStatusColor = () => {
    if (isLive) return "bg-green-500";
    if (isUpcoming && minutesUntilStart <= 15) return "bg-yellow-500";
    return "bg-muted";
  };

  const getRecurringText = () => {
    if (!liveClass.is_recurring) return null;
    
    if (liveClass.recurring_pattern === "daily") return "Repeats daily";
    if (liveClass.recurring_pattern === "weekly") return "Repeats weekly";
    if (liveClass.recurring_pattern === "custom" && liveClass.recurring_days) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = liveClass.recurring_days.map(d => dayNames[d]).join(", ");
      return `Repeats on ${days}`;
    }
    return "Recurring";
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <h4 className="font-semibold">{liveClass.title}</h4>
            {liveClass.is_recurring && (
              <Repeat className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {liveClass.subject}
            </Badge>
            {liveClass.is_recurring && (
              <span className="text-xs text-muted-foreground">{getRecurringText()}</span>
            )}
          </div>
        </div>
        {isLive && (
          <Badge variant="destructive" className="animate-pulse">
            LIVE
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
          </span>
        </div>
        {liveClass.attendance_count > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{liveClass.attendance_count}</span>
          </div>
        )}
      </div>

      {isUpcoming && minutesUntilStart <= 30 && (
        <div className="text-sm font-medium text-primary">
          Starting in {minutesUntilStart} minutes
        </div>
      )}

      {liveClass.class_link && (
        <Button
          size="sm"
          className="w-full"
          onClick={() => window.open(liveClass.class_link!, "_blank")}
        >
          <Video className="w-4 h-4 mr-2" />
          {isLive ? "Join Now" : "Open Link"}
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      )}
    </Card>
  );
};
