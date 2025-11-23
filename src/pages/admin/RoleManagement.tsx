import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, UserPlus, Users } from "lucide-react";

export default function RoleManagement() {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"teacher" | "moderator">("teacher");
  const [reason, setReason] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  const { data: roleAssignments, refetch } = useQuery({
    queryKey: ["role-assignments"],
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from("admin_role_assignments")
        .select("*")
        .order("granted_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data separately
      const userIds = [...new Set([
        ...assignments.map(a => a.granted_to),
        ...assignments.map(a => a.granted_by),
      ])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return assignments.map(a => ({
        ...a,
        granted_to_profile: profileMap.get(a.granted_to),
        granted_by_profile: profileMap.get(a.granted_by),
      }));
    },
  });

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !reason) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGranting(true);
    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("username", userEmail)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "User not found",
          description: "No user found with that email/username",
          variant: "destructive",
        });
        return;
      }

      // Insert role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: profiles.user_id,
          role: selectedRole,
        });

      if (roleError) {
        if (roleError.code === "23505") {
          toast({
            title: "Role already exists",
            description: "This user already has that role",
            variant: "destructive",
          });
        } else {
          throw roleError;
        }
        return;
      }

      // Record the assignment
      const { error: assignmentError } = await supabase
        .from("admin_role_assignments")
        .insert({
          granted_to: profiles.user_id,
          role_granted: selectedRole,
          granted_by: user?.id,
          reason: reason,
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: "Role granted",
        description: `Successfully granted ${selectedRole} role to user`,
      });

      setUserEmail("");
      setReason("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeRole = async (assignmentId: string, userId: string, role: string) => {
    try {
      // Update the assignment record
      const { error: updateError } = await supabase
        .from("admin_role_assignments")
        .update({
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
        })
        .eq("id", assignmentId);

      if (updateError) throw updateError;

      // Delete the role
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (deleteError) throw deleteError;

      toast({
        title: "Role revoked",
        description: "Successfully revoked the role",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Grant and manage user roles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Grant Role</h2>
          </div>
          <form onSubmit={handleGrantRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">User Email/Username *</Label>
              <Input
                id="userEmail"
                placeholder="Enter user email or username"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Why is this role being granted?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isGranting}>
              {isGranting ? "Granting..." : "Grant Role"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Role Statistics</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Teachers</p>
              <p className="text-2xl font-bold">
                {roleAssignments?.filter(r => r.role_granted === "teacher" && !r.revoked_at).length || 0}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Moderators</p>
              <p className="text-2xl font-bold">
                {roleAssignments?.filter(r => r.role_granted === "moderator" && !r.revoked_at).length || 0}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Revoked Roles</p>
              <p className="text-2xl font-bold">
                {roleAssignments?.filter(r => r.revoked_at).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Role Assignments</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Granted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roleAssignments?.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  {assignment.granted_to_profile?.display_name || assignment.granted_to_profile?.username}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{assignment.role_granted}</span>
                </TableCell>
                <TableCell>
                  {assignment.granted_by_profile?.display_name || assignment.granted_by_profile?.username}
                </TableCell>
                <TableCell>
                  {new Date(assignment.granted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {assignment.revoked_at ? (
                    <span className="text-destructive">Revoked</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </TableCell>
                <TableCell>
                  {!assignment.revoked_at && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeRole(assignment.id, assignment.granted_to, assignment.role_granted)}
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
