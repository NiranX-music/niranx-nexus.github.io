import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen, Plus, Calendar, Smile, Meh, Frown, Zap,
  Star, ChevronLeft, ChevronRight, Flame, Trophy, Clock
} from "lucide-react";
import { format, subDays, addDays, isSameDay } from "date-fns";

interface DiaryEntry {
  id: string;
  date: Date;
  mood: "great" | "good" | "okay" | "bad";
  title: string;
  content: string;
  studyHours: number;
  tags: string[];
  wins: string[];
}

const moodConfig = {
  great: { icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Amazing" },
  good: { icon: Smile, color: "text-green-400", bg: "bg-green-500/10", label: "Good" },
  okay: { icon: Meh, color: "text-blue-400", bg: "bg-blue-500/10", label: "Okay" },
  bad: { icon: Frown, color: "text-red-400", bg: "bg-red-500/10", label: "Tough" },
};

const sampleEntries: DiaryEntry[] = [
  {
    id: "1", date: new Date(), mood: "great", title: "Productive Day!",
    content: "Finished all calculus exercises and started the physics chapter on electromagnetism. Feeling confident about the upcoming test.",
    studyHours: 5.5, tags: ["Math", "Physics"], wins: ["Completed 30 problems", "Understood Maxwell's equations"]
  },
  {
    id: "2", date: subDays(new Date(), 1), mood: "good", title: "Steady Progress",
    content: "Reviewed biology notes and practiced organic chemistry reactions. The study group session was really helpful.",
    studyHours: 4, tags: ["Biology", "Chemistry"], wins: ["Group study session"]
  },
  {
    id: "3", date: subDays(new Date(), 2), mood: "okay", title: "Challenging Topics",
    content: "Struggled with thermodynamics but made some progress after watching tutorial videos. Need to revisit entropy.",
    studyHours: 3, tags: ["Physics"], wins: ["Didn't give up"]
  },
  {
    id: "4", date: subDays(new Date(), 3), mood: "bad", title: "Low Energy Day",
    content: "Couldn't focus much today. Only managed to review flashcards. Will try again tomorrow with a fresh start.",
    studyHours: 1.5, tags: ["Review"], wins: ["Still showed up"]
  },
];

export default function StudyDiary() {
  const [entries] = useState<DiaryEntry[]>(sampleEntries);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newMood, setNewMood] = useState<DiaryEntry["mood"]>("good");

  const selectedEntry = entries.find(e => isSameDay(e.date, selectedDate));
  const weekDays = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

  const totalHours = entries.reduce((sum, e) => sum + e.studyHours, 0);
  const avgHours = entries.length ? (totalHours / entries.length).toFixed(1) : "0";
  const streak = 4;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono">
              Study <span className="text-primary">Diary</span>
            </h1>
            <p className="text-sm text-muted-foreground">Track your daily learning journey</p>
          </div>
          <Button onClick={() => setShowNewEntry(!showNewEntry)} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        </div>
      </motion.div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Hours", value: totalHours.toString(), icon: Clock, accent: "text-primary" },
          { label: "Avg/Day", value: `${avgHours}h`, icon: Zap, accent: "text-yellow-400" },
          { label: "Streak", value: `${streak} days`, icon: Flame, accent: "text-orange-400" },
          { label: "Entries", value: entries.length.toString(), icon: BookOpen, accent: "text-blue-400" },
        ].map(stat => (
          <Card key={stat.label} className="bg-card/50 border-border/40">
            <CardContent className="p-3 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.accent}`} />
              <div>
                <div className="text-lg font-bold font-mono">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Week Navigation */}
      <Card className="bg-card/50 border-border/40">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Button size="icon" variant="ghost" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-mono text-muted-foreground">This Week</span>
            <Button size="icon" variant="ghost" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const hasEntry = entries.some(e => isSameDay(e.date, day));
              const entryForDay = entries.find(e => isSameDay(e.date, day));
              const isSelected = isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                    isSelected ? "bg-primary/15 border border-primary/30" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground uppercase">{format(day, "EEE")}</span>
                  <span className={`text-sm font-bold ${isSelected ? "text-primary" : ""}`}>{format(day, "d")}</span>
                  {hasEntry && entryForDay && (
                    <div className={`h-2 w-2 rounded-full ${moodConfig[entryForDay.mood].bg} border ${moodConfig[entryForDay.mood].color.replace("text-", "border-")}`} />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* New Entry Form */}
      {showNewEntry && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="border-primary/30 bg-card/50">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold font-mono text-sm">How was your study day?</h3>

              {/* Mood Selector */}
              <div className="flex gap-3">
                {(Object.entries(moodConfig) as [DiaryEntry["mood"], typeof moodConfig.great][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setNewMood(key)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                      newMood === key ? `${cfg.bg} border-current ${cfg.color}` : "border-border/40 hover:bg-muted/50"
                    }`}
                  >
                    <cfg.icon className={`h-6 w-6 ${newMood === key ? cfg.color : "text-muted-foreground"}`} />
                    <span className="text-[10px] font-mono">{cfg.label}</span>
                  </button>
                ))}
              </div>

              <Input placeholder="Entry title..." className="bg-muted/30 border-border/40" />
              <textarea
                placeholder="Write about your day..."
                className="w-full h-24 rounded-xl bg-muted/30 border border-border/40 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex gap-2">
                <Button className="rounded-xl">Save Entry</Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setShowNewEntry(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Selected Day Entry */}
      {selectedEntry ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedEntry.id}>
          <Card className="bg-card/50 border-border/40 overflow-hidden">
            <div className={`h-1 ${moodConfig[selectedEntry.mood].bg}`} />
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selectedEntry.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{format(selectedEntry.date, "EEEE, MMMM d, yyyy")}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${moodConfig[selectedEntry.mood].bg}`}>
                  {(() => { const Ic = moodConfig[selectedEntry.mood].icon; return <Ic className={`h-4 w-4 ${moodConfig[selectedEntry.mood].color}`} />; })()}
                  <span className={`text-xs font-mono ${moodConfig[selectedEntry.mood].color}`}>{moodConfig[selectedEntry.mood].label}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{selectedEntry.content}</p>

              <div className="flex flex-wrap gap-2">
                {selectedEntry.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="font-mono text-[10px]">{tag}</Badge>
                ))}
                <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">
                  <Clock className="h-3 w-3 mr-1" />{selectedEntry.studyHours}h
                </Badge>
              </div>

              {selectedEntry.wins.length > 0 && (
                <div className="border-t border-border/30 pt-3">
                  <h4 className="text-xs font-mono text-muted-foreground mb-2 flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-400" /> WINS
                  </h4>
                  <div className="space-y-1.5">
                    {selectedEntry.wins.map((win, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Star className="h-3 w-3 text-yellow-400" />
                        {win}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="bg-card/50 border-border/40">
          <CardContent className="p-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No entry for this day</h3>
            <p className="text-sm text-muted-foreground">Click "New Entry" to write about your study session</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
