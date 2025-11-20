import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/AdminRoute";

const emailSchema = z.string().email("Invalid email address");

export default function InviteUser() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        toast({
          title: "Not Authenticated",
          description: "You must be logged in to invite users",
          variant: "destructive",
        });
        navigate('/niranx/auth');
        return;
      }

      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        toast({
          title: "Invalid Email",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Call secure edge function to send invitation
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email }
      });

      if (error) throw error;
      if (!data?.success) throw new Error('Failed to send invitation');

      setInviteSent(true);
      toast({
        title: "Invitation Sent!",
        description: `An invitation has been sent to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error Sending Invitation",
        description: error.message || "Failed to send invitation. This feature may require admin permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      
      <Card className="w-full max-w-md glass-panel relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            Invite User
          </CardTitle>
          <CardDescription>
            Send an invitation to join NiranX StudyVerse
          </CardDescription>
        </CardHeader>

        <CardContent>
          {inviteSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-muted-foreground">
                Invitation sent to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                They will receive an email with instructions to join
              </p>
              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setInviteSent(false);
                    setEmail('');
                  }}
                >
                  Invite Another User
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/niranx/dashboard')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email to invite"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The invited user will receive an email with a link to create their account
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/niranx/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminRoute>
  );
}
