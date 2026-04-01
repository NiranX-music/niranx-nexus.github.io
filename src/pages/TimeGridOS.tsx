import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutGrid, Plus, Brain, Calendar, BarChart3,
  Clock, Target, Zap, Download, Filter
} from "lucide-react";
import { useTimeGridTasks, DAYS, DEFAULT_TIME_SLOTS, type TimeGridTask } from "@/hooks/useTimeGridTasks";
import { TimeGridGrid } from "@/components/timegrid/TimeGridGrid";
import { TimeGridDetailModal } from "@/components/timegrid/TimeGridDetailModal";
import { TimeGridAIScanner } from "@/components/timegrid/TimeGridAIScanner";
import { toast } from "sonner";

export default function TimeGridOS() {
  const { tasks, loading, addTask, updateTask, deleteTask, moveTask } = useTimeGridTasks();
  const [selectedTask, setSelectedTask] = useState<TimeGridTask | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(false);
  const [defaultDay, setDefaultDay] = useState("Monday");
  const [defaultTime, setDefaultTime] = useState("09:00");
  const [activeTab, setActiveTab] = useState("grid");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const handleCellClick = (day: string, time: string) => {
    setSelectedTask(null);
    setIsNewTask(true);
    setDefaultDay(day);
    setDefaultTime(time);
    setModalOpen(true);
  };

  const handleTaskClick = (task: TimeGridTask) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setModalOpen(true);
  };

  const handleSave = async (data: Partial<TimeGridTask>) => {
    if (isNewTask) {
      await addTask(data);
    } else if (selectedTask) {
      await updateTask(selectedTask.id, data);
    }
  };

  const handleDrop = async (taskId: string, newDay: string, newTime: string) => {
    await moveTask(taskId, newDay, newTime);
  };

  const handleAIExtract = async (extracted: Partial<TimeGridTask>[]) => {
    let added = 0;
    for (const task of extracted) {
      const result = await addTask(task);
      if (result) added++;
    }
    if (added > 0) toast.success(`Added ${added} tasks to your grid!`);
  };

  const filteredTasks = filterPriority
    ? tasks.filter(t => t.priority === filterPriority)
    : tasks;

  const stats = {
    total: tasks.length,
    high: tasks.filter(t => t.priority === "high").length,
    medium: tasks.filter(t => t.priority === "medium").length,
    low: tasks.filter(t => t.priority === "low").length,
    totalHours: Math.round(tasks.reduce((sum, t) => sum + t.duration_minutes, 0) / 60 * 10) / 10,
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-primary" />
              TimeGrid OS
              <Badge variant="secondary" className="text-[10px]">BETA</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">Smart visual scheduler with AI-powered task creation</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleCellClick("Monday", "09:00")}>
              <Plus className="w-4 h-4 mr-1" /> New Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: "Total Tasks", value: stats.total, icon: Target, color: "text-primary" },
            { label: "High Priority", value: stats.high, icon: Zap, color: "text-destructive" },
            { label: "Medium", value: stats.medium, icon: Clock, color: "text-yellow-500" },
            { label: "Low", value: stats.low, icon: Calendar, color: "text-green-500" },
            { label: "Total Hours", value: stats.totalHours, icon: BarChart3, color: "text-blue-500" },
          ].map(s => (
            <Card key={s.label} className="bg-card/50 backdrop-blur border-border/30">
              <CardContent className="p-3 flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filter:</span>
          {["all", "high", "medium", "low"].map(p => (
            <Button
              key={p}
              size="sm"
              variant={filterPriority === (p === "all" ? null : p) || (p === "all" && !filterPriority) ? "default" : "outline"}
              className="text-xs h-7"
              onClick={() => setFilterPriority(p === "all" ? null : p)}
            >
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="grid"><LayoutGrid className="w-4 h-4 mr-1" />Grid View</TabsTrigger>
            <TabsTrigger value="ai"><Brain className="w-4 h-4 mr-1" />AI Scanner</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
            ) : (
              <TimeGridGrid
                tasks={filteredTasks}
                timeSlots={DEFAULT_TIME_SLOTS}
                days={DAYS}
                onCellClick={handleCellClick}
                onTaskClick={handleTaskClick}
                onDrop={handleDrop}
              />
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <div className="max-w-xl mx-auto">
              <TimeGridAIScanner onTasksExtracted={handleAIExtract} />
            </div>
          </TabsContent>
        </Tabs>

        <TimeGridDetailModal
          task={selectedTask}
          isNew={isNewTask}
          defaultDay={defaultDay}
          defaultTime={defaultTime}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={deleteTask}
        />
      </div>
    </>
  );
}
