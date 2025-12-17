import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  User,
  Calendar,
  Globe,
  Shield
} from "lucide-react";

interface XFlowProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  gender: string | null;
  is_approved: boolean;
  moderation_status: string;
  created_at: string;
  moderated_by: string | null;
  moderated_at: string | null;
}

const XFlowModeration = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<XFlowProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchProfiles();
  }, [activeTab]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('xflow_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'pending') {
        query = query.eq('moderation_status', 'pending');
      } else if (activeTab === 'approved') {
        query = query.eq('moderation_status', 'approved');
      } else if (activeTab === 'rejected') {
        query = query.eq('moderation_status', 'rejected');
      }

      const { data, error } = await query;
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('xflow_profiles')
        .update({
          is_approved: true,
          moderation_status: 'approved',
          moderated_by: user?.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;
      toast.success('Profile approved successfully');
      fetchProfiles();
    } catch (error) {
      console.error('Error approving profile:', error);
      toast.error('Failed to approve profile');
    }
  };

  const handleReject = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('xflow_profiles')
        .update({
          is_approved: false,
          moderation_status: 'rejected',
          moderated_by: user?.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;
      toast.success('Profile rejected');
      fetchProfiles();
    } catch (error) {
      console.error('Error rejecting profile:', error);
      toast.error('Failed to reject profile');
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    pending: profiles.filter(p => p.moderation_status === 'pending').length,
    approved: profiles.filter(p => p.moderation_status === 'approved').length,
    rejected: profiles.filter(p => p.moderation_status === 'rejected').length
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">XFlow Moderation</h1>
        <p className="text-muted-foreground">Review and moderate XFlow profile registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by username or display name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading profiles...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No profiles found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={profile.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {profile.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">@{profile.username}</h3>
                            <Badge variant={
                              profile.moderation_status === 'approved' ? 'default' :
                              profile.moderation_status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {profile.moderation_status}
                            </Badge>
                          </div>
                          {profile.display_name && (
                            <p className="text-muted-foreground">{profile.display_name}</p>
                          )}
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(profile.created_at).toLocaleDateString()}
                            </span>
                            {profile.website && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {profile.website}
                              </span>
                            )}
                            {profile.gender && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {profile.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {profile.moderation_status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500 hover:bg-green-500/20"
                            onClick={() => handleApprove(profile.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-500/20"
                            onClick={() => handleReject(profile.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default XFlowModeration;
