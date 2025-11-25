import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClassroom } from "@/hooks/useClassroom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Search, Users, BookOpen, GraduationCap } from "lucide-react";

export default function JoinClassroom() {
  const navigate = useNavigate();
  const { classrooms, classroomsLoading } = useClassroom();
  const [searchTerm, setSearchTerm] = useState("");
  const [classCode, setClassCode] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const filteredClassrooms = classrooms?.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.grade_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinByCode = async () => {
    if (!classCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class code",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: classroom, error: fetchError } = await supabase
        .from("classrooms")
        .select("id")
        .eq("class_code", classCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (fetchError || !classroom) {
        toast({
          title: "Error",
          description: "Invalid class code",
          variant: "destructive",
        });
        return;
      }

      await joinClassroom(classroom.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join classroom",
        variant: "destructive",
      });
    }
  };

  const joinClassroom = async (classroomId: string) => {
    setJoiningId(classroomId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("classroom_members").insert({
        classroom_id: classroomId,
        student_id: user.id,
        role: "student",
        enrollment_status: "active",
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Enrolled",
            description: "You are already a member of this classroom",
          });
          navigate(`/niranx/teacher/classrooms/${classroomId}`);
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Successfully joined classroom!",
        });
        navigate(`/niranx/teacher/classrooms/${classroomId}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join classroom",
        variant: "destructive",
      });
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Browse Classrooms</h1>
          <p className="text-muted-foreground">
            Discover and join classrooms to access learning materials
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join with Class Code</CardTitle>
            <CardDescription>
              Enter the code provided by your teacher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter class code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                className="uppercase"
              />
              <Button onClick={handleJoinByCode} disabled={!classCode.trim()}>
                Join
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search classrooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {classroomsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClassrooms?.map((classroom) => (
                <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{classroom.name}</CardTitle>
                        <CardDescription>{classroom.subject}</CardDescription>
                      </div>
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {classroom.grade_level && (
                        <Badge variant="secondary">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {classroom.grade_level}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {classroom.class_code}
                      </Badge>
                    </div>
                    {classroom.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {classroom.description}
                      </p>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => joinClassroom(classroom.id)}
                      disabled={joiningId === classroom.id}
                    >
                      {joiningId === classroom.id ? "Joining..." : "View Classroom"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!classroomsLoading && filteredClassrooms?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No classrooms found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
