import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Eye, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Story {
  id: string;
  user_name: string;
  user_initial: string;
  content: string;
  created_at: string;
  expires_at: string;
  views: number;
  color: string;
}

const GRADIENT_COLORS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-500",
  "from-indigo-500 to-violet-500",
  "from-rose-500 to-amber-500",
];

function generateMockStories(): Story[] {
  const names = ["You", "Alex", "Sam", "Jordan", "Taylor", "Morgan"];
  return names.slice(1).map((name, i) => ({
    id: `story-${i}`,
    user_name: name,
    user_initial: name[0],
    content: [
      "Just finished my physics exam! 🎉",
      "Study tip: Use the Pomodoro method for better focus",
      "Anyone up for a study group session tonight?",
      "New personal best: 15 day study streak! 🔥",
      "Check out this amazing chemistry simulation",
    ][i % 5],
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    expires_at: new Date(Date.now() + (24 - i) * 3600000).toISOString(),
    views: Math.floor(Math.random() * 50) + 5,
    color: GRADIENT_COLORS[i % GRADIENT_COLORS.length],
  }));
}

export default function XFlowStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingStory, setViewingStory] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(GRADIENT_COLORS[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setStories(generateMockStories());
  }, []);

  useEffect(() => {
    if (viewingStory === null) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          // Auto-advance
          if (viewingStory < stories.length - 1) {
            setViewingStory(viewingStory + 1);
            return 0;
          } else {
            setViewingStory(null);
            clearInterval(interval);
            return 100;
          }
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [viewingStory, stories.length]);

  const createStory = () => {
    if (!newContent.trim()) return;
    const newStory: Story = {
      id: `story-new-${Date.now()}`,
      user_name: "You",
      user_initial: user?.email?.[0]?.toUpperCase() || "U",
      content: newContent.trim(),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      views: 0,
      color: selectedColor,
    };
    setStories([newStory, ...stories]);
    setNewContent("");
    setShowCreate(false);
    toast.success("Story posted! It will disappear in 24 hours.");
  };

  return (
    <div>
      {/* Stories Row */}
      <div className="flex gap-3 overflow-x-auto pb-4 px-1">
        {/* Create Story Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground">Your Story</span>
        </motion.button>

        {/* Story Avatars */}
        {stories.map((story, i) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewingStory(i)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className={`h-16 w-16 rounded-full p-[2px] bg-gradient-to-br ${story.color}`}>
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                <span className="text-sm font-bold">{story.user_initial}</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[64px]">{story.user_name}</span>
          </motion.button>
        ))}
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory !== null && stories[viewingStory] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/95 flex items-center justify-center"
          >
            <div className="relative w-full max-w-sm mx-auto">
              {/* Progress Bars */}
              <div className="flex gap-1 mb-3 px-2">
                {stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      style={{
                        width: i < viewingStory ? "100%" : i === viewingStory ? `${progress}%` : "0%"
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-3 mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{stories[viewingStory].user_initial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{stories[viewingStory].user_name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <Eye className="h-2.5 w-2.5 ml-1" /> {stories[viewingStory].views}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingStory(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Story Content */}
              <motion.div
                key={viewingStory}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mx-3 rounded-2xl bg-gradient-to-br ${stories[viewingStory].color} p-8 min-h-[400px] flex items-center justify-center`}
              >
                <p className="text-center text-lg font-medium text-primary-foreground drop-shadow-lg">
                  {stories[viewingStory].content}
                </p>
              </motion.div>

              {/* Navigation */}
              <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={() => viewingStory > 0 && setViewingStory(viewingStory - 1)} />
              <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={() => viewingStory < stories.length - 1 ? setViewingStory(viewingStory + 1) : setViewingStory(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Story Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Story</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind? (disappears in 24h)"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              {GRADIENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`h-8 w-8 rounded-full bg-gradient-to-br ${c} transition-all ${selectedColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : ""}`}
                />
              ))}
            </div>
            {newContent && (
              <div className={`rounded-xl bg-gradient-to-br ${selectedColor} p-6 text-center`}>
                <p className="text-sm font-medium text-primary-foreground">{newContent}</p>
              </div>
            )}
            <Button onClick={createStory} className="w-full" disabled={!newContent.trim()}>
              Post Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
