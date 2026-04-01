import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Link2, Clock, Tag, FileText, Save, X } from "lucide-react";
import { DAYS, SUBJECT_COLORS, type TimeGridTask } from "@/hooks/useTimeGridTasks";

interface Props {
  task: TimeGridTask | null;
  isNew?: boolean;
  defaultDay?: string;
  defaultTime?: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<TimeGridTask>) => void;
  onDelete?: (id: string) => void;
}

export function TimeGridDetailModal({ task, isNew, defaultDay, defaultTime, open, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    notes: "",
    day_column: defaultDay || "Monday",
    time_row: defaultTime || "09:00",
    start_time: defaultTime || "09:00",
    end_time: "10:00",
    duration_minutes: 60,
    priority: "medium",
    color: "#7c3aed",
    tags: [] as string[],
    checklist: [] as { text: string; done: boolean }[],
    class_link: "",
    deadline: "",
  });
  const [newTag, setNewTag] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");

  useEffect(() => {
    if (task && !isNew) {
      setForm({
        title: task.title || "",
        subject: task.subject || "",
        description: task.description || "",
        notes: task.notes || "",
        day_column: task.day_column,
        time_row: task.time_row,
        start_time: task.start_time || task.time_row,
        end_time: task.end_time || "",
        duration_minutes: task.duration_minutes,
        priority: task.priority || "medium",
        color: task.color || "#7c3aed",
        tags: task.tags || [],
        checklist: (task.checklist as any[]) || [],
        class_link: task.class_link || "",
        deadline: task.deadline ? task.deadline.split("T")[0] : "",
      });
    } else if (isNew) {
      const endHour = parseInt(defaultTime?.split(":")[0] || "9") + 1;
      setForm(prev => ({
        ...prev,
        title: "",
        subject: "",
        description: "",
        notes: "",
        day_column: defaultDay || "Monday",
        time_row: defaultTime || "09:00",
        start_time: defaultTime || "09:00",
        end_time: `${String(endHour).padStart(2, "0")}:00`,
        duration_minutes: 60,
        priority: "medium",
        color: "#7c3aed",
        tags: [],
        checklist: [],
        class_link: "",
        deadline: "",
      }));
    }
  }, [task, isNew, defaultDay, defaultTime]);

  const handleSubjectChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      subject: value,
      color: SUBJECT_COLORS[value] || SUBJECT_COLORS.default,
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (idx: number) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));
  };

  const addCheckItem = () => {
    if (newCheckItem.trim()) {
      setForm(prev => ({ ...prev, checklist: [...prev.checklist, { text: newCheckItem.trim(), done: false }] }));
      setNewCheckItem("");
    }
  };

  const toggleCheckItem = (idx: number) => {
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) =>
        i === idx ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const startParts = form.start_time.split(":");
    const endParts = form.end_time.split(":");
    const duration = endParts.length === 2 && startParts.length === 2
      ? (parseInt(endParts[0]) * 60 + parseInt(endParts[1])) - (parseInt(startParts[0]) * 60 + parseInt(startParts[1]))
      : form.duration_minutes;

    onSave({
      ...form,
      duration_minutes: Math.max(15, duration),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    } as any);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
            {isNew ? "New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Subject</Label>
              <Select value={form.subject} onValueChange={handleSubjectChange}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(SUBJECT_COLORS).filter(s => s !== "default").map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Day</Label>
              <Select value={form.day_column} onValueChange={v => setForm(p => ({ ...p, day_column: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label><Clock className="w-3 h-3 inline mr-1" />Start</Label>
              <Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value, time_row: e.target.value }))} />
            </div>
            <div>
              <Label><Clock className="w-3 h-3 inline mr-1" />End</Label>
              <Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label><Link2 className="w-3 h-3 inline mr-1" />Class/Meeting Link</Label>
            <Input value={form.class_link} onChange={e => setForm(p => ({ ...p, class_link: e.target.value }))} placeholder="https://..." />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
          </div>

          <div>
            <Label>Deadline</Label>
            <Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          </div>

          {/* Tags */}
          <div>
            <Label><Tag className="w-3 h-3 inline mr-1" />Tags</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {form.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeTag(i)}>
                  {tag} <X className="w-2.5 h-2.5 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
              <Button size="sm" variant="outline" onClick={addTag}><Plus className="w-3 h-3" /></Button>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <Label><FileText className="w-3 h-3 inline mr-1" />Checklist</Label>
            <div className="space-y-1 mb-2">
              {form.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Checkbox checked={item.done} onCheckedChange={() => toggleCheckItem(i)} />
                  <span className={item.done ? "line-through text-muted-foreground text-sm" : "text-sm"}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} placeholder="Add item" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCheckItem())} />
              <Button size="sm" variant="outline" onClick={addCheckItem}><Plus className="w-3 h-3" /></Button>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#7c3aed", "#f97316"].map(c => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1"><Save className="w-4 h-4 mr-2" />Save</Button>
            {!isNew && onDelete && task && (
              <Button variant="destructive" size="icon" onClick={() => { onDelete(task.id); onClose(); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
