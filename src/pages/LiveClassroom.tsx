import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PomodoroFocus from "@/components/focus/PomodoroFocus";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const LiveClassroom = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);

  const handleStartClass = async () => {
    setIsStarting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to start a class");
        return;
      }

      const now = new Date();
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

      // Create a new live class session
      const { data: liveClass, error } = await supabase
        .from("live_classes")
        .insert({
          user_id: user.id,
          teacher_id: user.id,
          title: "Live Class Session",
          subject: "General",
          status: "live",
          start_time: now.toISOString(),
          end_time: endTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Live class started! Students can now join");
      
      // Open in new window
      window.open(`/niranx/teacher/live-class/${liveClass.id}`, '_blank');
    } catch (error) {
      console.error("Error starting class:", error);
      toast.error("Failed to start live class");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Live Classroom Card */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Video className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Live Classroom</CardTitle>
            <CardDescription className="text-lg">
              Start a live class to teach your students with video and screen sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleStartClass}
              disabled={isStarting}
              size="lg"
              className="px-8"
            >
              {isStarting ? "Starting..." : "Start Live Class"}
            </Button>

            <Collapsible open={quickAccessOpen} onOpenChange={setQuickAccessOpen} className="w-full">
              <CollapsibleTrigger className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {quickAccessOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Quick Access
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/teacher/dashboard")}
                    className="w-full"
                  >
                    Teacher Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/classrooms")}
                    className="w-full"
                  >
                    Join Classroom
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/scheduler")}
                    className="w-full"
                  >
                    View Schedule
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Pomodoro Timer Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Timer</CardTitle>
            <CardDescription>
              Use the Pomodoro technique to stay focused during your teaching session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PomodoroFocus />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveClassroom;
