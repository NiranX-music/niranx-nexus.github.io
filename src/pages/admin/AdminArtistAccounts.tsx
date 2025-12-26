import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, RefreshCw, Music, Link as LinkIcon, Edit, 
  Trash2, Eye, EyeOff, User, Globe
} from "lucide-react";
import { format } from "date-fns";

interface ArtistAccount {
  id: string;
  admin_user_id: string;
  artist_id: string;
  custom_url: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  xvibe_artists?: {
    name: string;
    avatar_url: string | null;
    bio: string | null;
    is_verified: boolean;
  };
}

export default function AdminArtistAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ArtistAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [artistName, setArtistName] = useState("");
  const [artistBio, setArtistBio] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("xvibe_admin_artist_accounts")
        .select(`
          *,
          xvibe_artists (
            name,
            avatar_url,
            bio,
            is_verified
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load artist accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArtist = async () => {
    if (!artistName.trim()) {
      toast.error("Artist name is required");
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setCreating(true);
    try {
      // Hash the password
      const { data: hashData, error: hashError } = await supabase.functions.invoke("hash-password", {
        body: { password }
      });

      if (hashError) throw hashError;

      // Create the artist
      const { data: artistData, error: artistError } = await supabase
        .from("xvibe_artists")
        .insert({
          name: artistName,
          bio: artistBio || null,
          custom_url: customUrl || null,
          email: email,
          password_hash: hashData.hash,
          created_by: user?.id
        })
        .select()
        .single();

      if (artistError) throw artistError;

      // Create the admin artist account link
      const { error: accountError } = await supabase
        .from("xvibe_admin_artist_accounts")
        .insert({
          admin_user_id: user?.id,
          artist_id: artistData.id,
          custom_url: customUrl || null,
          email: email
        });

      if (accountError) throw accountError;

      toast.success(`Artist "${artistName}" created successfully`);
      setDialogOpen(false);
      resetForm();
      fetchAccounts();
    } catch (error: any) {
      console.error("Error creating artist:", error);
      toast.error(error.message || "Failed to create artist");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setArtistName("");
    setArtistBio("");
    setCustomUrl("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleToggleActive = async (account: ArtistAccount) => {
    try {
      const { error } = await supabase
        .from("xvibe_admin_artist_accounts")
        .update({ is_active: !account.is_active })
        .eq("id", account.id);

      if (error) throw error;

      setAccounts(accounts.map(a => 
        a.id === account.id ? { ...a, is_active: !a.is_active } : a
      ));
      
      toast.success(`Artist ${account.is_active ? "deactivated" : "activated"}`);
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (account: ArtistAccount) => {
    if (!confirm("Are you sure you want to delete this artist account?")) return;

    try {
      const { error } = await supabase
        .from("xvibe_admin_artist_accounts")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      setAccounts(accounts.filter(a => a.id !== account.id));
      toast.success("Artist account deleted");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const generateCustomUrl = () => {
    const slug = artistName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setCustomUrl(slug);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Music className="h-8 w-8 text-primary" />
            XVibe Artist Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage XVibe artist accounts with unique URLs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAccounts} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Artist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Artist Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Artist Name *</Label>
                  <Input
                    placeholder="Enter artist name"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    placeholder="Artist biography..."
                    value={artistBio}
                    onChange={(e) => setArtistBio(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Custom URL</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={generateCustomUrl}
                      disabled={!artistName}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/niranx/xvibe/artist/</span>
                    <Input
                      placeholder="custom-url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Login Credentials</p>
                  
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="artist@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mt-3">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateArtist} 
                  className="w-full"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Artist Account
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Artists</p>
              <p className="text-2xl font-bold">{accounts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Music className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{accounts.filter(a => a.is_active).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <LinkIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">With Custom URLs</p>
              <p className="text-2xl font-bold">{accounts.filter(a => a.custom_url).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Artist Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No artist accounts created yet</p>
              <p className="text-sm mt-2">Click "Create Artist" to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artist</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Custom URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={account.xvibe_artists?.avatar_url || ""} />
                          <AvatarFallback>
                            {account.xvibe_artists?.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{account.xvibe_artists?.name}</p>
                          {account.xvibe_artists?.is_verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{account.email || "N/A"}</TableCell>
                    <TableCell>
                      {account.custom_url ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          /niranx/xvibe/artist/{account.custom_url}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(account.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(account)}
                          title={account.is_active ? "Deactivate" : "Activate"}
                        >
                          {account.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}