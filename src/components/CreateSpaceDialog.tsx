import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSpaces } from "@/hooks/useSpaces";
import { Plus, Globe, Lock, Eye, EyeOff } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface CreateSpaceDialogProps {
  trigger?: React.ReactNode;
}

export function CreateSpaceDialog({ trigger }: CreateSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spaceUrl, setSpaceUrl] = useState("");
  const [pin, setPin] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { createSpace, spaces, spaceLimit } = useSpaces();

  const handleCreate = async () => {
    if (!name.trim() || pin.length !== 4) return;

    setIsCreating(true);
    const result = await createSpace({
      name: name.trim(),
      description: description.trim() || undefined,
      space_url: spaceUrl.trim() || undefined,
      pin,
      password: hasPassword ? password : undefined,
      is_public: isPublic
    });

    setIsCreating(false);
    if (result) {
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSpaceUrl("");
    setPin("");
    setHasPassword(false);
    setPassword("");
    setIsPublic(false);
  };

  const canCreate = spaces.length < spaceLimit;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2" disabled={!canCreate}>
            <Plus className="h-4 w-4" />
            Create New Space
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Space</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-xs text-muted-foreground">
            Spaces: {spaces.length} / {spaceLimit}
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-name">Space Name *</Label>
            <Input
              id="space-name"
              placeholder="My Study Space"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-desc">Description</Label>
            <Textarea
              id="space-desc"
              placeholder="What is this space for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-url">Space URL (optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/space/</span>
              <Input
                id="space-url"
                placeholder="my-space"
                value={spaceUrl}
                onChange={(e) => setSpaceUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty for auto-generated URL
            </p>
          </div>

          <div className="space-y-2">
            <Label>4-Digit PIN *</Label>
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Required to access this space
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has-password">Add Password Protection</Label>
            <Switch
              id="has-password"
              checked={hasPassword}
              onCheckedChange={setHasPassword}
            />
          </div>

          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="space-password">Password</Label>
              <div className="relative">
                <Input
                  id="space-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-orange-500" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isPublic ? "Public Space" : "Private Space"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublic 
                    ? "Anyone can view this space's data" 
                    : "Only you can access this space"}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <Button 
            onClick={handleCreate} 
            className="w-full" 
            disabled={!name.trim() || pin.length !== 4 || isCreating || (hasPassword && !password)}
          >
            {isCreating ? "Creating..." : "Create Space"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
