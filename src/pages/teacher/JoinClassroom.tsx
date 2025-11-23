import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Users, Loader2 } from "lucide-react";

export default function JoinClassroom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      fetchClassroom();
    }
  }, [code]);

  const fetchClassroom = async () => {
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .eq("class_code", code)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setClassroom(data);
    } catch (error: any) {
      toast({
        title: "Invalid classroom code",
        description: "The classroom code is invalid or the classroom is no longer active.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !classroom) return;

    setJoining(true);
    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from("classroom_members")
        .select("id")
        .eq("classroom_id", classroom.id)
        .eq("student_id", user.id)
        .single();

      if (existing) {
        toast({
          title: "Already enrolled",
          description: "You are already a member of this classroom.",
        });
        navigate("/niranx/dashboard");
        return;
      }

      // Join classroom
      const { error } = await supabase
        .from("classroom_members")
        .insert({
          classroom_id: classroom.id,
          student_id: user.id,
          enrollment_status: "active",
          role: "student",
        });

      if (error) throw error;

      toast({
        title: "Successfully joined!",
        description: `You have joined ${classroom.name}`,
      });
      navigate("/niranx/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to join",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Classroom not found</h2>
          <p className="text-muted-foreground mb-4">
            The classroom code is invalid or the classroom is no longer active.
          </p>
          <Button onClick={() => navigate("/niranx/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Join Classroom</h1>
          <p className="text-muted-foreground">You've been invited to join a classroom</p>
        </div>

        <div className="bg-muted p-6 rounded-lg space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Classroom Name</p>
            <p className="text-xl font-bold">{classroom.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Subject</p>
            <p className="text-lg">{classroom.subject || "N/A"}</p>
          </div>
          {classroom.grade_level && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grade Level</p>
              <p className="text-lg">{classroom.grade_level}</p>
            </div>
          )}
          {classroom.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{classroom.description}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/niranx/dashboard")}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Join Classroom
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
