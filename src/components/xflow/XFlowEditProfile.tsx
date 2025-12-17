import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XFlowProfile, useXFlow } from "@/hooks/useXFlow";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface XFlowEditProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: XFlowProfile;
  onProfileUpdated: () => void;
}

export default function XFlowEditProfile({ open, onOpenChange, profile, onProfileUpdated }: XFlowEditProfileProps) {
  const { updateProfile } = useXFlow();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `${profile.id}/avatar-${Date.now()}`;
      const { error } = await supabase.storage
        .from('xflow-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage.from('xflow-media').getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfile({
      display_name: displayName || null,
      bio: bio || null,
      website: website || null,
      gender: gender || null,
      avatar_url: avatarUrl || null
    });

    if (success) {
      onProfileUpdated();
    }
    setIsSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-zinc-900 border-white/10 h-[90vh] rounded-t-xl text-white">
        <SheetHeader>
          <SheetTitle className="text-white">Edit profile</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(90vh-100px)] pb-20">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl">{profile.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-full cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-semibold">{profile.username}</p>
              <label className="text-sm text-primary cursor-pointer">
                Change photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="Add a link"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="bg-white/10 border-0"
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Write something about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                rows={4}
                className="bg-white/10 border-0 resize-none"
              />
              <p className="text-xs text-white/50 text-right">{bio.length}/150</p>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-white/10 border-0">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
