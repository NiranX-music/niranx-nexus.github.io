import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar, Clock, BookOpen, Target, Sparkles, Loader2,
  CheckCircle, Send, Bot, User, Trash2, Download, RotateCcw,
  MessageSquare, Lightbulb, GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleItem {
  time: string;
  subject: string;
  topic: string;
  duration: string;
  priority: "high" | "medium" | "low";
  notes?: string;
  completed?: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  scheduleData?: {
    schedule: ScheduleItem[];
    summary: string;
    tips: string[];
  };
}

export default function AIScheduler() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generatedOn, setGeneratedOn] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [activeTab, setActiveTab] = useState<"setup" | "chat">("setup");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callAI = async (
    msgs: { role: string; content: string }[],
    type: "generate" | "edit" | "chat"
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      toast.error("Please sign in to use the AI Scheduler");
      throw new Error("Not authenticated");
    }

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-scheduler`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: msgs, type }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "AI request failed");
    }

    return res.json();
  };

  const generateSchedule = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your study needs");
      return;
    }

    setLoading(true);
    const userMsg: ChatMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setActiveTab("chat");

    try {
      const result = await callAI(
        [{ role: "user", content: `Generate a study schedule based on: ${prompt}` }],
        "generate"
      );

      if (result.type === "schedule" && result.data) {
        const { schedule: newSchedule, summary: newSummary, tips: newTips } = result.data;
        setSchedule(newSchedule.map((s: ScheduleItem) => ({ ...s, completed: false })));
        setSummary(newSummary);
        setTips(newTips || []);
        setGeneratedOn(new Date().toLocaleString());

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: newSummary,
          timestamp: new Date(),
          scheduleData: result.data,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Save to history
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from("ai_generations").insert([{
            user_id: userData.user.id,
            tool_type: "scheduler",
            prompt: prompt.trim(),
            result_data: result.data as any,
            status: "completed",
          }]);
        }

        toast.success("Schedule generated!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate schedule");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message}`, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || loading) return;

    const input = chatInput.trim();
    setChatInput("");
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Build conversation history for context
      const contextMessages = messages.map((m) => ({
        role: m.role,
        content: m.scheduleData
          ? `${m.content}\n\nCurrent schedule: ${JSON.stringify(m.scheduleData.schedule)}`
          : m.content,
      }));

      // Include current schedule context
      if (schedule.length > 0) {
        contextMessages.push({
          role: "user" as const,
          content: `Current schedule: ${JSON.stringify(schedule)}\n\nUser request: ${input}`,
        });
      } else {
        contextMessages.push({ role: "user", content: input });
      }

      // Determine if this is an edit request or general chat
      const isEditRequest = /change|modify|update|edit|swap|move|add|remove|replace|reschedule|shift/i.test(input);
      const type = isEditRequest && schedule.length > 0 ? "edit" : "chat";

      const result = await callAI(contextMessages, type);

      if (result.type === "schedule" && result.data) {
        setSchedule(result.data.schedule.map((s: ScheduleItem) => ({ ...s, completed: false })));
        setSummary(result.data.summary);
        setTips(result.data.tips || []);
        setGeneratedOn(new Date().toLocaleString());

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.data.summary,
            timestamp: new Date(),
            scheduleData: result.data,
          },
        ]);
        toast.success("Schedule updated!");
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.content, timestamp: new Date() },
        ]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message}`, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
    toast.success("Session removed");
  };

  const exportSchedule = () => {
    const text = schedule
      .map((s) => `${s.time} | ${s.subject} - ${s.topic} (${s.priority}) ${s.notes ? `[${s.notes}]` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Schedule copied to clipboard!");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const completedCount = schedule.filter((s) => s.completed).length;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Study Scheduler</h1>
            <p className="text-sm text-muted-foreground">
              Generate & refine personalized study schedules with AI
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Input & Chat */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Switch */}
          <div className="flex rounded-lg border bg-card overflow-hidden">
            <button
              onClick={() => setActiveTab("setup")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === "setup"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Target className="h-4 w-4" />
              Setup
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === "chat"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Chat Editor
              {messages.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {messages.length}
                </Badge>
              )}
            </button>
          </div>

          {activeTab === "setup" ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Study Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your study needs, e.g.:\n\n• I need to study Math, Physics, Chemistry\n• I prefer mornings for hard subjects\n• Available 6AM - 6PM with lunch break\n• Exams start next Monday\n• Chemistry is my weakest subject"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={10}
                  className="resize-none text-sm"
                />

                <Button
                  onClick={generateSchedule}
                  disabled={loading || !prompt.trim()}
                  className="w-full"
                  size="lg"
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

                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-medium flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    Tips for better results
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-5">
                    <li>• Mention subjects & their priority levels</li>
                    <li>• Specify available hours & preferred times</li>
                    <li>• Include breaks, meals, extracurriculars</li>
                    <li>• Note weak subjects needing more time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
              <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Schedule Chat Editor
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Ask AI to modify your schedule, add sessions, or get study advice
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-3 pt-0 overflow-hidden">
                <ScrollArea className="flex-1 pr-3">
                  <div className="space-y-3 py-2">
                    {messages.length === 0 && (
                      <div className="text-center py-8 space-y-3">
                        <Bot className="h-10 w-10 mx-auto text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          Generate a schedule first, then chat to refine it
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {["Add a break at noon", "Move Physics earlier", "Add revision slots"].map((s) => (
                            <button
                              key={s}
                              onClick={() => setChatInput(s)}
                              className="text-xs px-3 py-1.5 rounded-full border bg-muted/50 hover:bg-muted transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          {msg.scheduleData && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-xs opacity-70">
                                📅 {msg.scheduleData.schedule.length} sessions generated
                              </p>
                            </div>
                          )}
                          <p className="text-[10px] opacity-50 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {msg.role === "user" && (
                          <div className="shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-2">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-xl px-3 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-2 border-t mt-2 shrink-0">
                  <Input
                    placeholder="e.g. 'Add a 30min break at noon'"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                    disabled={loading}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={sendChatMessage}
                    disabled={loading || !chatInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Schedule Display */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Your Study Schedule
                  {schedule.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {completedCount}/{schedule.length} done
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {generatedOn && (
                    <span className="text-xs text-muted-foreground">
                      {generatedOn}
                    </span>
                  )}
                  {schedule.length > 0 && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={exportSchedule}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setSchedule([]);
                          setMessages([]);
                          setSummary("");
                          setTips([]);
                          setGeneratedOn("");
                          setActiveTab("setup");
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {schedule.length > 0 && (
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / schedule.length) * 100}%` }}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <div className="py-16 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground mb-1 font-medium">No schedule yet</p>
                  <p className="text-sm text-muted-foreground">
                    Describe your study needs and let AI create your perfect schedule
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary */}
                  {summary && (
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-4">
                      <p className="text-sm text-foreground/80">{summary}</p>
                    </div>
                  )}

                  {/* Schedule Items */}
                  {schedule.map((item, index) => (
                    <div
                      key={index}
                      className={`group relative rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                        item.completed
                          ? "border-emerald-500/20 bg-emerald-500/5 opacity-60"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 pt-0.5">
                          <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className={`text-[10px] ${getPriorityColor(item.priority)}`}>
                              {item.priority.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.time}
                            </span>
                          </div>
                          <h3 className={`font-semibold ${item.completed ? "line-through" : ""}`}>
                            {item.subject}
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.topic}</p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground/70 mt-1 italic">
                              💡 {item.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {item.duration}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant={item.completed ? "default" : "outline"}
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => toggleComplete(index)}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            {item.completed ? "Done" : "Complete"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tips */}
                  {tips.length > 0 && (
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 mt-4">
                      <p className="text-xs font-medium flex items-center gap-1.5 mb-2">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                        AI Study Tips
                      </p>
                      <ul className="space-y-1">
                        {tips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
