import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Users, Search, Shield, Edit, RefreshCw, Coins } from "lucide-react";

interface UserWithRoles {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  email?: string | null;
  created_at: string | null;
  xp: number | null;
  level: number | null;
  roles: string[];
}

export function AdminUserManager() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [editForm, setEditForm] = useState({ display_name: "", username: "" });
  const [creditLimit, setCreditLimit] = useState(500);
  const [referralBonus, setReferralBonus] = useState(100);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadUsers();
    loadSettings();

    const channel = supabase
      .channel("admin-profiles-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadUsers())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => loadUsers())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadSettings = async () => {
    const [limitRes, bonusRes] = await Promise.all([
      supabase.rpc("get_admin_setting", { p_setting_key: "daily_ai_credit_limit" }),
      supabase.rpc("get_admin_setting", { p_setting_key: "referral_bonus_credits" }),
    ]);
    if (limitRes.data && typeof limitRes.data === "object" && "limit" in (limitRes.data as any)) {
      setCreditLimit((limitRes.data as any).limit);
    }
    if (bonusRes.data && typeof bonusRes.data === "object" && "amount" in (bonusRes.data as any)) {
      setReferralBonus((bonusRes.data as any).amount);
    }
  };

  const loadUsers = async () => {
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.data) {
        const usersWithRoles: UserWithRoles[] = profilesRes.data.map((p) => ({
          user_id: p.user_id,
          username: p.username,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          created_at: p.created_at,
          xp: p.xp,
          level: p.level,
          roles: rolesRes.data?.filter((r) => r.user_id === p.user_id).map((r) => r.role) || [],
        }));
        setUsers(usersWithRoles);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string, action: "add" | "remove") => {
    try {
      if (action === "add") {
        await supabase.from("user_roles").insert({ user_id: userId, role });
      } else {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      }
      toast({ title: "Role updated", description: `Role ${action === "add" ? "added" : "removed"} successfully` });
      loadUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const updateUserInfo = async () => {
    if (!editingUser) return;
    try {
      await supabase
        .from("profiles")
        .update({ display_name: editForm.display_name, username: editForm.username })
        .eq("user_id", editingUser.user_id);
      toast({ title: "User updated" });
      setEditingUser(null);
      loadUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all([
        supabase.from("admin_settings").update({ setting_value: { limit: creditLimit } }).eq("setting_key", "daily_ai_credit_limit"),
        supabase.from("admin_settings").update({ setting_value: { amount: referralBonus } }).eq("setting_key", "referral_bonus_credits"),
      ]);
      toast({ title: "Settings saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return !q || (u.username?.toLowerCase().includes(q)) || (u.display_name?.toLowerCase().includes(q));
  });

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
    moderator: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    teacher: "bg-green-500/10 text-green-500 border-green-500/20",
    parent: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Credit Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="h-5 w-5" />
            AI Credit Settings
          </CardTitle>
          <CardDescription>Configure daily credit limits and referral bonuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Daily Credit Limit</Label>
              <Input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Referral Bonus Credits</Label>
              <Input
                type="number"
                value={referralBonus}
                onChange={(e) => setReferralBonus(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <Button onClick={saveSettings} disabled={savingSettings} size="sm">
              {savingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({users.length})
              </CardTitle>
              <CardDescription>Real-time user management</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>XP / Level</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar_url || ""} />
                            <AvatarFallback>{(u.display_name || u.username || "?")[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{u.display_name || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">@{u.username || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.length > 0 ? u.roles.map((r) => (
                            <Badge key={r} variant="outline" className={`text-[10px] ${roleColors[r] || ""}`}>
                              {r}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className="text-[10px]">user</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{u.xp || 0} / Lv.{u.level || 1}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditForm({ display_name: u.display_name || "", username: u.username || "" });
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Display Name</Label>
                                  <Input value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
                                </div>
                                <div>
                                  <Label>Username</Label>
                                  <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
                                </div>
                                <div>
                                  <Label>Manage Roles</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {["admin", "moderator", "teacher", "parent"].map((role) => {
                                      const hasRole = u.roles.includes(role);
                                      return (
                                        <Button
                                          key={role}
                                          variant={hasRole ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => updateRole(u.user_id, role, hasRole ? "remove" : "add")}
                                          className="text-xs"
                                        >
                                          {hasRole ? `✓ ${role}` : `+ ${role}`}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <Button onClick={updateUserInfo} className="w-full">Save Changes</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Select onValueChange={(v) => {
                            const [role, action] = v.split(":");
                            updateRole(u.user_id, role, action as "add" | "remove");
                          }}>
                            <SelectTrigger className="h-7 w-7 p-0">
                              <Shield className="h-3 w-3" />
                            </SelectTrigger>
                            <SelectContent>
                              {["admin", "moderator", "teacher", "parent"].map((r) => (
                                <SelectItem key={r} value={`${r}:${u.roles.includes(r) ? "remove" : "add"}`}>
                                  {u.roles.includes(r) ? `Remove ${r}` : `Add ${r}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
