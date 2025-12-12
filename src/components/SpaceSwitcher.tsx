import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSpaces, Space } from "@/hooks/useSpaces";
import { Layers, Lock, Globe, LogOut, Trash2, Eye, EyeOff } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CreateSpaceDialog } from "./CreateSpaceDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SpaceSwitcher() {
  const { spaces, activeSpace, switchToSpace, exitSpace, deleteSpace, spaceLimit } = useSpaces();
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [deleteSpaceId, setDeleteSpaceId] = useState<string | null>(null);

  const handleSpaceClick = (space: Space) => {
    if (space.is_active) return;
    setSelectedSpace(space);
    setPin("");
    setPassword("");
  };

  const handleVerify = async () => {
    if (!selectedSpace || pin.length !== 4) return;
    
    setIsVerifying(true);
    const success = await switchToSpace(
      selectedSpace.id, 
      pin, 
      selectedSpace.has_password ? password : undefined
    );
    setIsVerifying(false);
    
    if (success) {
      setSelectedSpace(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteSpaceId) return;
    await deleteSpace(deleteSpaceId);
    setDeleteSpaceId(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Layers className="h-4 w-4" />
            {activeSpace ? activeSpace.name : "Spaces"}
            {activeSpace && <Badge variant="secondary" className="ml-1 text-xs">Active</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Your Spaces ({spaces.length}/{spaceLimit})
          </div>
          <DropdownMenuSeparator />
          
          {spaces.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No spaces created yet
            </div>
          ) : (
            spaces.map((space) => (
              <DropdownMenuItem
                key={space.id}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleSpaceClick(space)}
              >
                <div className="flex items-center gap-2">
                  {space.is_public ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="truncate max-w-[120px]">{space.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {space.is_active && (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteSpaceId(space.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator />
          
          {activeSpace && (
            <DropdownMenuItem onClick={exitSpace} className="text-orange-500">
              <LogOut className="h-4 w-4 mr-2" />
              Exit Current Space
            </DropdownMenuItem>
          )}
          
          <CreateSpaceDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Layers className="h-4 w-4 mr-2" />
                Create New Space
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PIN/Password Verification Dialog */}
      <Dialog open={!!selectedSpace} onOpenChange={() => setSelectedSpace(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Space PIN</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {selectedSpace?.is_public ? (
                    <Globe className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium">{selectedSpace?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedSpace?.description || "No description"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>4-Digit PIN</Label>
              <InputOTP maxLength={4} value={pin} onChange={setPin}>
                <InputOTPGroup className="justify-center">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {selectedSpace?.has_password && (
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
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

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={pin.length !== 4 || isVerifying || (selectedSpace?.has_password && !password)}
            >
              {isVerifying ? "Verifying..." : "Enter Space"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSpaceId} onOpenChange={() => setDeleteSpaceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this space and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
