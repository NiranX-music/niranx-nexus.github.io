import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, 
  MicOff, 
  FileText, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  Users,
  Clock,
  ListTodo,
  Sparkles,
  Save,
  Trash2,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIProviderSelector, useAIProvider } from "@/components/ai/AIProviderSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  duration: string;
  transcript: string;
  summary: string;
  actionItems: string[];
  attendees: string[];
  keyPoints: string[];
}

export default function AIMeetingMinutes() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [attendees, setAttendees] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [savedMeetings, setSavedMeetings] = useState<MeetingNote[]>([]);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('meeting-minutes');
  const { user } = useAuth();

  // Load saved meetings
  useEffect(() => {
    if (user) {
      loadSavedMeetings();
    }
  }, [user]);

  const loadSavedMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generations")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tool_type", "meeting_minutes")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const meetings = data?.map((item: any) => ({
        id: item.id,
        title: item.result_data?.title || "Untitled Meeting",
        date: item.created_at,
        duration: item.result_data?.duration || "N/A",
        transcript: item.result_data?.transcript || "",
        summary: item.result_data?.summary || "",
        actionItems: item.result_data?.actionItems || [],
        attendees: item.result_data?.attendees || [],
        keyPoints: item.result_data?.keyPoints || [],
      })) || [];

      setSavedMeetings(meetings);
    } catch (error) {
      console.error("Error loading meetings:", error);
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      toast({
        title: "Recording error",
        description: `Error: ${event.error}`,
        variant: "destructive",
      });
      setIsRecording(false);
    };

    recognitionRef.current.start();
    setIsRecording(true);
    toast({
      title: "Recording started",
      description: "Speak clearly and the transcript will appear below",
    });
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    toast({
      title: "Recording stopped",
      description: "You can now process the transcript",
    });
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No transcript",
        description: "Please record or enter a transcript first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await supabase.functions.invoke("ai-meeting-minutes", {
        body: {
          transcript,
          meetingTitle: meetingTitle || "Untitled Meeting",
          attendees: attendees.split(",").map(a => a.trim()).filter(Boolean),
          provider,
          model,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      setSummary(data.summary || "");
      setActionItems(data.actionItems || []);
      setKeyPoints(data.keyPoints || []);

      toast({
        title: "Processing complete",
        description: "Meeting notes have been generated",
      });
    } catch (error: any) {
      console.error("Error processing transcript:", error);
      
      let errorMessage = "Failed to process transcript. Please try again.";
      if (error.message?.includes("429")) {
        errorMessage = "Rate limit reached. Please wait and try again.";
      } else if (error.message?.includes("402")) {
        errorMessage = "API quota exceeded. Try a different AI provider.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveMeeting = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save meetings",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("ai_generations").insert({
        user_id: user.id,
        tool_type: "meeting_minutes",
        prompt: transcript.substring(0, 500),
        result_data: {
          title: meetingTitle || "Untitled Meeting",
          transcript,
          summary,
          actionItems,
          keyPoints,
          attendees: attendees.split(",").map(a => a.trim()).filter(Boolean),
          duration: "N/A",
        },
      });

      if (error) throw error;

      toast({
        title: "Meeting saved",
        description: "Your meeting notes have been saved",
      });

      loadSavedMeetings();
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast({
        title: "Error",
        description: "Failed to save meeting",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    const content = `# ${meetingTitle || "Meeting Notes"}

## Summary
${summary}

## Key Points
${keyPoints.map(p => `- ${p}`).join("\n")}

## Action Items
${actionItems.map(a => `- [ ] ${a}`).join("\n")}

## Full Transcript
${transcript}
`;

    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Meeting notes copied to clipboard",
    });
  };

  const downloadMarkdown = () => {
    const content = `# ${meetingTitle || "Meeting Notes"}

## Summary
${summary}

## Key Points
${keyPoints.map(p => `- ${p}`).join("\n")}

## Action Items
${actionItems.map(a => `- [ ] ${a}`).join("\n")}

## Full Transcript
${transcript}
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meetingTitle || "meeting-notes"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setTranscript("");
    setMeetingTitle("");
    setAttendees("");
    setSummary("");
    setActionItems([]);
    setKeyPoints([]);
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI Meeting Minutes
            </h1>
            <p className="text-muted-foreground">
              Record, transcribe, and summarize your meetings with AI
            </p>
          </div>
        </div>
        <AIProviderSelector selectedProvider={provider} selectedModel={model} onProviderChange={setProvider} onModelChange={setModel} />
      </motion.div>

      <Tabs defaultValue="record" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="record">Record Meeting</TabsTrigger>
          <TabsTrigger value="saved">Saved Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recording Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" />
                    Recording
                  </CardTitle>
                  <CardDescription>
                    Record or paste your meeting transcript
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Meeting Title</label>
                      <Input
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="Weekly standup..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Attendees</label>
                      <Input
                        value={attendees}
                        onChange={(e) => setAttendees(e.target.value)}
                        placeholder="John, Sarah, Mike..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-center py-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
                        isRecording
                          ? "bg-destructive text-destructive-foreground animate-pulse"
                          : "bg-gradient-to-br from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
                      )}
                    >
                      {isRecording ? (
                        <MicOff className="h-10 w-10" />
                      ) : (
                        <Mic className="h-10 w-10" />
                      )}
                    </motion.button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                  </p>

                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Transcript will appear here as you speak, or paste your transcript..."
                    className="min-h-[200px]"
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={processTranscript}
                      disabled={isProcessing || !transcript.trim()}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Process with AI
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Meeting Notes
                    </CardTitle>
                    <CardDescription>
                      AI-generated summary and action items
                    </CardDescription>
                  </div>
                  {summary && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={saveMeeting}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {/* Summary */}
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Summary
                        </h3>
                        {summary ? (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {summary}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 italic">
                            Process a transcript to see the summary
                          </p>
                        )}
                      </div>

                      {/* Key Points */}
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          Key Points
                        </h3>
                        {keyPoints.length > 0 ? (
                          <ul className="space-y-2">
                            {keyPoints.map((point, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Badge variant="secondary" className="shrink-0 mt-0.5">
                                  {index + 1}
                                </Badge>
                                <span>{point}</span>
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 italic">
                            No key points extracted yet
                          </p>
                        )}
                      </div>

                      {/* Action Items */}
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <ListTodo className="h-4 w-4 text-success" />
                          Action Items
                        </h3>
                        {actionItems.length > 0 ? (
                          <ul className="space-y-2">
                            {actionItems.map((item, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50"
                              >
                                <input type="checkbox" className="mt-1 rounded" />
                                <span>{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground/50 italic">
                            No action items identified yet
                          </p>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Meetings</CardTitle>
              <CardDescription>
                Your previously recorded and processed meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedMeetings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedMeetings.map((meeting, index) => (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{meeting.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(meeting.date).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {meeting.summary || "No summary available"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {meeting.actionItems.length} actions
                            </Badge>
                            <Badge variant="outline">
                              {meeting.keyPoints.length} points
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No saved meetings yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Record and save a meeting to see it here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
