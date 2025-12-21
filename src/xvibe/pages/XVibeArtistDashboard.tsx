import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Music, 
  Disc3, 
  Users, 
  Play, 
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ArtistProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  follower_count: number;
  monthly_listeners: number;
}

interface Upload {
  id: string;
  title: string;
  type: 'track' | 'album';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  cover_url: string | null;
  created_at: string;
  rejection_reason?: string;
}

export default function XVibeArtistDashboard() {
  const navigate = useNavigate();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlays: 0,
    totalTracks: 0,
    totalAlbums: 0,
    followers: 0
  });

  useEffect(() => {
    fetchArtistData();
  }, []);

  const fetchArtistData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/xvibe/auth');
        return;
      }

      // Fetch artist profile
      const { data: artist } = await supabase
        .from('xvibe_artists')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!artist) {
        // Redirect to artist registration
        navigate('/xvibe/artist/register');
        return;
      }

      setArtistProfile(artist);

      // Fetch uploads (tracks)
      const { data: tracks } = await supabase
        .from('xvibe_tracks')
        .select('id, title, cover_url, status, created_at')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });

      const trackUploads: Upload[] = (tracks || []).map(t => ({
        ...t,
        type: 'track' as const,
        status: (t.status || 'draft') as Upload['status']
      }));

      // Fetch albums
      const { data: albums } = await supabase
        .from('xvibe_albums')
        .select('id, title, cover_url, status, created_at')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });

      const albumUploads: Upload[] = (albums || []).map(a => ({
        ...a,
        type: 'album' as const,
        status: (a.status || 'draft') as Upload['status']
      }));

      setUploads([...trackUploads, ...albumUploads].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

      // Calculate stats
      const { data: playStats } = await supabase
        .from('xvibe_tracks')
        .select('play_count')
        .eq('artist_id', artist.id);

      const totalPlays = (playStats || []).reduce((sum, t) => sum + (t.play_count || 0), 0);

      setStats({
        totalPlays,
        totalTracks: tracks?.length || 0,
        totalAlbums: albums?.length || 0,
        followers: artist.follower_count || 0
      });

    } catch (error) {
      console.error('Error fetching artist data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" /> Live</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400"><AlertCircle className="w-3 h-3 mr-1" /> Draft</Badge>;
    }
  };

  if (loading) {
    return (
      <XVibeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DB954]" />
        </div>
      </XVibeLayout>
    );
  }

  return (
    <XVibeLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
              {artistProfile?.avatar_url ? (
                <img src={artistProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Music className="w-8 h-8 text-black" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {artistProfile?.name}
                {artistProfile?.is_verified && (
                  <CheckCircle className="w-5 h-5 text-[#1DB954] fill-current" />
                )}
              </h1>
              <p className="text-[#B3B3B3]">Artist Dashboard</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/xvibe/upload')}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" /> Upload
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/xvibe/artist/${artistProfile?.id}`)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" /> View Profile
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1DB954]/20">
                  <Play className="w-5 h-5 text-[#1DB954]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalPlays.toLocaleString()}</p>
                  <p className="text-sm text-[#B3B3B3]">Total Plays</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalTracks}</p>
                  <p className="text-sm text-[#B3B3B3]">Tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Disc3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalAlbums}</p>
                  <p className="text-sm text-[#B3B3B3]">Albums</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.followers.toLocaleString()}</p>
                  <p className="text-sm text-[#B3B3B3]">Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="uploads" className="space-y-6">
          <TabsList className="bg-[#181818] border-none">
            <TabsTrigger value="uploads" className="data-[state=active]:bg-[#282828]">Uploads</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#282828]">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#282828]">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="space-y-4">
            {uploads.length === 0 ? (
              <Card className="bg-[#181818] border-none">
                <CardContent className="p-12 text-center">
                  <Upload className="w-12 h-12 text-[#B3B3B3] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No uploads yet</h3>
                  <p className="text-[#B3B3B3] mb-4">Start sharing your music with the world</p>
                  <Button 
                    onClick={() => navigate('/xvibe/upload')}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                  >
                    Upload Your First Track
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {uploads.map((upload) => (
                  <Card key={upload.id} className="bg-[#181818] border-none hover:bg-[#282828] transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded bg-[#282828] flex-shrink-0 overflow-hidden">
                        {upload.cover_url ? (
                          <img src={upload.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {upload.type === 'album' ? (
                              <Disc3 className="w-6 h-6 text-[#B3B3B3]" />
                            ) : (
                              <Music className="w-6 h-6 text-[#B3B3B3]" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{upload.title}</h4>
                        <p className="text-sm text-[#B3B3B3] capitalize">{upload.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(upload.status)}
                        <span className="text-sm text-[#B3B3B3]">
                          {new Date(upload.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-[#181818] border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#1DB954]" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-[#B3B3B3]">
                  <p>Analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-[#181818] border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Artist Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-[#B3B3B3] mb-2 block">Artist Name</label>
                  <Input 
                    value={artistProfile?.name || ''} 
                    className="bg-[#282828] border-none text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm text-[#B3B3B3] mb-2 block">Bio</label>
                  <Textarea 
                    value={artistProfile?.bio || ''} 
                    className="bg-[#282828] border-none text-white min-h-[100px]"
                    readOnly
                  />
                </div>
                <Button 
                  onClick={() => navigate('/xvibe/artist/settings')}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </XVibeLayout>
  );
}
