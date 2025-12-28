import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Bot, 
  User, 
  ImagePlus, 
  FileText, 
  Trash2, 
  Plus,
  History,
  X,
  Loader2,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Attachment {
  type: 'image' | 'document';
  name: string;
  url: string;
  content?: string;
}

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_MODELS = [
  { id: 'Qwen/Qwen2.5-VL-7B-Instruct', name: 'Qwen 2.5 VL 7B (Vision)' },
  { id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', name: 'Llama 3.2 11B Vision' },
  { id: 'microsoft/Phi-3.5-vision-instruct', name: 'Phi 3.5 Vision' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B' },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B' },
];

export default function BytezAIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    setMessages(data?.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      attachments: (msg.attachments as unknown as Attachment[]) || [],
      created_at: msg.created_at,
    })) || []);
  };

  const createNewConversation = async () => {
    if (!user) {
      toast.error('Please sign in to use NiranX Nexus');
      return null;
    }

    const { data, error } = await supabase
      .from('bytez_conversations')
      .insert({
        user_id: user.id,
        title: 'New Conversation',
        model: selectedModel,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }

    setConversations(prev => [data, ...prev]);
    return data.id;
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setAttachments([]);
    setHistoryOpen(false);
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setCurrentConversationId(conv.id);
    setSelectedModel(conv.model);
    await loadMessages(conv.id);
    setHistoryOpen(false);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('bytez_conversations')
      .delete()
      .eq('id', convId);

    if (error) {
      toast.error('Failed to delete conversation');
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== convId));
    if (currentConversationId === convId) {
      handleNewChat();
    }
    toast.success('Conversation deleted');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          type: 'image',
          name: file.name,
          url: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    }
    
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          type: 'document',
          name: file.name,
          url: '',
          content: reader.result as string,
        }]);
      };
      reader.readAsText(file);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (!user) {
      toast.error('Please sign in to use NiranX Nexus');
      return;
    }

    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
      setCurrentConversationId(conversationId);
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      attachments: [...attachments],
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase.from('bytez_messages').insert([{
        conversation_id: conversationId,
        role: 'user',
        content: input,
        attachments: JSON.parse(JSON.stringify(userMessage.attachments || [])),
      }]);

      // Update conversation title if first message
      if (messages.length === 0 && input.trim()) {
        const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');
        await supabase
          .from('bytez_conversations')
          .update({ title })
          .eq('id', conversationId);
        
        setConversations(prev => 
          prev.map(c => c.id === conversationId ? { ...c, title } : c)
        );
      }

      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
        attachments: msg.attachments,
      }));

      const response = await supabase.functions.invoke('bytez-chat', {
        body: { 
          messages: apiMessages,
          model: selectedModel,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const assistantContent = response.data?.choices?.[0]?.message?.content || 
        'Sorry, I could not generate a response.';

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from('bytez_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantContent,
      });

      // Update conversation updated_at
      await supabase
        .from('bytez_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('BYTEZ chat error:', error);
      toast.error('Failed to get response from NiranX Nexus');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">NiranX Nexus</CardTitle>
              <p className="text-xs text-muted-foreground">30+ AI Models</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id} className="text-xs">
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
            
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                  <div className="space-y-2">
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          currentConversationId === conv.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate flex-1">
                            {conv.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(conv.updated_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    ))}
                    {conversations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No conversations yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Welcome to NiranX Nexus</h3>
                <p className="text-sm text-muted-foreground">
                  Upload images or documents and ask questions about them!
                </p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="p-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 h-8 w-8 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                } rounded-lg p-3`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.attachments.map((att, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {att.type === 'image' ? <ImagePlus className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                          {att.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {msg.role === 'user' && (
                  <div className="p-2 rounded-full bg-primary h-8 w-8 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 h-8 w-8 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg mb-2">
            {attachments.map((att, idx) => (
              <Badge key={idx} variant="secondary" className="pr-1">
                {att.type === 'image' ? <ImagePlus className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                {att.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeAttachment(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 mt-2">
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleDocumentUpload}
            accept=".txt,.md,.json,.csv,.xml,.html"
            multiple
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="h-4 w-4" />
          </Button>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your images or documents..."
            className="min-h-[40px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <Button 
            onClick={handleSend} 
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
