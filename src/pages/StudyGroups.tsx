import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Lock, Globe, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  is_private: boolean;
  max_members: number;
  created_at: string;
  member_count?: number;
}

export default function StudyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    is_private: false,
    max_members: 50,
  });

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchMyGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    if (data) {
      setGroups(data);
    }
    setLoading(false);
  };

  const fetchMyGroups = async () => {
    const { data: memberData } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', user?.id);

    if (memberData && memberData.length > 0) {
      const groupIds = memberData.map(m => m.group_id);
      const { data: groupsData } = await supabase
        .from('study_groups')
        .select('*')
        .in('id', groupIds);

      if (groupsData) {
        setMyGroups(groupsData);
      }
    }
  };

  const createGroup = async () => {
    if (!user) return;

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .insert({
          ...formData,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast.success('Study group created!');
      setDialogOpen(false);
      fetchGroups();
      fetchMyGroups();
      setFormData({
        name: '',
        description: '',
        subject: '',
        is_private: false,
        max_members: 50,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success('Joined group!');
      fetchMyGroups();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Study Groups</h1>
          <p className="text-muted-foreground">Collaborate and learn together</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
              <DialogDescription>
                Create a group to study together with your peers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Group Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Physics Study Circle"
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Physics, Mathematics"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's this group about?"
                  rows={3}
                />
              </div>
              <div>
                <Label>Max Members</Label>
                <Input
                  type="number"
                  value={formData.max_members}
                  onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                  min={2}
                  max={500}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Private Group</Label>
                <Switch
                  checked={formData.is_private}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
                />
              </div>
            </div>
            <Button onClick={createGroup} className="w-full">
              Create Group
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {myGroups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">My Groups</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group) => (
              <Card key={group.id} className="glass-card hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.subject}</CardDescription>
                    </div>
                    {group.is_private ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Max {group.max_members} members</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Discover Groups</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const isMember = myGroups.some(g => g.id === group.id);
            return (
              <Card key={group.id} className="glass-card hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Max {group.max_members}</span>
                    </div>
                    {!isMember && (
                      <Button onClick={() => joinGroup(group.id)} size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    )}
                    {isMember && (
                      <Badge variant="secondary">Member</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}