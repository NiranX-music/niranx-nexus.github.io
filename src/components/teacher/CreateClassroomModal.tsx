import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClassroom } from "@/hooks/useClassroom";
import { useState } from "react";

interface CreateClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClassroomModal({ open, onOpenChange }: CreateClassroomModalProps) {
  const { createClassroom } = useClassroom();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    grade_level: "",
    academic_year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    description: "",
    max_students: 40,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClassroom.mutateAsync(formData);
    onOpenChange(false);
    setFormData({
      name: "",
      subject: "",
      grade_level: "",
      academic_year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
      description: "",
      max_students: 40,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Classroom</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Classroom Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Grade 10 Debate Class"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Critical Thinking"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade_level">Grade Level</Label>
              <Input
                id="grade_level"
                placeholder="e.g., 10th Grade"
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                placeholder="e.g., 2024-2025"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_students">Max Students</Label>
              <Input
                id="max_students"
                type="number"
                min="1"
                max="100"
                value={formData.max_students}
                onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your classroom..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClassroom.isPending}>
              {createClassroom.isPending ? "Creating..." : "Create Classroom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
