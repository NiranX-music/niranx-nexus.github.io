import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Repeat } from "lucide-react";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "class" | "homework";
  onSuccess: () => void;
}

export const AddItemDialog = ({ open, onOpenChange, type, onSuccess }: AddItemDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    subject: "",
    description: "",
    date: new Date(),
    startTime: "",
    endTime: "",
    classLink: "",
    estimatedTime: "",
    priority: "medium",
    isRecurring: false,
    recurringPattern: "weekly",
    recurringDays: [] as number[],
    recurringEndDate: null as Date | null,
  });

  const weekDays = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (type === "class") {
        const startDateTime = new Date(formData.date);
        const [startHours, startMinutes] = formData.startTime.split(":");
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

        const endDateTime = new Date(formData.date);
        const [endHours, endMinutes] = formData.endTime.split(":");
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

        const { error } = await supabase.from("live_classes").insert({
          user_id: user.id,
          title: formData.title,
          subject: formData.subject,
          class_link: formData.classLink || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: "upcoming",
          is_recurring: formData.isRecurring,
          recurring_pattern: formData.isRecurring ? formData.recurringPattern : null,
          recurring_days: formData.isRecurring && formData.recurringPattern === "custom" ? formData.recurringDays : null,
          recurring_end_date: formData.isRecurring && formData.recurringEndDate ? format(formData.recurringEndDate, "yyyy-MM-dd") : null,
        });

        if (error) throw error;
      } else {
        const dueDateTime = new Date(formData.date);
        const [hours, minutes] = (formData.startTime || "23:59").split(":");
        dueDateTime.setHours(parseInt(hours), parseInt(minutes));

        const { error } = await supabase.from("homework_assignments").insert({
          user_id: user.id,
          title: formData.title,
          subject: formData.subject,
          description: formData.description || null,
          due_date: dueDateTime.toISOString(),
          estimated_time: formData.estimatedTime ? parseInt(formData.estimatedTime) * 60 : null,
          priority: formData.priority,
          status: "pending",
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${type === "class" ? "Class" : "Homework"} added successfully`,
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        title: "",
        subject: "",
        description: "",
        date: new Date(),
        startTime: "",
        endTime: "",
        classLink: "",
        estimatedTime: "",
        priority: "medium",
        isRecurring: false,
        recurringPattern: "weekly",
        recurringDays: [],
        recurringEndDate: null,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${type}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {type === "class" ? "Live Class" : "Homework"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Enter ${type} title`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Mathematics, Physics"
              required
            />
          </div>

          {type === "homework" && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Homework details..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {type === "class" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classLink">Class Link (Optional)</Label>
                <Input
                  id="classLink"
                  type="url"
                  value={formData.classLink}
                  onChange={(e) => setFormData({ ...formData, classLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Recurring Options */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    <Label htmlFor="isRecurring">Recurring Class</Label>
                  </div>
                  <Switch
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                  />
                </div>

                {formData.isRecurring && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="recurringPattern">Repeat Pattern</Label>
                      <Select
                        value={formData.recurringPattern}
                        onValueChange={(value) => setFormData({ ...formData, recurringPattern: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Every Day</SelectItem>
                          <SelectItem value="weekly">Every Week (Same Day)</SelectItem>
                          <SelectItem value="custom">Custom Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.recurringPattern === "custom" && (
                      <div className="space-y-2">
                        <Label>Repeat On</Label>
                        <div className="flex gap-2 flex-wrap">
                          {weekDays.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day.value}`}
                                checked={formData.recurringDays.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData({
                                      ...formData,
                                      recurringDays: [...formData.recurringDays, day.value].sort()
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      recurringDays: formData.recurringDays.filter((d: number) => d !== day.value)
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`day-${day.value}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {day.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Repeat Until (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.recurringEndDate ? format(formData.recurringEndDate, "PPP") : "No end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.recurringEndDate}
                            onSelect={(date) => setFormData({ ...formData, recurringEndDate: date })}
                          />
                        </PopoverContent>
                      </Popover>
                      {formData.recurringEndDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, recurringEndDate: null })}
                        >
                          Clear end date
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Est. Hours</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
