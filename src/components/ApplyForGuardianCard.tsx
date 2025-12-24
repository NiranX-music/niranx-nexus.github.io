import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Users, Shield } from "lucide-react";

export function ApplyForGuardianCard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleType, setRoleType] = useState<"parent" | "teacher">("parent");
  const [reason, setReason] = useState("");

  const handleApply = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Check if already has the role
      const { data: existingRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: roleType
      });

      if (existingRole) {
        toast({
          title: "Already a Guardian",
          description: `You already have ${roleType} access`,
        });
        setOpen(false);
        return;
      }

      // Check for pending request
      const { data: pendingRequest } = await supabase
        .from('guardian_role_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('role_type', roleType)
        .eq('status', 'pending')
        .single();

      if (pendingRequest) {
        toast({
          title: "Request Pending",
          description: `Your ${roleType} role request is already pending approval.`,
        });
        setOpen(false);
        return;
      }

      // Submit request for admin approval (not direct role assignment)
      const { error } = await supabase
        .from('guardian_role_requests')
        .insert({
          user_id: user.id,
          role_type: roleType,
          reason: reason || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: `Your ${roleType} role request has been submitted for admin approval.`,
      });

      setOpen(false);
      setReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit guardian role request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="glass-card cursor-pointer card-3d hover-lift group">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">Become a Guardian</h3>
            <p className="text-sm text-muted-foreground">Monitor student progress</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Apply for Guardian Access
          </DialogTitle>
          <DialogDescription>
            As a guardian, you can request access to monitor students' study progress, goals, and activities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>I am a:</Label>
            <RadioGroup 
              value={roleType} 
              onValueChange={(v) => setRoleType(v as "parent" | "teacher")}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parent" id="g-parent" />
                <Label htmlFor="g-parent" className="font-normal cursor-pointer">
                  Parent / Family Member
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="g-teacher" />
                <Label htmlFor="g-teacher" className="font-normal cursor-pointer">
                  Teacher / Tutor
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="reason">Why do you want guardian access? (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="E.g., To help monitor my child's study progress..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">What you can do as a Guardian:</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Request access to specific students</li>
              <li>• View study time and focus sessions</li>
              <li>• Monitor task completion and exam prep</li>
              <li>• Set study goals and time limits</li>
            </ul>
          </div>

          <Button 
            onClick={handleApply} 
            disabled={loading} 
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? "Activating..." : "Activate Guardian Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
