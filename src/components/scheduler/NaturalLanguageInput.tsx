import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NaturalLanguageInputProps {
  onSuccess: () => void;
}

export const NaturalLanguageInput = ({ onSuccess }: NaturalLanguageInputProps) => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);

  const parseNaturalLanguage = async (text: string) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Simple pattern matching for common formats
      const homeworkPattern = /(?:add|create)?\s*homework[:\s]+(.+?)(?:\s+due\s+(.+?))?(?:\s+subject\s+(.+?))?$/i;
      const classPattern = /(?:add|create)?\s*class[:\s]+(.+?)(?:\s+at\s+(.+?))?(?:\s+subject\s+(.+?))?$/i;
      
      let matched = false;

      // Try homework pattern
      const hwMatch = text.match(homeworkPattern);
      if (hwMatch) {
        const title = hwMatch[1]?.trim();
        const dueText = hwMatch[2]?.trim() || "tomorrow";
        const subject = hwMatch[3]?.trim() || "General";

        // Parse due date
        const dueDate = parseDueDate(dueText);

        await supabase.from("homework_assignments").insert({
          user_id: user.id,
          title,
          subject,
          due_date: dueDate.toISOString(),
          status: "pending",
          priority: "medium"
        });

        matched = true;
        toast({
          title: "Homework Added",
          description: `"${title}" added for ${subject}`,
        });
      }

      // Try class pattern
      const classMatch = text.match(classPattern);
      if (classMatch && !matched) {
        const title = classMatch[1]?.trim();
        const timeText = classMatch[2]?.trim() || "now";
        const subject = classMatch[3]?.trim() || "General";

        const startTime = parseTime(timeText);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

        await supabase.from("live_classes").insert({
          user_id: user.id,
          title,
          subject,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: "upcoming"
        });

        matched = true;
        toast({
          title: "Class Added",
          description: `"${title}" scheduled for ${subject}`,
        });
      }

      if (!matched) {
        // Fallback: create as homework
        await supabase.from("homework_assignments").insert({
          user_id: user.id,
          title: text,
          subject: "General",
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          priority: "medium"
        });

        toast({
          title: "Task Added",
          description: "Created as homework due tomorrow",
        });
      }

      setInput("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse input",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const parseDueDate = (text: string): Date => {
    const lower = text.toLowerCase();
    const now = new Date();

    if (lower === "today") return now;
    if (lower === "tomorrow") return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (lower.includes("friday")) {
      const daysUntilFriday = (5 - now.getDay() + 7) % 7;
      return new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
    }
    if (lower.includes("next week")) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default: tomorrow
  };

  const parseTime = (text: string): Date => {
    const lower = text.toLowerCase();
    const now = new Date();

    if (lower === "now") return now;
    
    // Try to parse time format like "3pm" or "15:00"
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || "0");
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;

      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    return now;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !processing && input && parseNaturalLanguage(input)}
              placeholder='Try: "Homework: Math chapter 5 due Friday" or "Class: Physics at 2pm"'
              className="pl-10"
              disabled={processing}
            />
          </div>
          <Button 
            onClick={() => parseNaturalLanguage(input)} 
            disabled={!input || processing}
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Use natural language to quickly add tasks. Examples: "homework Math due tomorrow", "class Physics at 3pm"
        </p>
      </CardContent>
    </Card>
  );
};
