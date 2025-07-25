import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, 
  Send, 
  Brain, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Calculator, 
  Globe, 
  Lightbulb,
  Clock,
  Users,
  Zap,
  FileText,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateMessageContent, checkClientRateLimit } from "@/lib/security";
import { openAIStorage, validateSession } from "@/lib/apiKeyStorage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  category?: 'homework' | 'explain' | 'practice' | 'translate' | 'schedule' | 'general';
  rating?: 'up' | 'down';
}

interface StudySession {
  id: string;
  title: string;
  messages: ChatMessage[];
  subject: string;
  createdAt: string;
  lastActivity: string;
}

interface QuickAction {
  id: string;
  title: string;
  prompt: string;
  icon: React.ReactNode;
  category: string;
}

const AIStudyBuddy = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [personality, setPersonality] = useState('friendly');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'homework',
      title: 'Help with Homework',
      prompt: 'I need help with my homework. Can you assist me with: ',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'homework'
    },
    {
      id: 'explain',
      title: 'Explain Concept',
      prompt: 'Can you explain this concept in simple terms: ',
      icon: <Lightbulb className="w-4 h-4" />,
      category: 'explain'
    },
    {
      id: 'practice',
      title: 'Generate Practice Questions',
      prompt: 'Create practice questions for me on the topic: ',
      icon: <Brain className="w-4 h-4" />,
      category: 'practice'
    },
    {
      id: 'solve',
      title: 'Solve Math Problem',
      prompt: 'Help me solve this math problem step by step: ',
      icon: <Calculator className="w-4 h-4" />,
      category: 'homework'
    },
    {
      id: 'translate',
      title: 'Translate & Explain',
      prompt: 'Translate this and explain the grammar: ',
      icon: <Globe className="w-4 h-4" />,
      category: 'translate'
    },
    {
      id: 'schedule',
      title: 'Study Schedule',
      prompt: 'Help me create a study schedule for: ',
      icon: <Clock className="w-4 h-4" />,
      category: 'schedule'
    }
  ];

  // Load data from localStorage and validate session
  useEffect(() => {
    if (!validateSession()) {
      toast({
        title: "Session Expired",
        description: "Please refresh the page and re-enter your API keys",
        variant: "destructive",
      });
      return;
    }

    const savedSessions = localStorage.getItem('studyverse-ai-sessions');
    
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0 && !activeSession) {
          setActiveSession(parsed[0].id);
          setMessages(parsed[0].messages || []);
        }
      } catch (error) {
        console.error('Error loading AI sessions:', error);
      }
    }
    
    // Load secure API key
    openAIStorage.getKey().then(secureApiKey => {
      if (secureApiKey) {
        setApiKey(secureApiKey);
      }
    }).catch(error => {
      console.error('Error loading API key:', error);
    });
    
    // Load other settings from localStorage (non-sensitive)
    const savedSettings = localStorage.getItem('studyverse-ai-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setModel(settings.model || 'gpt-4o-mini');
        setPersonality(settings.personality || 'friendly');
      } catch (error) {
        console.error('Error loading AI settings:', error);
      }
    }
  }, []);

  // Save data to localStorage (sessions) and secure storage (API key)
  useEffect(() => {
    localStorage.setItem('studyverse-ai-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    // Save API key securely
    if (apiKey) {
      openAIStorage.setKey(apiKey);
    } else {
      openAIStorage.removeKey();
    }
    
    // Save non-sensitive settings to localStorage
    localStorage.setItem('studyverse-ai-settings', JSON.stringify({
      model,
      personality
    }));
  }, [apiKey, model, personality]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewSession = (subject = 'General') => {
    const newSession: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Study Session - ${new Date().toLocaleDateString()}`,
      messages: [],
      subject,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSession(newSession.id);
    setMessages([]);
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'ai',
      content: `Hi there! 👋 I'm your AI Study Buddy. I'm here to help you with homework, explain concepts, create practice questions, and make your learning journey more effective. What would you like to study today?`,
      timestamp: new Date().toISOString(),
      category: 'general'
    };
    
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (content: string, category?: ChatMessage['category']) => {
    // Validate content
    const contentValidation = validateMessageContent(content);
    if (!contentValidation.valid) {
      toast({
        title: "Invalid Message",
        description: contentValidation.message,
        variant: "destructive",
      });
      return;
    }

    // Check client-side rate limiting
    if (!checkClientRateLimit('ai_chat', 20, 60 * 60 * 1000)) { // 20 messages per hour
      toast({
        title: "Rate Limit Exceeded",
        description: "You've sent too many messages. Please wait before sending another.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use AI features",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content,
      timestamp: new Date().toISOString(),
      category
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Call secure edge function instead of client-side OpenAI
      const { data, error } = await supabase.functions.invoke('secure-ai-chat', {
        body: { prompt: content, category }
      });

      if (error) {
        throw error;
      }

      if (data.needsApiKey) {
        toast({
          title: "API Key Required",
          description: "OpenAI API key not configured. Please contact administrator.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const aiMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'ai',
        content: data.response,
        timestamp: new Date().toISOString(),
        category
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Update active session
      if (activeSession) {
        setSessions(prev => prev.map(session => 
          session.id === activeSession 
            ? { 
                ...session, 
                messages: finalMessages, 
                lastActivity: new Date().toISOString(),
                title: finalMessages.length === 2 ? content.slice(0, 50) + '...' : session.title
              }
            : session
        ));
      }

    } catch (error: any) {
      console.error('AI chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (userInput: string, category?: string): string => {
    const responses = {
      homework: [
        "I'd be happy to help you with your homework! Let me break this down step by step...",
        "Great question! Here's how we can approach this problem...",
        "Let's work through this together. First, let's identify what we know..."
      ],
      explain: [
        "Excellent question! Let me explain this concept in simple terms...",
        "This is a fundamental concept. Here's how it works...",
        "Think of it this way... (includes a helpful analogy)"
      ],
      practice: [
        "Here are some practice questions to test your understanding:\n\n1. [Question 1]\n2. [Question 2]\n3. [Question 3]",
        "Let's create some exercises for you! Here are different types of questions...",
        "Perfect for practice! I'll generate questions at different difficulty levels..."
      ],
      translate: [
        "Here's the translation with grammatical explanation...",
        "The translation is: [translation] \n\nGrammar notes: [explanation]",
        "This translates to... Let me explain the grammar structure..."
      ],
      schedule: [
        "Here's a personalized study schedule based on your needs...",
        "Let's create an effective study plan! Here's what I recommend...",
        "Based on your subjects and available time, here's an optimal schedule..."
      ]
    };

    const categoryResponses = responses[category as keyof typeof responses] || [
      "That's an interesting question! Here's what I think...",
      "Great question! Let me help you with that...",
      "I understand what you're asking. Here's my response..."
    ];

    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
    
    toast({
      title: rating === 'up' ? "Thanks for the feedback! 👍" : "Feedback noted 👎",
      description: "This helps me improve my responses",
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied! 📋",
      description: "Message copied to clipboard",
    });
  };

  const clearChat = () => {
    setMessages([]);
    if (activeSession) {
      setSessions(prev => prev.map(session => 
        session.id === activeSession 
          ? { ...session, messages: [] }
          : session
      ));
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setCurrentInput(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentInput);
    }
  };

  if (!activeSession && sessions.length === 0) {
    createNewSession();
  }

  return (
    <Card className="widget h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Study Buddy
                <Badge variant="secondary" className="text-xs">
                  {personality === 'friendly' ? '😊 Friendly' : 
                   personality === 'professional' ? '🎓 Pro' : '🤖 Technical'}
                </Badge>
              </CardTitle>
               <p className="text-sm text-muted-foreground">
                 AI Doubt Resolver
               </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => createNewSession()}
              className="glass-button"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="glass-button"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="justify-start text-xs"
            >
              {action.icon}
              <span className="ml-2 truncate">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {message.type === 'ai' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rateMessage(message.id, 'up')}
                        className={`h-6 w-6 p-0 ${message.rating === 'up' ? 'text-green-500' : ''}`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rateMessage(message.id, 'down')}
                        className={`h-6 w-6 p-0 ${message.rating === 'down' ? 'text-red-500' : ''}`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 pt-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="min-h-[44px] max-h-32 resize-none pr-12"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={() => sendMessage(currentInput)}
                disabled={!currentInput.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chatbase Iframe */}
        <div className="mt-6 h-[300px] border rounded-lg overflow-hidden">
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/hhBF5Dz69MamfJ2WaVo5E"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="AI Doubt Resolver Chatbot"
          />
        </div>
      </CardContent>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h4 className="font-semibold mb-4">AI Assistant Settings</h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">OpenAI API Key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your API key from OpenAI dashboard
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Model</label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</SelectItem>
                    <SelectItem value="gpt-4">GPT-4 (Smart)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Personality</label>
                <Select value={personality} onValueChange={setPersonality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">😊 Friendly & Encouraging</SelectItem>
                    <SelectItem value="professional">🎓 Professional Tutor</SelectItem>
                    <SelectItem value="technical">🤖 Technical & Precise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowSettings(false)} className="flex-1">
                Save Settings
              </Button>
              <Button variant="outline" onClick={clearChat}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIStudyBuddy;