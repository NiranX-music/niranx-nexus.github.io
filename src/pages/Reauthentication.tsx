import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Reauthentication() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const handleReauthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.email) {
        toast({
          title: "Not Authenticated",
          description: "You must be logged in to reauthenticate",
          variant: "destructive",
        });
        navigate('/niranx/auth');
        return;
      }

      // Reauthenticate by signing in again
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Reauthentication Successful",
        description: "You have been reauthenticated successfully",
      });

      navigate('/niranx/dashboard');
    } catch (error: any) {
      toast({
        title: "Reauthentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">You must be logged in to reauthenticate</p>
            <Button onClick={() => navigate('/niranx/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      
      <Card className="w-full max-w-md glass-panel relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            Reauthentication Required
          </CardTitle>
          <CardDescription>
            For security reasons, please confirm your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleReauthenticate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your password to confirm your identity
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Confirm Identity
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
        </CardContent>
      </Card>
    </div>
  );
}
