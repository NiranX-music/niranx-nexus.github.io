import { useParams, useNavigate } from "react-router-dom";
import { useClassroom } from "@/hooks/useClassroom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, BookOpen, ClipboardList, Calendar, Bell, Link2, Youtube, Copy, Check } from "lucide-react";
import { StudentRosterTable } from "@/components/teacher/StudentRosterTable";
import { ClassroomVideoManager } from "@/components/teacher/ClassroomVideoManager";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ClassroomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classroom, members, videos, classroomLoading } = useClassroom(id);
  const [copied, setCopied] = useState(false);

  const inviteLink = classroom?.class_code
    ? `${window.location.origin}/niranx/join-classroom?code=${classroom.class_code}`
    : "";

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Invite link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (classroomLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Classroom not found</h2>
          <Button onClick={() => navigate("/niranx/teacher/dashboard")}>
            Go back to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/niranx/teacher/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{classroom.name}</h1>
          <p className="text-muted-foreground">{classroom.subject || "No subject"} • {classroom.grade_level || "No grade level"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Class Code</p>
              <p className="text-2xl font-mono font-bold">{classroom.class_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Students Enrolled</p>
              <p className="text-2xl font-bold">{members?.length || 0} / {classroom.max_students}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Academic Year</p>
              <p className="text-2xl font-bold">{classroom.academic_year || "N/A"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Link2 className="w-5 h-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Invite Students</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Share this link with students to let them join your classroom
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded border"
                />
                <Button size="sm" onClick={copyInviteLink}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BookOpen className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Youtube className="w-4 h-4 mr-2" />
            Video Library
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="debates">
            <ClipboardList className="w-4 h-4 mr-2" />
            Debates
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="w-4 h-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Bell className="w-4 h-4 mr-2" />
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Classroom Description</h3>
            <p className="text-muted-foreground">
              {classroom.description || "No description available"}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <ClassroomVideoManager 
            classroomId={id!} 
            videos={videos || []} 
            isTeacher={true}
          />
        </TabsContent>

        <TabsContent value="students">
          <StudentRosterTable members={members || []} classroomId={id!} />
        </TabsContent>

        <TabsContent value="debates">
          <Card className="p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No debates yet</h3>
            <p className="text-muted-foreground mb-4">Create your first debate assignment</p>
            <Button>Create Debate</Button>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Attendance tracking</h3>
            <p className="text-muted-foreground">Track student attendance here</p>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No announcements</h3>
            <p className="text-muted-foreground mb-4">Post announcements to your class</p>
            <Button>Create Announcement</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
