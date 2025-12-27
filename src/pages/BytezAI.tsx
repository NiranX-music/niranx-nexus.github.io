import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Loader2, 
  Plus, 
  Trash2, 
  Bot, 
  User, 
  Sparkles,
  History,
  MessageSquare,
  Zap,
  Brain,
  Upload,
  X,
  Star,
  Cpu,
  Wand2
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { type: string; data: string; name?: string }[];
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  category: string;
}

const AI_MODELS: AIModel[] = [
  // Vision Models
  { id: 'Qwen/Qwen2-VL-72B-Instruct', name: 'Qwen2 VL 72B', description: 'Best for complex vision tasks', category: 'Vision' },
  { id: 'Qwen/Qwen2.5-VL-72B-Instruct', name: 'Qwen2.5 VL 72B', description: 'Latest Qwen vision model', category: 'Vision' },
  { id: 'Qwen/Qwen2.5-VL-7B-Instruct', name: 'Qwen2.5 VL 7B', description: 'Efficient vision model', category: 'Vision' },
  { id: 'mistralai/Pixtral-Large-Instruct-2411', name: 'Pixtral Large', description: 'Mistral vision model', category: 'Vision' },
  { id: 'meta-llama/Llama-3.2-90B-Vision-Instruct', name: 'Llama 3.2 90B Vision', description: 'Meta vision model', category: 'Vision' },
  { id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', name: 'Llama 3.2 11B Vision', description: 'Compact Meta vision', category: 'Vision' },
  { id: 'microsoft/Phi-3.5-vision-instruct', name: 'Phi 3.5 Vision', description: 'Microsoft vision model', category: 'Vision' },
  
  // Chat & Reasoning Models
  { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B', description: 'Powerful reasoning model', category: 'Chat' },
  { id: 'Qwen/QwQ-32B', name: 'QwQ 32B', description: 'Advanced reasoning', category: 'Chat' },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', description: 'Latest Llama chat', category: 'Chat' },
  { id: 'meta-llama/Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', description: 'Largest Llama model', category: 'Chat' },
  { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', description: 'Balanced Llama chat', category: 'Chat' },
  { id: 'mistralai/Mistral-Large-Instruct-2411', name: 'Mistral Large', description: 'Mistral flagship', category: 'Chat' },
  { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', description: 'Advanced reasoning', category: 'Chat' },
  { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', description: 'Latest DeepSeek', category: 'Chat' },
  
  // Code Models
  { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen2.5 Coder 32B', description: 'Expert code generation', category: 'Code' },
  { id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct', name: 'DeepSeek Coder V2', description: 'Code specialist', category: 'Code' },
  { id: 'codellama/CodeLlama-70b-Instruct-hf', name: 'CodeLlama 70B', description: 'Meta code model', category: 'Code' },
  
  // Math & Science Models
  { id: 'Qwen/Qwen2.5-Math-72B-Instruct', name: 'Qwen2.5 Math 72B', description: 'Advanced mathematics', category: 'Math' },
  { id: 'deepseek-ai/DeepSeek-Math-7B-Instruct', name: 'DeepSeek Math 7B', description: 'Math specialist', category: 'Math' },
  
  // Fast & Efficient Models
  { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5 7B', description: 'Fast & efficient', category: 'Fast' },
  { id: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B', description: 'Ultra fast', category: 'Fast' },
  { id: 'microsoft/Phi-3.5-mini-instruct', name: 'Phi 3.5 Mini', description: 'Compact & quick', category: 'Fast' },
  { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B', description: 'Google efficient', category: 'Fast' },
  { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B', description: 'Google balanced', category: 'Fast' },
  
  // Creative & Writing Models
  { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', name: 'Mixtral 8x22B', description: 'Creative writing', category: 'Creative' },
  { id: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO', name: 'Hermes 2 Mixtral', description: 'Story generation', category: 'Creative' },
];

const MODEL_CATEGORIES = ['All', 'Vision', 'Chat', 'Code', 'Math', 'Fast', 'Creative'];

const BytezAI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [modelSearch, setModelSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [attachments, setAttachments] = useState<{ type: string; data: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    
    const { data, error } = await supabase
      .from('bytez_conversations')
      .select('*')
      .eq('user_id', user.id)
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
      attachments: msg.attachments as { type: string; data: string; name?: string }[] | undefined,
      created_at: msg.created_at
    })));
  };


  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bytez_conversations')
      .insert({
        user_id: user.id,
        title: 'New Chat',
        model: selectedModel
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const type = file.type.startsWith('image/') ? 'image' : 'document';
        setAttachments(prev => [...prev, { type, data: base64, name: file.name }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    let conversationId = currentConversation;

    if (!conversationId) {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('bytez_conversations')
        .insert({
          user_id: user.id,
          title: input.slice(0, 50) || 'New Chat',
          model: selectedModel
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
      attachments: attachments.length > 0 ? attachments : undefined,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Save user message
      await supabase.from('bytez_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage.content,
        attachments: userMessage.attachments
      });

      // Call BYTEZ API
      const { data, error } = await supabase.functions.invoke('bytez-chat', {
        body: {
          model: selectedModel,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content || data.message || 'No response received',
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
          description: "Failed to get response from Nexus X AI",
          variant: "destructive"
        });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModels = AI_MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
                         model.description.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card border-primary/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nexus X AI</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access Nexus X AI with vision capabilities</p>
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
        <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 backdrop-blur-sm border border-primary/30 mb-4">
          <div className="relative">
            <Bot className="w-12 h-12 text-primary animate-pulse" />
            <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Nexus X AI</h1>
            <p className="text-sm text-muted-foreground">30+ AI Models • Vision • Code • Math • Creative</p>
          </div>
          <Wand2 className="w-8 h-8 text-accent animate-float" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <Badge variant="outline" className="bg-primary/10 border-primary/30">
            <Cpu className="w-3 h-3 mr-1" /> Vision Models
          </Badge>
          <Badge variant="outline" className="bg-accent/10 border-accent/30">
            <ImageIcon className="w-3 h-3 mr-1" /> Image Analysis
          </Badge>
          <Badge variant="outline" className="bg-success/10 border-success/30">
            <FileText className="w-3 h-3 mr-1" /> Document Understanding
          </Badge>
          <Badge variant="outline" className="bg-warning/10 border-warning/30">
            <Star className="w-3 h-3 mr-1" /> Chat History
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Conversations */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-primary/20 h-[calc(100vh-300px)] min-h-[500px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Chats
                  </CardTitle>
                  <Button size="sm" onClick={createNewConversation} className="gap-1">
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
                        <p className="text-xs">Start a new chat!</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all group ${
                            currentConversation === conv.id
                              ? 'bg-primary/20 border border-primary/40'
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
            <Card className="glass-card border-primary/20 h-[calc(100vh-300px)] min-h-[500px] flex flex-col">
              {/* Model Selector with Categories and Search */}
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="font-medium">Model:</span>
                      <Badge variant="outline" className="text-xs">
                        {AI_MODELS.find(m => m.id === selectedModel)?.category}
                      </Badge>
                    </div>
                    <Input
                      placeholder="Search models..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="w-[200px] h-8 text-sm"
                    />
                  </div>
                  
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-1">
                    {MODEL_CATEGORIES.map(cat => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Model Dropdown */}
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {filteredModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] px-1">
                              {model.category}
                            </Badge>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      {filteredModels.length === 0 && (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No models found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                        <Zap className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                      <p className="text-muted-foreground max-w-md">
                        Upload images or documents and ask questions. Nexus X AI can analyze visual content, write code, solve math, and provide intelligent responses.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <Badge variant="secondary">📸 Analyze Images</Badge>
                        <Badge variant="secondary">📄 Read Documents</Badge>
                        <Badge variant="secondary">🔍 Extract Text</Badge>
                        <Badge variant="secondary">💡 Get Insights</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 border border-border/50'
                            }`}
                          >
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {message.attachments.map((att, i) => (
                                  <div key={i} className="flex items-center gap-1 bg-background/50 rounded-lg px-2 py-1 text-xs">
                                    {att.type === 'image' ? (
                                      <ImageIcon className="w-3 h-3" />
                                    ) : (
                                      <FileText className="w-3 h-3" />
                                    )}
                                    <span className="truncate max-w-[100px]">{att.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-muted/50 border border-border/50 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm"
                      >
                        {att.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-primary" />
                        ) : (
                          <FileText className="w-4 h-4 text-accent" />
                        )}
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => removeAttachment(i)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    multiple
                    className="hidden"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Ask about images, documents, or anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || (!input.trim() && attachments.length === 0)}
                    className="flex-shrink-0 gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send
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

export default BytezAI;
