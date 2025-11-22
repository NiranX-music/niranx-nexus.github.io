import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function StudentGuardianRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardians, setGuardians] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchGuardians();
      
      // Subscribe to changes
      const channel = supabase
        .channel('student_request_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guardian_access_requests',
            filter: `student_id=eq.${user.id}`
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('guardian_access_requests')
        .select(`
          *,
          profiles:guardian_id (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuardians = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_guardians')
        .select(`
          *,
          profiles:guardian_id (
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setGuardians(data || []);
    } catch (error) {
      console.error('Error fetching guardians:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string, guardianId: string, relationshipType: string) => {
    if (!user) return;

    try {
      // Update request status
      const { error: requestError } = await supabase
        .from('guardian_access_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Create guardian relationship
      const { error: relationError } = await supabase
        .from('student_guardians')
        .insert({
          student_id: user.id,
          guardian_id: guardianId,
          relationship_type: relationshipType,
          status: 'accepted'
        });

      if (relationError) throw relationError;

      toast({
        title: "Request Accepted",
        description: "Guardian access has been granted",
      });

      fetchRequests();
      fetchGuardians();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('guardian_access_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Guardian access has been denied",
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAccess = async (relationshipId: string) => {
    try {
      const { error } = await supabase
        .from('student_guardians')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;

      toast({
        title: "Access Revoked",
        description: "Guardian access has been removed",
      });

      fetchGuardians();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke access",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Requests */}
      {requests.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Pending Access Requests
            </CardTitle>
            <CardDescription>
              Review and respond to guardian access requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((request) => {
              const profile = request.profiles;
              
              return (
                <div key={request.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>
                        <UserCheck className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{profile?.display_name || profile?.username || 'Unknown User'}</h4>
                        <Badge variant="outline" className="capitalize">{request.relationship_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.student_email}</p>
                      {request.message && (
                        <p className="text-sm italic text-muted-foreground mt-2">"{request.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAcceptRequest(request.id, request.guardian_id, request.relationship_type)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(request.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Current Guardians */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Your Guardians
          </CardTitle>
          <CardDescription>
            People who can monitor your study progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guardians.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No guardians yet
            </p>
          ) : (
            <div className="space-y-3">
              {guardians.map((guardian) => {
                const profile = guardian.profiles;
                
                return (
                  <div key={guardian.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>
                          <UserCheck className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile?.display_name || profile?.username || 'Unknown'}</p>
                        <Badge variant="secondary" className="capitalize text-xs mt-1">
                          {guardian.relationship_type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeAccess(guardian.id)}
                      className="text-destructive"
                    >
                      Revoke
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
