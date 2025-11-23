import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp } from "lucide-react";

interface StudentRosterTableProps {
  members: any[];
  classroomId: string;
}

export function StudentRosterTable({ members }: StudentRosterTableProps) {
  if (!members || members.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No students enrolled yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Share your class code with students to have them join
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Participation</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.profiles?.avatar_url} />
                    <AvatarFallback>
                      {member.profiles?.display_name?.[0] || member.profiles?.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.display_name || member.profiles?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{member.profiles?.username}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={member.enrollment_status === "active" ? "default" : "secondary"}>
                  {member.enrollment_status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span>{member.participation_score || 0}%</span>
                </div>
              </TableCell>
              <TableCell>{member.attendance_rate || 0}%</TableCell>
              <TableCell>
                {new Date(member.joined_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
