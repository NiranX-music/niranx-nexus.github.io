import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassroomCardProps {
  classroom: any;
}

export function ClassroomCard({ classroom }: ClassroomCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{classroom.name}</h3>
            <p className="text-sm text-muted-foreground">{classroom.subject || "No subject"}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/niranx/teacher/classrooms/${classroom.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/niranx/teacher/classrooms/${classroom.id}/debates`)}>
              Manage Debates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/niranx/teacher/classrooms/${classroom.id}/grades`)}>
              Gradebook
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">0 / {classroom.max_students} students</span>
        </div>
        {classroom.grade_level && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{classroom.grade_level}</span>
          </div>
        )}
      </div>

      {classroom.class_code && (
        <div className="p-3 bg-muted rounded-lg mb-4">
          <p className="text-xs text-muted-foreground mb-1">Class Code</p>
          <p className="font-mono font-bold text-lg">{classroom.class_code}</p>
        </div>
      )}

      <Button 
        className="w-full" 
        onClick={() => navigate(`/niranx/teacher/classrooms/${classroom.id}`)}
      >
        View Classroom
      </Button>
    </Card>
  );
}
