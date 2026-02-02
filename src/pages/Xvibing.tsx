import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Loader2, 
  Plus, 
  Trash2, 
  Bot, 
  User, 
  Sparkles,
  History,
  MessageSquare,
  Code,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  FileCode
} from 'lucide-react';
import { format } from 'date-fns';
import ReactSyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const BLACKBOX_MODELS = [
  { id: 'blackboxai', name: 'BlackBox AI', description: 'General purpose coding assistant' },
  { id: 'blackboxai-pro', name: 'BlackBox Pro', description: 'Advanced coding model' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI GPT-4 Omni' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Anthropic Claude 3' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google Gemini' },
];

const Xvibing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('blackboxai');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    
    // Using bytez_conversations table for now (can be migrated to dedicated table later)
    const { data, error } = await supabase
      .from('bytez_conversations')
      .select('*')
      .eq('user_id', user.id)
      .like('model', 'blackbox%')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('bytez_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages((data || []).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      created_at: msg.created_at
    })));
  };

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bytez_conversations')
      .insert({
        user_id: user.id,
        title: 'New Xvibing Chat',
        model: `blackbox-${selectedModel}`
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return;
    }

    setConversations(prev => [data, ...prev]);
    setCurrentConversation(data.id);
    setMessages([]);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('bytez_conversations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation === id) {
      setCurrentConversation(null);
      setMessages([]);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied to clipboard' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    let conversationId = currentConversation;

    if (!conversationId) {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('bytez_conversations')
        .insert({
          user_id: user.id,
          title: input.slice(0, 50) || 'New Xvibing Chat',
          model: `blackbox-${selectedModel}`
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive"
        });
        return;
      }

      conversationId = data.id;
      setCurrentConversation(data.id);
      setConversations(prev => [data, ...prev]);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Save user message
      await supabase.from('bytez_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage.content,
      });

      // Call BlackBox API
      const { data, error } = await supabase.functions.invoke('blackbox-chat', {
        body: {
          model: selectedModel,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content || 'No response received',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message
      await supabase.from('bytez_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantMessage.content
      });

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        await supabase
          .from('bytez_conversations')
          .update({ title: input.slice(0, 50) })
          .eq('id', conversationId);
        
        setConversations(prev => 
          prev.map(c => c.id === conversationId ? { ...c, title: input.slice(0, 50) } : c)
        );
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response from Xvibing",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string, messageId: string) => {
    // Detect code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      const language = match[1] || 'plaintext';
      const code = match[2];

      parts.push(
        <div key={`code-${match.index}`} className="my-3 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between bg-muted/80 px-3 py-1.5 text-xs">
            <span className="text-muted-foreground font-mono">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => copyToClipboard(code, `${messageId}-${match!.index}`)}
            >
              {copiedId === `${messageId}-${match.index}` ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <ReactSyntaxHighlighter
            language={language}
            style={atomOneDark}
            customStyle={{ margin: 0, borderRadius: 0 }}
          >
            {code}
          </ReactSyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card border-primary/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
              <Terminal className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Xvibing</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access Xvibing AI Coding Assistant</p>
            <Button onClick={() => window.location.href = '/niranx/auth'} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Hero Section */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-black/30 via-gray-800/30 to-green-500/20 backdrop-blur-sm border border-green-500/30 mb-4">
          <div className="relative">
            <Terminal className="w-12 h-12 text-green-400 animate-pulse" />
            <FileCode className="w-5 h-5 text-primary absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Xvibing
            </h1>
            <p className="text-sm text-muted-foreground">BlackBox AI Coding Assistant</p>
          </div>
          <Code className="w-8 h-8 text-cyan-400 animate-float" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30">
            <Code className="w-3 h-3 mr-1" /> Code Generation
          </Badge>
          <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30">
            <Zap className="w-3 h-3 mr-1" /> Fast Responses
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30">
            <Sparkles className="w-3 h-3 mr-1" /> Multi-Model
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Conversations */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-green-500/20 h-[calc(100vh-300px)] min-h-[500px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-green-400" />
                    Chats
                  </CardTitle>
                  <Button size="sm" onClick={createNewConversation} className="gap-1 bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4" /> New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[calc(100vh-420px)] min-h-[380px]">
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs">Start coding with AI!</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all group ${
                            currentConversation === conv.id
                              ? 'bg-green-500/20 border border-green-500/40'
                              : 'hover:bg-muted/50 border border-transparent'
                          }`}
                          onClick={() => setCurrentConversation(conv.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(conv.updated_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conv.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-green-500/20 h-[calc(100vh-300px)] min-h-[500px] flex flex-col">
              {/* Model Selector */}
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <Terminal className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Model:</span>
                  <div className="flex gap-1 flex-wrap">
                    {BLACKBOX_MODELS.map(model => (
                      <Button
                        key={model.id}
                        size="sm"
                        variant={selectedModel === model.id ? "default" : "outline"}
                        className={`h-7 text-xs ${selectedModel === model.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        {model.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-16">
                      <Terminal className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
                      <h3 className="text-xl font-semibold mb-2">Start Coding with Xvibing</h3>
                      <p className="text-muted-foreground mb-6">
                        Ask me to write code, debug issues, explain concepts, or help with any programming task!
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "Write a React component",
                          "Debug my Python code",
                          "Explain async/await",
                          "Create an API endpoint"
                        ].map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            className="border-green-500/30 hover:bg-green-500/10"
                            onClick={() => setInput(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 ${
                            msg.role === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-muted/80'
                          }`}
                        >
                          {renderMessageContent(msg.content, msg.id)}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted/80 rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-green-400" />
                          <span className="text-sm text-muted-foreground">Generating code...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-3 max-w-4xl mx-auto">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask Xvibing to help with code..."
                    className="resize-none min-h-[50px] max-h-[150px]"
                    rows={1}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Xvibing;
