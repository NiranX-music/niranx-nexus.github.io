import { useState, useEffect, useRef, useCallback } from "react";
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
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const onPomodoroStartRef = useRef(onPomodoroStart);
  const onTaskCreateRef = useRef(onTaskCreate);

  // Keep refs current
  navigateRef.current = navigate;
  onPomodoroStartRef.current = onPomodoroStart;
  onTaskCreateRef.current = onTaskCreate;

  const processCommand = useCallback(async (command: string) => {
    console.log("Processing voice command:", command);

    const cleanCommand = command.replace(/^(hey|hi|hello)\s+(niranx|niran)\s*/i, '').trim();

    let actionTaken = "Unknown command";
    let success = false;

    try {
      if (cleanCommand.match(/start\s+(pomodoro|timer|focus)/i)) {
        const subjectMatch = cleanCommand.match(/for\s+(\w+)/i);
        const subject = subjectMatch ? subjectMatch[1] : undefined;

        if (onPomodoroStartRef.current) {
          onPomodoroStartRef.current(subject);
          actionTaken = `Started Pomodoro${subject ? ` for ${subject}` : ''}`;
          toast.success(actionTaken);
        } else {
          navigateRef.current("/pomodoro");
          actionTaken = "Navigated to Pomodoro page";
          toast.success("Opening Pomodoro Timer");
        }
        success = true;
      } else if (cleanCommand.match(/create\s+(task|todo)/i)) {
        const taskMatch = cleanCommand.match(/create\s+(?:task|todo)\s+(.+)/i);
        const taskTitle = taskMatch ? taskMatch[1] : "New task from voice";

        if (onTaskCreateRef.current) {
          onTaskCreateRef.current(taskTitle);
          actionTaken = `Created task: ${taskTitle}`;
          toast.success(actionTaken);
        } else {
          navigateRef.current("/tasks");
          actionTaken = "Navigated to Tasks page";
          toast.success("Opening Tasks page");
        }
        success = true;
      } else if (cleanCommand.match(/open|go to|navigate/i)) {
        const pages: Record<string, string> = {
          dashboard: "/niranx",
          tasks: "/tasks",
          scheduler: "/niranx/scheduler",
          focus: "/focus-engine",
          exams: "/exam-hub",
          notes: "/note-summarizer",
          videos: "/youtube-library",
          music: "/niranx/suno-music",
          chat: "/niranx/ai-chat",
          ai: "/niranx/ai-corner",
        };

        let navigated = false;
        for (const [key, path] of Object.entries(pages)) {
          if (cleanCommand.includes(key)) {
            navigateRef.current(path);
            actionTaken = `Navigated to ${key}`;
            toast.success(`Opening ${key}`);
            navigated = true;
            success = true;
            break;
          }
        }

        if (!navigated) {
          toast.error("Page not recognized. Try: dashboard, tasks, music, chat, ai");
        }
      } else {
        toast.info(`Command heard: "${cleanCommand}". Try "start pomodoro", "create task", or "open dashboard"`);
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
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      setSupported(false);
      return;
    }

    setSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');

      setTranscript(result);

      if (event.results[0].isFinal) {
        processCommand(result.toLowerCase());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone permission.");
      } else if (event.error === 'no-speech') {
        toast.info("No speech detected. Try again.");
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [processCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current || !supported) {
        toast.error("Voice recognition not supported in this browser. Use Chrome or Edge.");
        return;
      }

      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("");
        toast.info("Listening... Say a command like 'open dashboard' or 'start pomodoro'");
      } catch (error: any) {
        console.error("Failed to start recognition:", error);
        if (error.message?.includes("already started")) {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              setTranscript("");
            } catch {}
          }, 200);
        } else {
          toast.error("Failed to start voice recognition");
        }
      }
    }
  };

  if (!supported) return null;

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
          className={`h-14 w-14 rounded-full shadow-lg ${isListening ? "animate-pulse" : ""}`}
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
