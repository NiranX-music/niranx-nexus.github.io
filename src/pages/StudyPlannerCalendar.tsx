import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Clock, BookOpen, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudyBlock {
  id: string;
  subject: string;
  day: number;
  startHour: number;
  duration: number;
  color: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm
const COLORS = [
  "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300",
  "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
  "bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-300",
  "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300",
  "bg-orange-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300",
  "bg-pink-500/20 border-pink-500/40 text-pink-700 dark:text-pink-300",
];

export default function StudyPlannerCalendar() {
  const [blocks, setBlocks] = useState<StudyBlock[]>(() => {
    try { return JSON.parse(localStorage.getItem("study-planner-blocks") || "[]"); } catch { return []; }
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDay, setNewDay] = useState("0");
  const [newStart, setNewStart] = useState("9");
  const [newDuration, setNewDuration] = useState("1");

  const save = (updated: StudyBlock[]) => {
    setBlocks(updated);
    localStorage.setItem("study-planner-blocks", JSON.stringify(updated));
  };

  const addBlock = () => {
    if (!newSubject.trim()) { toast.error("Subject required"); return; }
    const block: StudyBlock = {
      id: crypto.randomUUID(),
      subject: newSubject.trim(),
      day: parseInt(newDay),
      startHour: parseInt(newStart),
      duration: parseInt(newDuration),
      color: COLORS[blocks.length % COLORS.length],
    };
    save([...blocks, block]);
    setNewSubject("");
    setIsAdding(false);
    toast.success("Study block added!");
  };

  const removeBlock = (id: string) => {
    save(blocks.filter(b => b.id !== id));
    toast.success("Block removed");
  };

  const totalHours = blocks.reduce((a, b) => a + b.duration, 0);

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-3xl font-bold">Weekly Study Planner</h1>
            <p className="text-muted-foreground text-sm">Plan your study week visually</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{totalHours}h/week</Badge>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Block</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Study Block</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Subject (e.g. Math, Physics)" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
                <Select value={newDay} onValueChange={setNewDay}>
                  <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                  <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newStart} onValueChange={setNewStart}>
                    <SelectTrigger><SelectValue placeholder="Start time" /></SelectTrigger>
                    <SelectContent>{HOURS.map(h => <SelectItem key={h} value={String(h)}>{h}:00</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={newDuration} onValueChange={setNewDuration}>
                    <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4].map(d => <SelectItem key={d} value={String(d)}>{d}h</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={addBlock} className="w-full">Add Block</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <div className="grid grid-cols-8 min-w-[700px]">
            {/* Header */}
            <div className="p-2 text-sm font-medium text-muted-foreground">Time</div>
            {DAYS.map(d => (
              <div key={d} className="p-2 text-sm font-semibold text-center border-l border-border">{d}</div>
            ))}

            {/* Time Rows */}
            {HOURS.map(hour => (
              <div key={hour} className="contents">
                <div className="p-2 text-xs text-muted-foreground border-t border-border">{hour}:00</div>
                {DAYS.map((_, dayIdx) => {
                  const block = blocks.find(b => b.day === dayIdx && b.startHour === hour);
                  const isCovered = blocks.some(b => b.day === dayIdx && b.startHour < hour && b.startHour + b.duration > hour);
                  if (isCovered) return <div key={dayIdx} className="border-l border-t border-border" />;
                  return (
                    <div key={dayIdx} className="border-l border-t border-border relative min-h-[48px]">
                      {block && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "absolute inset-1 rounded-md border p-1.5 text-xs cursor-pointer group",
                            block.color
                          )}
                          style={{ height: `${block.duration * 48 - 8}px`, zIndex: 10 }}
                          onClick={() => removeBlock(block.id)}
                        >
                          <p className="font-medium truncate">{block.subject}</p>
                          <p className="opacity-70">{block.duration}h</p>
                          <Trash2 className="h-3 w-3 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {DAYS.map((day, i) => {
          const dayBlocks = blocks.filter(b => b.day === i);
          const dayHours = dayBlocks.reduce((a, b) => a + b.duration, 0);
          return (
            <Card key={i}>
              <CardContent className="p-3 text-center">
                <p className="text-sm font-medium">{day}</p>
                <p className="text-2xl font-bold">{dayHours}h</p>
                <p className="text-xs text-muted-foreground">{dayBlocks.length} blocks</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
