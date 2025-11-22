import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface StudentSelectorProps {
  students: any[];
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
}

export function StudentSelector({ students, selectedStudentId, onSelectStudent }: StudentSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => {
            const profile = student.profiles;
            const isSelected = student.student_id === selectedStudentId;
            
            return (
              <Button
                key={student.student_id}
                variant={isSelected ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => onSelectStudent(student.student_id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{profile?.display_name || profile?.username || 'Unknown'}</p>
                    <Badge variant="secondary" className="text-xs capitalize mt-1">
                      {student.relationship_type}
                    </Badge>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
