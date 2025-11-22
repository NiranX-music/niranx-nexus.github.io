import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { UserPlus, GraduationCap, TrendingUp } from "lucide-react";
import { GuardianAccessRequests } from "@/components/guardian/GuardianAccessRequests";
import { StudentSelector } from "@/components/guardian/StudentSelector";
import { StudentPerformance } from "@/components/guardian/StudentPerformance";
import { WeeklySummary } from "@/components/guardian/WeeklySummary";
import { StudyGoals } from "@/components/guardian/StudyGoals";

export default function GuardianDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuardian, setIsGuardian] = useState(false);

  useEffect(() => {
    checkGuardianRole();
  }, [user]);

  useEffect(() => {
    if (isGuardian && user) {
      fetchStudents();
    }
  }, [isGuardian, user]);

  const checkGuardianRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'parent'
      });

      if (error) throw error;

      const { data: teacherData } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'teacher'
      });

      setIsGuardian(data === true || teacherData === true);
    } catch (error) {
      console.error('Error checking guardian role:', error);
      toast({
        title: "Error",
        description: "Failed to verify guardian access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_guardians')
        .select(`
          student_id,
          relationship_type,
          profiles:student_id (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('guardian_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      setStudents(data || []);
      if (data && data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].student_id);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isGuardian) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need parent or teacher privileges to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please contact an administrator to request guardian access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Guardian Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and support your students' learning journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchStudents()}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Study Goals</TabsTrigger>
          <TabsTrigger value="requests">Access Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {students.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  No Students Yet
                </CardTitle>
                <CardDescription>
                  Request access to students to start monitoring their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Go to the "Access Requests" tab to send a request to a student.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <StudentSelector
                students={students}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
              />

              {selectedStudentId && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <StudentPerformance studentId={selectedStudentId} />
                    <StudyGoals
                      studentId={selectedStudentId}
                      guardianId={user?.id || ''}
                      mode="view"
                    />
                  </div>
                  <div className="space-y-4">
                    <WeeklySummary studentId={selectedStudentId} />
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="goals">
          {selectedStudentId ? (
            <StudyGoals
              studentId={selectedStudentId}
              guardianId={user?.id || ''}
              mode="manage"
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Student</CardTitle>
                <CardDescription>
                  Choose a student from the Overview tab to manage their study goals
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <GuardianAccessRequests guardianId={user?.id || ''} onRequestAccepted={fetchStudents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
