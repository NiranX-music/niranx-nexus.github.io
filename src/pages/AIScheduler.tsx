import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Target, Sparkles, Loader2, Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ScheduleItem {
  time: string;
  subject: string;
  topic: string;
  duration: string;
  priority: "high" | "medium" | "low";
}

export default function AIScheduler() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [generatedOn, setGeneratedOn] = useState<string>("");

  const generateSchedule = async () => {
    if (!prompt.trim()) {
      toast.error("Please provide information about your subjects and preferences");
      return;
    }

    setLoading(true);
    try {
      // Simulated AI schedule generation
      // In production, this would call an AI edge function
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockSchedule: ScheduleItem[] = [
        {
          time: "6:00 AM - 7:00 AM",
          subject: "Mathematics",
          topic: "Calculus - Derivatives",
          duration: "1 hour",
          priority: "high"
        },
        {
          time: "7:30 AM - 8:30 AM",
          subject: "Physics",
          topic: "Mechanics - Newton's Laws",
          duration: "1 hour",
          priority: "high"
        },
        {
          time: "9:00 AM - 10:00 AM",
          subject: "Chemistry",
          topic: "Organic Chemistry - Reactions",
          duration: "1 hour",
          priority: "medium"
        },
        {
          time: "10:30 AM - 11:30 AM",
          subject: "English",
          topic: "Essay Writing Practice",
          duration: "1 hour",
          priority: "medium"
        },
        {
          time: "2:00 PM - 3:00 PM",
          subject: "Biology",
          topic: "Cell Biology - Mitosis",
          duration: "1 hour",
          priority: "low"
        },
        {
          time: "4:00 PM - 5:00 PM",
          subject: "History",
          topic: "World War II - Review",
          duration: "1 hour",
          priority: "low"
        },
      ];

      setSchedule(mockSchedule);
      setGeneratedOn(new Date().toLocaleString());
      toast.success("Schedule generated successfully!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("Failed to generate schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">AI Study Scheduler</h1>
            <p className="text-muted-foreground">
              Let AI create a personalized study schedule based on your subjects and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Study Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tell the AI about your study needs
              </label>
              <Textarea
                placeholder="Example: I need to prepare for Math, Physics, and Chemistry exams. I prefer studying difficult subjects in the morning. I have 6-8 hours available for study daily."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={10}
                className="resize-none"
              />
            </div>

            <Button
              onClick={generateSchedule}
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Schedule
                </>
              )}
            </Button>

            <div className="pt-4 space-y-2 border-t">
              <p className="text-sm font-medium">Tips for better results:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Mention your subjects and their priority</li>
                <li>• Specify your preferred study times</li>
                <li>• Include any time constraints</li>
                <li>• Note subjects you find challenging</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Your Study Schedule
              </CardTitle>
              {generatedOn && (
                <Badge variant="secondary" className="text-xs">
                  Generated: {generatedOn}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {schedule.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No schedule generated yet</p>
                <p className="text-sm text-muted-foreground">
                  Fill in your preferences and click "Generate Schedule" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <Card key={index} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority.toUpperCase()}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {item.time}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{item.subject}</h3>
                            <p className="text-sm text-muted-foreground">{item.topic}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Duration: {item.duration}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => toast.success(`Marked ${item.subject} as complete!`)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="pt-4 flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Session
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Export Schedule
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
