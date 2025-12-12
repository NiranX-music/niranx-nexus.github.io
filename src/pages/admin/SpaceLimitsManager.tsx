import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Layers, Search, Save, Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserWithLimit {
  id: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  max_spaces: number;
  space_count: number;
}

export default function SpaceLimitsManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultLimit, setDefaultLimit] = useState(5);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(5);

  useEffect(() => {
    fetchUsersAndLimits();
    fetchDefaultLimit();
  }, []);

  const fetchDefaultLimit = async () => {
    const { data } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "default_space_limit")
      .single();

    if (data) {
      setDefaultLimit(Number(data.setting_value) || 5);
    }
  };

  const fetchUsersAndLimits = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .order("display_name");

      // Fetch user space limits
      const { data: limits } = await supabase
        .from("user_space_limits")
        .select("user_id, max_spaces");

      // Fetch space counts per user
      const { data: spaces } = await supabase
        .from("spaces")
        .select("user_id");

      const limitsMap = new Map(limits?.map(l => [l.user_id, l.max_spaces]) || []);
      const spaceCounts = new Map<string, number>();
      
      spaces?.forEach(s => {
        spaceCounts.set(s.user_id, (spaceCounts.get(s.user_id) || 0) + 1);
      });

      const usersWithLimits: UserWithLimit[] = (profiles || []).map(profile => ({
        id: profile.id,
        display_name: profile.display_name || "Unknown",
        avatar_url: profile.avatar_url,
        max_spaces: limitsMap.get(profile.id) || defaultLimit,
        space_count: spaceCounts.get(profile.id) || 0
      }));

      setUsers(usersWithLimits);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDefaultLimit = async () => {
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          setting_key: "default_space_limit",
          setting_value: defaultLimit,
          updated_by: user?.id
        });

      if (error) throw error;
      toast.success("Default space limit updated");
    } catch (error) {
      console.error("Error updating default limit:", error);
      toast.error("Failed to update default limit");
    }
  };

  const updateUserLimit = async (userId: string, maxSpaces: number) => {
    try {
      const { error } = await supabase
        .from("user_space_limits")
        .upsert({
          user_id: userId,
          max_spaces: maxSpaces,
          set_by: user?.id
        });

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, max_spaces: maxSpaces } : u
      ));
      setEditingUser(null);
      toast.success("User space limit updated");
    } catch (error) {
      console.error("Error updating user limit:", error);
      toast.error("Failed to update user limit");
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Space Limits Manager
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage how many spaces each user can create
        </p>
      </div>

      {/* Default Limit Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Default Space Limit</CardTitle>
          <CardDescription>
            This limit applies to all users without a custom limit
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="space-y-2">
            <Label>Max Spaces per User</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={defaultLimit}
              onChange={(e) => setDefaultLimit(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <Button onClick={updateDefaultLimit} className="gap-2">
            <Save className="h-4 w-4" />
            Save Default
          </Button>
        </CardContent>
      </Card>

      {/* User-specific Limits */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">User Space Limits</CardTitle>
              <CardDescription>
                Set custom limits for individual users
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Spaces</TableHead>
                  <TableHead>Max Limit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url} />
                          <AvatarFallback>
                            {u.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.display_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        {u.space_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingUser === u.id ? (
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={newLimit}
                          onChange={(e) => setNewLimit(Number(e.target.value))}
                          className="w-20"
                          autoFocus
                        />
                      ) : (
                        <Badge variant="secondary">{u.max_spaces}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser === u.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateUserLimit(u.id, newLimit)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(u.id);
                            setNewLimit(u.max_spaces);
                          }}
                        >
                          Edit
                        </Button>
                      )}
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
