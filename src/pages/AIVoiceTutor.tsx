import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, BookOpen, Settings, Trash2, Save, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
}

const VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Warm British male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Soft American female' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Young American male' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Warm Australian female' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Deep British male' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'British female' },
];

const SUBJECTS = [
  'General Education',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Literature',
  'Languages',
  'Philosophy',
];

export default function AIVoiceTutor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [subject, setSubject] = useState('General Education');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [autoPlay, setAutoPlay] = useState(true);
  const [volume, setVolume] = useState([80]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  const { provider, model, setProvider, setModel } = useAIProvider('voice-tutor');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAudio = useCallback(async (text: string, messageId: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    setIsSpeaking(true);
    setPlayingMessageId(messageId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text,
            voiceId: selectedVoice.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = volume[0] / 100;
      
      audio.onended = () => {
        setIsSpeaking(false);
        setPlayingMessageId(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setPlayingMessageId(null);
        setCurrentAudio(null);
        toast.error('Failed to play audio');
      };

      setCurrentAudio(audio);
      await audio.play();

      // Update message with audio URL
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, audioUrl } : m
      ));
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      setPlayingMessageId(null);
      toast.error('Failed to generate speech');
    }
  }, [selectedVoice.id, volume, currentAudio]);

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
    setPlayingMessageId(null);
  }, [currentAudio]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('voice-tutor-chat', {
        body: {
          messages: chatMessages,
          subject,
          provider,
          model,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (autoPlay) {
        await playAudio(data.content, assistantMessage.id);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message?.includes('402') || error.message?.includes('Payment')) {
        toast.error('Credits exhausted. Please add credits to continue.');
      } else {
        toast.error(error.message || 'Failed to get response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    stopAudio();
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Voice Tutor</h1>
              <p className="text-muted-foreground text-sm">Learn with natural voice conversations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-[180px]">
                <BookOpen className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Voice Settings</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <Label>AI Provider</Label>
                    <AIProviderSelector
                      selectedProvider={provider}
                      selectedModel={model}
                      onProviderChange={setProvider}
                      onModelChange={setModel}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Voice</Label>
                    <Select
                      value={selectedVoice.id}
                      onValueChange={id => setSelectedVoice(VOICES.find(v => v.id === id) || VOICES[0])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICES.map(voice => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <div className="flex flex-col">
                              <span>{voice.name}</span>
                              <span className="text-xs text-muted-foreground">{voice.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Volume</Label>
                    <div className="flex items-center gap-3">
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Auto-play responses</Label>
                    <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {messages.length > 0 && (
              <Button variant="outline" size="icon" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <Card className="h-[60vh]">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything about {subject}. I'll explain concepts clearly and you can listen to my responses with natural voice synthesis.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['Explain quantum physics', 'Help me with calculus', 'What is photosynthesis?'].map(suggestion => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (playingMessageId === message.id) {
                                  stopAudio();
                                } else {
                                  playAudio(message.content, message.id);
                                }
                              }}
                              disabled={isSpeaking && playingMessageId !== message.id}
                            >
                              {playingMessageId === message.id ? (
                                <>
                                  <Pause className="h-3 w-3 mr-1" />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3 mr-1" />
                                  Play
                                </>
                              )}
                            </Button>
                            {playingMessageId === message.id && (
                              <Badge variant="secondary" className="animate-pulse">
                                <Volume2 className="h-3 w-3 mr-1" />
                                Speaking...
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Ask about ${subject}...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Current Voice Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Volume2 className="h-4 w-4" />
          <span>Voice: {selectedVoice.name}</span>
          <span className="text-border">•</span>
          <span>Provider: {provider}</span>
        </div>
      </motion.div>
    </div>
  );
}
