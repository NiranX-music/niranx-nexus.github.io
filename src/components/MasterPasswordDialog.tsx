import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MasterPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * 
 * This component implements a HARDCODED master password for admin access.
 * This is EXTREMELY INSECURE and should NEVER be used in production!
 * 
 * Security Issues:
 * - Password is visible in client-side code (easily discovered)
 * - No encryption or hashing
 * - Anyone can become admin by viewing source code
 * - No audit trail of who became admin
 * - Cannot revoke access once password is known
 * 
 * ⚠️ USE ONLY FOR DEVELOPMENT/TESTING ⚠️
 * 
 * For production, use the existing secure admin request workflow:
 * Settings → Become an Admin → Submit Request → Admin Approval
 */
export function MasterPasswordDialog({ open, onOpenChange }: MasterPasswordDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // ⚠️ HARDCODED CREDENTIALS - INSECURE! ⚠️
  const MASTER_PASSWORD = "niranxdev64";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to become an admin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate credentials (client-side only - INSECURE!)
      if (password !== MASTER_PASSWORD) {
        toast({
          title: "Access Denied",
          description: "Incorrect master password",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "Already Admin",
          description: "You already have admin privileges",
        });
        onOpenChange(false);
        setLoading(false);
        return;
      }

      // Grant admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Admin Access Granted",
        description: "You now have admin privileges. Please refresh the page.",
      });

      // Reset form
      setUsername("");
      setPassword("");
      onOpenChange(false);

      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Error granting admin access:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Admin Master Access
          </DialogTitle>
          <DialogDescription>
            Enter the master credentials to gain admin access.
          </DialogDescription>
        </DialogHeader>

        {/* Security Warning Banner */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-xs text-destructive">
              <p className="font-semibold mb-1">Development/Testing Only</p>
              <p>This feature uses hardcoded credentials and should never be used in production environments.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Master Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Grant Admin Access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
