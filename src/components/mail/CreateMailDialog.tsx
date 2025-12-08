import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Loader2, Phone, Calendar, Link2 } from "lucide-react";
import { z } from "zod";

const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, dots and underscores");

interface CreateMailDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const CreateMailDialog = ({ trigger, onSuccess }: CreateMailDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    dateOfBirth: "",
    mobileNumber: "",
    linkExistingAccount: false,
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      usernameSchema.parse(username);
    } catch {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from("niranx_mailboxes")
        .select("id")
        .eq("email_address", `${username}@niranx.com`)
        .single();

      setUsernameAvailable(!data);
    } catch (error) {
      setUsernameAvailable(true);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setFormData({ ...formData, username: value });
    checkUsernameAvailability(value);
  };

  const handleCreateMailbox = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to create a mail account",
        variant: "destructive",
      });
      return;
    }

    try {
      usernameSchema.parse(formData.username);
    } catch (error: any) {
      toast({
        title: "Invalid username",
        description: error.errors?.[0]?.message || "Invalid username format",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dateOfBirth) {
      toast({
        title: "Date of birth required",
        description: "Please enter your date of birth",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const emailAddress = `${formData.username}@niranx.com`;

      // Check if user already has a mailbox
      const { data: existingMailboxes } = await supabase
        .from("niranx_mailboxes")
        .select("id")
        .eq("user_id", user.id);

      const isPrimary = !existingMailboxes || existingMailboxes.length === 0;

      const { data, error } = await supabase
        .from("niranx_mailboxes")
        .insert({
          user_id: user.id,
          email_address: emailAddress,
          display_name: formData.displayName || formData.username,
          date_of_birth: formData.dateOfBirth,
          mobile_number: formData.mobileNumber || null,
          is_primary: isPrimary,
          linked_account_id: formData.linkExistingAccount ? user.id : null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("This email address is already taken");
        }
        throw error;
      }

      // Create default folders
      const defaultFolders = [
        { name: "Inbox", icon: "inbox", is_system: true },
        { name: "Sent", icon: "send", is_system: true },
        { name: "Drafts", icon: "file-text", is_system: true },
        { name: "Spam", icon: "alert-circle", is_system: true },
        { name: "Trash", icon: "trash", is_system: true },
        { name: "Archive", icon: "archive", is_system: true },
      ];

      await supabase.from("niranx_email_folders").insert(
        defaultFolders.map((folder) => ({
          mailbox_id: data.id,
          ...folder,
        }))
      );

      toast({
        title: "Mail account created!",
        description: `Your new email address is ${emailAddress}`,
      });

      setOpen(false);
      setFormData({
        username: "",
        displayName: "",
        dateOfBirth: "",
        mobileNumber: "",
        linkExistingAccount: false,
      });
      setStep(1);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Failed to create mailbox",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Create a Mail
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Create @niranx.com Mail
          </DialogTitle>
          <DialogDescription>
            Create your own @niranx.com email address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mail-username">Email Username *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="mail-username"
                    placeholder="yourname"
                    value={formData.username}
                    onChange={handleUsernameChange}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">@niranx.com</span>
                </div>
                {checkingUsername && (
                  <p className="text-sm text-muted-foreground">Checking availability...</p>
                )}
                {usernameAvailable === true && formData.username.length >= 3 && (
                  <p className="text-sm text-green-600">✓ Username available</p>
                )}
                {usernameAvailable === false && (
                  <p className="text-sm text-destructive">✗ Username not available or invalid</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mail-displayname">Display Name</Label>
                <Input
                  id="mail-displayname"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!usernameAvailable || formData.username.length < 3}
              >
                Continue
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mail-dob" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth *
                </Label>
                <Input
                  id="mail-dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mail-mobile" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number (optional)
                </Label>
                <Input
                  id="mail-mobile"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Mobile verification is optional but recommended for account recovery
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="link-account"
                  checked={formData.linkExistingAccount}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, linkExistingAccount: checked as boolean })
                  }
                />
                <Label htmlFor="link-account" className="flex items-center gap-2 text-sm">
                  <Link2 className="w-4 h-4" />
                  Link with current account
                </Label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateMailbox}
                  disabled={loading || !formData.dateOfBirth}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Mail
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
