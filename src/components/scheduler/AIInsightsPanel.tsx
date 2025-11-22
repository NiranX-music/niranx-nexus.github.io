import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Clock, AlertCircle, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AIInsightsPanelProps {
  homework: any[];
  exams: any[];
  liveClasses: any[];
  workload: any;
}

export const AIInsightsPanel = ({ homework, exams, liveClasses, workload }: AIInsightsPanelProps) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [examReadiness, setExamReadiness] = useState<any[]>([]);

  useEffect(() => {
    generateInsights();
    calculateExamReadiness();
  }, [homework, exams, liveClasses, workload]);

  const generateInsights = () => {
    const newInsights = [];

    // Workload stress insight
    if (workload.stress_level > 75) {
      newInsights.push({
        type: "warning",
        icon: AlertCircle,
        title: "High Workload Detected",
        message: "Consider rescheduling some tasks or taking breaks to avoid burnout.",
        action: "Optimize Schedule"
      });
    }

    // Homework completion pattern
    const pendingHomework = homework.filter(h => h.status === "pending");
    if (pendingHomework.length > 5) {
      newInsights.push({
        type: "info",
        icon: Lightbulb,
        title: "Multiple Pending Assignments",
        message: `You have ${pendingHomework.length} homework items. Start with high-priority tasks first.`,
        action: "Prioritize Tasks"
      });
    }

    // Optimal study time suggestion
    const now = new Date().getHours();
    if (now >= 6 && now <= 10) {
      newInsights.push({
        type: "success",
        icon: Clock,
        title: "Optimal Study Time",
        message: "Morning hours (6-10 AM) are great for focused work. Perfect time to tackle complex homework!",
      });
    }

    // Class preparation reminder
    const upcomingClasses = liveClasses.filter(c => {
      const start = new Date(c.start_time);
      return start > new Date() && start.getTime() - new Date().getTime() < 2 * 60 * 60 * 1000;
    });
    if (upcomingClasses.length > 0) {
      newInsights.push({
        type: "info",
        icon: TrendingUp,
        title: "Upcoming Class",
        message: `${upcomingClasses[0].title} starts soon. Review your notes and prepare questions.`,
      });
    }

    setInsights(newInsights);
  };

  const calculateExamReadiness = () => {
    const readiness = exams.map(exam => {
      // Calculate readiness based on homework completion and preparation progress
      const relatedHomework = homework.filter(h => 
        h.subject === exam.subject && h.exam_link === exam.id
      );
      const completedHomework = relatedHomework.filter(h => h.status === "completed").length;
      const homeworkScore = relatedHomework.length > 0 
        ? (completedHomework / relatedHomework.length) * 50 
        : 0;
      
      const preparationScore = exam.preparation_progress || 0;
      const totalScore = homeworkScore + (preparationScore * 0.5);

      return {
        exam,
        score: Math.round(totalScore),
        status: totalScore >= 70 ? "ready" : totalScore >= 40 ? "moderate" : "needs-work"
      };
    });

    setExamReadiness(readiness);
  };

  const getReadinessColor = (status: string) => {
    switch (status) {
      case "ready": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "needs-work": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length === 0 ? (
            <p className="text-muted-foreground text-sm">No insights available. Keep working and AI will learn your patterns!</p>
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <insight.icon className={`w-5 h-5 mt-0.5 ${
                  insight.type === "warning" ? "text-yellow-600" :
                  insight.type === "success" ? "text-green-600" : "text-blue-600"
                }`} />
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                  {insight.action && (
                    <Button size="sm" variant="outline" className="mt-2">
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Exam Readiness Predictor */}
      {examReadiness.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Exam Readiness Predictor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {examReadiness.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{item.exam.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.exam.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getReadinessColor(item.status)}`}>
                      {item.score}%
                    </div>
                    <Badge variant={
                      item.status === "ready" ? "default" :
                      item.status === "moderate" ? "secondary" : "destructive"
                    }>
                      {item.status === "ready" ? "Ready" :
                       item.status === "moderate" ? "In Progress" : "Needs Work"}
                    </Badge>
                  </div>
                </div>
                <Progress value={item.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
