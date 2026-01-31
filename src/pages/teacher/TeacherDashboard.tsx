import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, TrendingUp, Bell } from "lucide-react";
import { useClassroom } from "@/hooks/useClassroom";
import { useNavigate } from "react-router-dom";
import { ClassroomCard } from "@/components/teacher/ClassroomCard";
import { CreateClassroomModal } from "@/components/teacher/CreateClassroomModal";
import { useState } from "react";

export default function TeacherDashboard() {
  const { classrooms, classroomsLoading } = useClassroom();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalStudents = classrooms?.reduce((sum, c) => sum + (c.max_students || 0), 0) || 0;
  const activeClassrooms = classrooms?.filter(c => c.is_active).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teacher Portal</h1>
          <p className="text-muted-foreground">Manage your classrooms and student progress</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/teacher/analytics")}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Classroom
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Classes</p>
              <p className="text-2xl font-bold">{activeClassrooms}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Grades</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Participation</p>
              <p className="text-2xl font-bold">0%</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">My Classrooms</h2>
        {classroomsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-24 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : classrooms && classrooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map(classroom => (
              <ClassroomCard key={classroom.id} classroom={classroom} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No classrooms yet</h3>
            <p className="text-muted-foreground mb-4">Create your first classroom to get started</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Classroom
            </Button>
          </Card>
        )}
      </div>

      <CreateClassroomModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}
