import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, FileAudio, Sparkles, Copy, Download, Loader2, Play, Pause, RotateCcw, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion } from 'framer-motion';

interface Transcript {
  id: string;
  title: string;
  text: string;
  summary?: string;
  keyPoints?: string[];
  timestamp: Date;
}

export default function LectureTranscriber() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('lecture-transcriber');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptTitle, setTranscriptTitle] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<Transcript[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('record');
  const recognitionRef = useRef<any>(null);

  // Check for Web Speech API support
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const hasSupport = !!SpeechRecognition;

  const startRecording = () => {
    if (!hasSupport) {
      toast({ title: 'Speech recognition not supported', description: 'Please use Chrome or Edge', variant: 'destructive' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast({ title: 'Recording error', description: event.error, variant: 'destructive' });
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start(); // Restart if still recording
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast({ title: 'Recording started', description: 'Speak clearly into your microphone' });
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    toast({ title: 'Recording stopped' });
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      toast({ title: 'No transcript to process', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      const prompt = `Analyze this lecture transcript and provide:
1. A concise summary (2-3 paragraphs)
2. Key points (bullet points of main ideas)
3. Clean up any transcription errors if obvious

Transcript:
${transcript}

Return JSON:
{
  "summary": "summary text",
  "keyPoints": ["point 1", "point 2", ...],
  "cleanedTranscript": "cleaned version of transcript"
}`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: model,
        },
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      let summary = '';
      let keyPoints: string[] = [];
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        summary = parsed.summary || '';
        keyPoints = parsed.keyPoints || [];
        if (parsed.cleanedTranscript) {
          setTranscript(parsed.cleanedTranscript);
        }
      }

      const newTranscript: Transcript = {
        id: Date.now().toString(),
        title: transcriptTitle || `Lecture ${new Date().toLocaleDateString()}`,
        text: transcript,
        summary,
        keyPoints,
        timestamp: new Date(),
      };

      setSavedTranscripts([newTranscript, ...savedTranscripts]);
      toast({ title: 'Transcript processed!', description: 'Summary and key points generated' });
    } catch (error) {
      console.error('Processing error:', error);
      toast({ title: 'Failed to process transcript', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTranscript = () => {
    if (!transcript.trim()) {
      toast({ title: 'No transcript to save', variant: 'destructive' });
      return;
    }

    const newTranscript: Transcript = {
      id: Date.now().toString(),
      title: transcriptTitle || `Lecture ${new Date().toLocaleDateString()}`,
      text: transcript,
      timestamp: new Date(),
    };

    setSavedTranscripts([newTranscript, ...savedTranscripts]);
    setTranscript('');
    setTranscriptTitle('');
    toast({ title: 'Transcript saved!' });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const downloadTranscript = (t: Transcript) => {
    const content = `${t.title}\n${'='.repeat(t.title.length)}\n\nDate: ${t.timestamp.toLocaleString()}\n\n${t.summary ? `SUMMARY:\n${t.summary}\n\n` : ''}${t.keyPoints?.length ? `KEY POINTS:\n${t.keyPoints.map(p => `• ${p}`).join('\n')}\n\n` : ''}FULL TRANSCRIPT:\n${t.text}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
          <Mic className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Lecture Transcriber</h1>
          <p className="text-muted-foreground">Record, transcribe, and summarize lectures</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="record">Record & Transcribe</TabsTrigger>
          <TabsTrigger value="saved">Saved Transcripts ({savedTranscripts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recording Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {isRecording ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Mic className="h-5 w-5 text-red-500" />
                      </motion.div>
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                    {isRecording ? 'Recording...' : 'Record Lecture'}
                  </CardTitle>
                  {isRecording && (
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Lecture Title</Label>
                  <Input
                    placeholder="Enter lecture title..."
                    value={transcriptTitle}
                    onChange={(e) => setTranscriptTitle(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button onClick={startRecording} className="flex-1" disabled={!hasSupport}>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive" className="flex-1">
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setTranscript('')}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {!hasSupport && (
                  <p className="text-sm text-destructive">
                    Speech recognition is not supported in your browser. Please use Chrome or Edge.
                  </p>
                )}

                <div className="space-y-2">
                  <Label>Transcript</Label>
                  <Textarea
                    placeholder="Transcript will appear here as you speak...

You can also paste or type text manually."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {transcript.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTranscript} variant="outline" className="flex-1">
                    Save
                  </Button>
                  <Button onClick={() => copyToClipboard(transcript)} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AIProviderSelector
                  selectedProvider={provider}
                  selectedModel={model}
                  onProviderChange={setProvider}
                  onModelChange={setModel}
                />

                <Button 
                  onClick={processTranscript} 
                  disabled={isProcessing || !transcript.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary & Key Points
                    </>
                  )}
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>AI will:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Create a concise summary</li>
                    <li>Extract key points and concepts</li>
                    <li>Clean up transcription errors</li>
                    <li>Organize content for studying</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          {savedTranscripts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <FileAudio className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No saved transcripts</p>
                <p className="text-sm">Record a lecture to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedTranscripts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{t.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {t.timestamp.toLocaleString()} • {t.text.split(/\s+/).filter(Boolean).length} words
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(t.text)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => downloadTranscript(t)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {t.summary && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Summary
                          </h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">{t.summary}</p>
                        </div>
                      )}

                      {t.keyPoints && t.keyPoints.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Key Points</h4>
                          <ul className="space-y-1">
                            {t.keyPoints.map((point, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <details className="group">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          Show full transcript
                        </summary>
                        <p className="mt-2 text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                          {t.text}
                        </p>
                      </details>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
