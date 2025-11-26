import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface VoiceCommandProps {
  onPomodoroStart?: (subject?: string) => void;
  onTaskCreate?: (title: string) => void;
}

export default function VoiceCommand({ onPomodoroStart, onTaskCreate }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        setTranscript(transcript);
        
        if (event.results[0].isFinal) {
          processCommand(transcript.toLowerCase());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error("Voice recognition error. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        toast.error("Voice recognition not supported in this browser");
        return;
      }
      
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript("");
      toast.info("Listening... Say 'Hey Niranx' followed by a command");
    }
  };

  const processCommand = async (command: string) => {
    console.log("Processing command:", command);
    
    // Remove "hey niranx" prefix if present
    const cleanCommand = command.replace(/^(hey|hi|hello)\s+(niranx|niran)\s*/i, '').trim();
    
    let actionTaken = "Unknown command";
    let success = false;

    try {
      // Start Pomodoro commands
      if (cleanCommand.match(/start\s+(pomodoro|timer|focus)/i)) {
        const subjectMatch = cleanCommand.match(/for\s+(\w+)/i);
        const subject = subjectMatch ? subjectMatch[1] : undefined;
        
        if (onPomodoroStart) {
          onPomodoroStart(subject);
          actionTaken = `Started Pomodoro${subject ? ` for ${subject}` : ''}`;
          toast.success(actionTaken);
        } else {
          navigate("/pomodoro");
          actionTaken = "Navigated to Pomodoro page";
          toast.success("Opening Pomodoro Timer");
        }
        success = true;
      }
      // Create task commands
      else if (cleanCommand.match(/create\s+(task|todo)/i)) {
        const taskMatch = cleanCommand.match(/create\s+(?:task|todo)\s+(.+)/i);
        const taskTitle = taskMatch ? taskMatch[1] : "New task from voice";
        
        if (onTaskCreate) {
          onTaskCreate(taskTitle);
          actionTaken = `Created task: ${taskTitle}`;
          toast.success(actionTaken);
        } else {
          navigate("/tasks");
          actionTaken = "Navigated to Tasks page";
          toast.success("Opening Tasks page");
        }
        success = true;
      }
      // Navigation commands
      else if (cleanCommand.match(/open|go to|navigate/i)) {
        const pages: Record<string, string> = {
          dashboard: "/niranx",
          tasks: "/tasks",
          scheduler: "/niranx/scheduler",
          focus: "/focus-engine",
          exams: "/exam-hub",
          notes: "/note-summarizer",
          videos: "/youtube-library",
        };
        
        let navigated = false;
        for (const [key, path] of Object.entries(pages)) {
          if (cleanCommand.includes(key)) {
            navigate(path);
            actionTaken = `Navigated to ${key}`;
            toast.success(`Opening ${key}`);
            navigated = true;
            success = true;
            break;
          }
        }
        
        if (!navigated) {
          toast.error("Page not recognized");
        }
      }
      else {
        toast.error("Command not recognized. Try 'start pomodoro' or 'create task'");
      }

      // Log command
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("voice_command_history").insert({
          user_id: user.id,
          command_text: command,
          action_taken: actionTaken,
          success,
        });
      }
    } catch (error) {
      console.error("Error processing command:", error);
      toast.error("Failed to execute command");
    }
  };

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative">
        {isListening && transcript && (
          <Card className="absolute bottom-16 right-0 w-64 mb-2 animate-in slide-in-from-bottom">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">Listening...</p>
              <p className="text-sm font-medium">{transcript}</p>
            </CardContent>
          </Card>
        )}
        
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={toggleListening}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
