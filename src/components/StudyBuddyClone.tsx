import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFocus } from "@/contexts/FocusContext";
import { Bot, BookOpen, Pencil, FileText, Coffee, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type StudyAction = "idle" | "writing" | "typing" | "reading" | "thinking" | "break";

interface ActionConfig {
  icon: typeof Bot;
  label: string;
  message: string;
  color: string;
}

const actionConfigs: Record<StudyAction, ActionConfig> = {
  idle: {
    icon: Bot,
    label: "Ready",
    message: "Waiting for you to start...",
    color: "text-muted-foreground"
  },
  writing: {
    icon: Pencil,
    label: "Writing",
    message: "Taking notes together!",
    color: "text-blue-500"
  },
  typing: {
    icon: FileText,
    label: "Typing",
    message: "Documenting our learning...",
    color: "text-purple-500"
  },
  reading: {
    icon: BookOpen,
    label: "Reading",
    message: "Absorbing knowledge!",
    color: "text-green-500"
  },
  thinking: {
    icon: Sparkles,
    label: "Thinking",
    message: "Processing concepts...",
    color: "text-yellow-500"
  },
  break: {
    icon: Coffee,
    label: "Break Time",
    message: "Taking a quick break!",
    color: "text-orange-500"
  }
};

export default function StudyBuddyClone() {
  const { currentSession } = useFocus();
  const [currentAction, setCurrentAction] = useState<StudyAction>("idle");
  const [sessionTime, setSessionTime] = useState(0);

  // Rotate through study actions when session is active
  useEffect(() => {
    if (!currentSession) {
      setCurrentAction("idle");
      setSessionTime(0);
      return;
    }

    const startTime = new Date(currentSession.startTime).getTime();
    
    const updateTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSessionTime(elapsed);

      // Cycle through actions based on time
      const cycleActions: StudyAction[] = ["writing", "typing", "reading", "thinking"];
      const actionIndex = Math.floor(elapsed / 15) % cycleActions.length;
      setCurrentAction(cycleActions[actionIndex]);
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [currentSession]);

  const config = actionConfigs[currentAction];
  const ActionIcon = config.icon;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Study Buddy Clone
          </span>
          {currentSession && (
            <Badge variant="outline" className="animate-pulse">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Container */}
        <div className="relative flex items-center justify-center h-48 bg-gradient-to-b from-primary/5 to-primary/10 rounded-lg overflow-hidden">
          {/* Animated Background Particles */}
          {currentSession && (
            <>
              <div className="absolute top-4 left-4 w-2 h-2 bg-primary/30 rounded-full animate-ping" />
              <div className="absolute top-8 right-8 w-2 h-2 bg-primary/30 rounded-full animate-ping delay-700" />
              <div className="absolute bottom-6 left-12 w-2 h-2 bg-primary/30 rounded-full animate-ping delay-1000" />
            </>
          )}

          {/* Avatar Character */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div 
              className={cn(
                "relative p-6 rounded-full bg-background border-4 transition-all duration-500",
                currentSession ? "border-primary shadow-lg shadow-primary/20" : "border-muted",
                currentAction === "writing" && "animate-[bounce_1s_ease-in-out_infinite]",
                currentAction === "typing" && "animate-[pulse_1.5s_ease-in-out_infinite]",
                currentAction === "reading" && "animate-[scale-in_2s_ease-in-out_infinite]",
                currentAction === "thinking" && "animate-[spin_3s_linear_infinite]"
              )}
            >
              <ActionIcon className={cn("h-12 w-12", config.color)} />
              
              {/* Action Indicator */}
              <div className={cn(
                "absolute -top-2 -right-2 p-2 rounded-full bg-background border-2 shadow-lg",
                currentSession ? "border-primary" : "border-muted"
              )}>
                <ActionIcon className={cn("h-4 w-4", config.color)} />
              </div>
            </div>

            {/* Typing Dots Animation */}
            {currentAction === "typing" && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}

            {/* Writing Lines Animation */}
            {currentAction === "writing" && (
              <div className="space-y-1 w-24">
                <div className="h-1 bg-blue-500 rounded animate-[fade-in_0.5s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                <div className="h-1 bg-blue-500 rounded w-20 animate-[fade-in_0.5s_ease-in-out_infinite]" style={{ animationDelay: "200ms" }} />
                <div className="h-1 bg-blue-500 rounded w-16 animate-[fade-in_0.5s_ease-in-out_infinite]" style={{ animationDelay: "400ms" }} />
              </div>
            )}
          </div>
        </div>

        {/* Status Display */}
        <div className="space-y-2 text-center">
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm px-3 py-1",
              currentSession && "border-primary bg-primary/10"
            )}
          >
            {config.label}
          </Badge>
          <p className={cn("text-sm font-medium", config.color)}>
            {config.message}
          </p>

          {currentSession && (
            <>
              <p className="text-xs text-muted-foreground mt-1">
                Studying: <span className="font-semibold text-foreground">{currentSession.subject}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-mono">
                <span className="text-muted-foreground">Session Time:</span>
                <span className="font-bold text-primary">{formatTime(sessionTime)}</span>
              </div>
            </>
          )}

          {!currentSession && (
            <p className="text-xs text-muted-foreground italic">
              Start a focus session to study together!
            </p>
          )}
        </div>

        {/* Motivational Quote */}
        {currentSession && (
          <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
            <p className="text-xs italic text-muted-foreground">
              "You're not studying alone - we're in this together! 💪"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
