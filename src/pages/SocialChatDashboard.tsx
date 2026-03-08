import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Send, Phone, Video, MoreHorizontal, Image, Smile, 
  Paperclip, Heart, ArrowLeft, Circle, Camera, Mic
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
  read: boolean;
  reaction?: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  typing?: boolean;
}

const mockConversations: Conversation[] = [
  { id: "1", name: "Sarah Chen", avatar: "", lastMessage: "Did you finish the calculus notes?", time: "2m", unread: 3, online: true, typing: true },
  { id: "2", name: "Alex Rivera", avatar: "", lastMessage: "The study group starts at 7pm!", time: "15m", unread: 1, online: true },
  { id: "3", name: "Priya Patel", avatar: "", lastMessage: "Shared a photo", time: "1h", unread: 0, online: false },
  { id: "4", name: "James Wilson", avatar: "", lastMessage: "Thanks for the help!", time: "3h", unread: 0, online: true },
  { id: "5", name: "Luna Kim", avatar: "", lastMessage: "See you in the lab tomorrow", time: "5h", unread: 0, online: false },
  { id: "6", name: "Study Group Alpha", avatar: "", lastMessage: "Alex: Meeting notes uploaded", time: "1d", unread: 12, online: false },
  { id: "7", name: "Marcus Thompson", avatar: "", lastMessage: "Can you explain chapter 5?", time: "2d", unread: 0, online: false },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", text: "Hey! How's the revision going?", sender: "them", time: "10:30 AM", read: true },
    { id: "m2", text: "Pretty good! Just finished the integration chapter", sender: "me", time: "10:32 AM", read: true },
    { id: "m3", text: "Nice! I'm still stuck on partial fractions", sender: "them", time: "10:33 AM", read: true },
    { id: "m4", text: "I can help with that. Want to do a quick study session?", sender: "me", time: "10:35 AM", read: true },
    { id: "m5", text: "That would be amazing! 🙌", sender: "them", time: "10:35 AM", read: true, reaction: "❤️" },
    { id: "m6", text: "Did you finish the calculus notes?", sender: "them", time: "10:40 AM", read: false },
  ],
};

export default function SocialChatDashboard() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConvo = mockConversations.find(c => c.id === selectedConvo);
  const messages = selectedConvo ? (mockMessages[selectedConvo] || []) : [];

  const filteredConvos = mockConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-background overflow-hidden">
      {/* Conversations List */}
      <motion.div
        className={`w-full md:w-[360px] border-r border-border/40 flex flex-col shrink-0 ${selectedConvo ? "hidden md:flex" : "flex"}`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold font-mono">Messages</h1>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Camera className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 rounded-xl bg-muted/50 border-0 text-sm"
            />
          </div>
        </div>

        {/* Stories-style Quick Access */}
        <div className="flex gap-3 px-4 py-3 overflow-x-auto border-b border-border/30">
          {mockConversations.filter(c => c.online).map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConvo(c.id)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                  <Avatar className="h-full w-full border-2 border-background">
                    <AvatarFallback className="bg-primary/20 text-xs font-bold">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Circle className="absolute -bottom-0 -right-0 h-4 w-4 fill-green-500 text-green-500" />
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-14 text-center">{c.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {filteredConvos.map(convo => (
            <motion.button
              key={convo.id}
              onClick={() => setSelectedConvo(convo.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left ${selectedConvo === convo.id ? "bg-primary/10" : ""}`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 font-bold text-sm">
                    {convo.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {convo.online && (
                  <Circle className="absolute bottom-0 right-0 h-3.5 w-3.5 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate">{convo.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{convo.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">
                    {convo.typing ? (
                      <span className="text-primary font-medium">typing...</span>
                    ) : convo.lastMessage}
                  </span>
                  {convo.unread > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] p-0 shrink-0">
                      {convo.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </ScrollArea>
      </motion.div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConvo ? "hidden md:flex" : "flex"}`}>
        {selectedConvo && activeConvo ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Button size="icon" variant="ghost" className="md:hidden h-8 w-8" onClick={() => setSelectedConvo(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 font-bold text-xs">
                    {activeConvo.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{activeConvo.name}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {activeConvo.online ? (
                      <span className="text-green-500">Active now</span>
                    ) : (
                      `Active ${activeConvo.time} ago`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8"><Video className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-3 max-w-2xl mx-auto">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="relative group">
                      <div className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm ${
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${msg.sender === "me" ? "justify-end" : ""}`}>
                        <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                      </div>
                      {msg.reaction && (
                        <span className="absolute -bottom-2 right-2 text-xs bg-card border border-border/50 rounded-full px-1.5 py-0.5 shadow-sm">
                          {msg.reaction}
                        </span>
                      )}
                      {/* Quick react on hover */}
                      <div className="absolute -top-3 right-0 hidden group-hover:flex items-center gap-0.5 bg-card border border-border/50 rounded-full px-1 py-0.5 shadow-md">
                        {["❤️", "😂", "👍", "😮"].map(emoji => (
                          <button key={emoji} className="text-xs hover:scale-125 transition-transform px-0.5">{emoji}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border/40 p-3">
              <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8"><Image className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8"><Mic className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="pr-10 h-10 rounded-full bg-muted/50 border-0 text-sm"
                  />
                  <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="h-10 w-10 rounded-full shrink-0"
                >
                  {message.trim() ? <Send className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full border-2 border-border/50 flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Your Messages</h3>
              <p className="text-sm text-muted-foreground mb-4">Send photos, videos, and messages to friends</p>
              <Button className="rounded-full">Send Message</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Edit(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </svg>
  );
}
