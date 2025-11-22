import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Coffee, Clock, Calendar } from "lucide-react";
import { differenceInMinutes, format, parseISO } from "date-fns";

interface SmartSchedulingAssistantProps {
  liveClasses: any[];
  homework: any[];
  exams: any[];
}

export const SmartSchedulingAssistant = ({ liveClasses, homework, exams }: SmartSchedulingAssistantProps) => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    detectIssues();
  }, [liveClasses, homework, exams]);

  const detectIssues = () => {
    const newAlerts = [];

    // Detect overlapping classes
    const sortedClasses = [...liveClasses].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    for (let i = 0; i < sortedClasses.length - 1; i++) {
      const current = sortedClasses[i];
      const next = sortedClasses[i + 1];
      const currentEnd = new Date(current.end_time);
      const nextStart = new Date(next.start_time);

      if (currentEnd > nextStart) {
        newAlerts.push({
          type: "conflict",
          icon: AlertTriangle,
          severity: "high",
          title: "Schedule Conflict Detected",
          message: `"${current.title}" and "${next.title}" overlap by ${differenceInMinutes(currentEnd, nextStart)} minutes`,
          suggestion: "Reschedule one of these classes or join the first one early"
        });
      }
    }

    // Suggest breaks between long study sessions
    const today = new Date().toDateString();
    const todayClasses = liveClasses.filter(c => 
      new Date(c.start_time).toDateString() === today
    );

    if (todayClasses.length >= 3) {
      const totalDuration = todayClasses.reduce((acc, c) => {
        return acc + differenceInMinutes(new Date(c.end_time), new Date(c.start_time));
      }, 0);

      if (totalDuration > 180) {
        newAlerts.push({
          type: "break",
          icon: Coffee,
          severity: "medium",
          title: "Break Time Needed",
          message: `You have ${Math.floor(totalDuration / 60)} hours of classes today`,
          suggestion: "Schedule 15-minute breaks between sessions to maintain focus"
        });
      }
    }

    // Warn about too many activities in one day
    const busyDays = new Map<string, number>();
    [...liveClasses, ...homework].forEach(item => {
      const date = new Date(item.start_time || item.due_date).toDateString();
      busyDays.set(date, (busyDays.get(date) || 0) + 1);
    });

    busyDays.forEach((count, date) => {
      if (count > 5) {
        newAlerts.push({
          type: "overload",
          icon: AlertTriangle,
          severity: "high",
          title: "Day Overloaded",
          message: `${format(new Date(date), "MMM dd")} has ${count} scheduled items`,
          suggestion: "Consider moving some tasks to adjacent days"
        });
      }
    });

    // Schedule optimization suggestions
    const pendingHomework = homework.filter(h => h.status === "pending");
    const highPriorityHomework = pendingHomework.filter(h => h.priority === "high");
    
    if (highPriorityHomework.length > 0 && todayClasses.length === 0) {
      newAlerts.push({
        type: "optimization",
        icon: CheckCircle,
        severity: "low",
        title: "Optimal Study Window",
        message: "No classes scheduled today - perfect for tackling high-priority homework",
        suggestion: `Start with: ${highPriorityHomework[0]?.title}`
      });
    }

    // Detect no-break marathons
    for (let i = 0; i < sortedClasses.length - 1; i++) {
      const current = sortedClasses[i];
      const next = sortedClasses[i + 1];
      const gap = differenceInMinutes(new Date(next.start_time), new Date(current.end_time));

      if (gap < 10 && gap >= 0) {
        newAlerts.push({
          type: "warning",
          icon: Clock,
          severity: "medium",
          title: "Insufficient Break Time",
          message: `Only ${gap} minutes between "${current.title}" and "${next.title}"`,
          suggestion: "Try to maintain at least 10-15 minute breaks between classes"
        });
      }
    }

    setAlerts(newAlerts);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-500/50 bg-red-500/10";
      case "medium": return "border-yellow-500/50 bg-yellow-500/10";
      case "low": return "border-green-500/50 bg-green-500/10";
      default: return "border-muted";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return <Badge variant="destructive">Urgent</Badge>;
      case "medium": return <Badge variant="secondary">Important</Badge>;
      case "low": return <Badge variant="outline">Info</Badge>;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Smart Scheduling Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium">Your schedule looks great!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No conflicts or optimization suggestions at this time
            </p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <alert.icon className={`w-5 h-5 mt-0.5 ${
                  alert.severity === "high" ? "text-red-600" :
                  alert.severity === "medium" ? "text-yellow-600" : "text-green-600"
                }`} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  {alert.suggestion && (
                    <div className="flex items-start gap-2 mt-2 p-2 rounded bg-background/50">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <p className="text-xs font-medium">
                        <span className="text-muted-foreground">Suggestion:</span> {alert.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};