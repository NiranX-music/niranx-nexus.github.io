import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Send } from "lucide-react";

interface GuardianAccessRequestsProps {
  guardianId: string;
  onRequestAccepted?: () => void;
}

export function GuardianAccessRequests({ guardianId, onRequestAccepted }: GuardianAccessRequestsProps) {
  const [studentEmail, setStudentEmail] = useState("");
  const [relationshipType, setRelationshipType] = useState<"parent" | "teacher">("parent");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to changes
    const channel = supabase
      .channel('guardian_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guardian_access_requests',
          filter: `guardian_id=eq.${guardianId}`
        },
        () => {
          fetchRequests();
          if (onRequestAccepted) {
            onRequestAccepted();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guardianId]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('guardian_access_requests')
        .select('*')
        .eq('guardian_id', guardianId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find student by email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', studentEmail.split('@')[0])
        .single();

      const { error } = await supabase
        .from('guardian_access_requests')
        .insert({
          student_email: studentEmail,
          guardian_id: guardianId,
          relationship_type: relationshipType,
          message: message || null,
          student_id: profileData?.user_id || null
        });

      if (error) throw error;

      toast({
        title: "Request Sent",
        description: "Your access request has been sent to the student",
      });

      setStudentEmail("");
      setMessage("");
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Request Student Access</CardTitle>
          <CardDescription>
            Send a request to monitor a student's progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <Label htmlFor="studentEmail">Student Email</Label>
              <Input
                id="studentEmail"
                type="email"
                placeholder="student@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Relationship Type</Label>
              <RadioGroup value={relationshipType} onValueChange={(value) => setRelationshipType(value as "parent" | "teacher")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent" className="font-normal">Parent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="font-normal">Teacher</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Why do you want to monitor this student's progress?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>
            Track the status of your access requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{request.student_email}</p>
                    <p className="text-sm text-muted-foreground capitalize">{request.relationship_type}</p>
                    {request.message && (
                      <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
