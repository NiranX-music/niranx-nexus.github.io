import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Music, 
  Disc, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Release {
  id: string;
  title: string;
  release_type: 'single' | 'ep' | 'album';
  cover_url: string | null;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'live';
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: Edit2 },
  in_review: { label: 'In Review', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  live: { label: 'Live', color: 'bg-[#1DB954]', icon: CheckCircle },
};

export default function XVibeReleaseDashboard() {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/xvibe/auth');
        return;
      }

      const { data: artist } = await supabase
        .from('xvibe_artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!artist) {
        navigate('/xvibe/artist/register');
        return;
      }

      setArtistId(artist.id);

      const { data, error } = await supabase
        .from('xvibe_releases')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReleases((data || []) as Release[]);
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast.error('Failed to load releases');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Release['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getReleaseIcon = (type: Release['release_type']) => {
    switch (type) {
      case 'album':
        return <Disc className="w-5 h-5 text-purple-400" />;
      case 'ep':
        return <Disc className="w-5 h-5 text-blue-400" />;
      default:
        return <Music className="w-5 h-5 text-[#1DB954]" />;
    }
  };

  return (
    <XVibeLayout>
      <div className="min-h-full bg-[#121212] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Release Dashboard</h1>
            <p className="text-[#B3B3B3] mt-1">Manage your music releases</p>
          </div>
          <Button 
            onClick={() => navigate('/xvibe/release/new')}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Release
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <p className="text-[#B3B3B3] text-sm">Total Releases</p>
              <p className="text-2xl font-bold text-white">{releases.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <p className="text-[#B3B3B3] text-sm">Live</p>
              <p className="text-2xl font-bold text-[#1DB954]">
                {releases.filter(r => r.status === 'live').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <p className="text-[#B3B3B3] text-sm">In Review</p>
              <p className="text-2xl font-bold text-yellow-500">
                {releases.filter(r => r.status === 'in_review').length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-[#181818] border-none">
            <CardContent className="p-4">
              <p className="text-[#B3B3B3] text-sm">Drafts</p>
              <p className="text-2xl font-bold text-gray-400">
                {releases.filter(r => r.status === 'draft').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Releases List */}
        <Card className="bg-[#181818] border-none">
          <CardHeader>
            <CardTitle className="text-white">Your Releases</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 bg-[#282828]" />
                ))}
              </div>
            ) : releases.length === 0 ? (
              <div className="text-center py-12">
                <Disc className="w-16 h-16 text-[#B3B3B3] mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No releases yet</h3>
                <p className="text-[#B3B3B3] mb-4">Start by creating your first release</p>
                <Button 
                  onClick={() => navigate('/xvibe/release/new')}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                >
                  Create Release
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {releases.map(release => (
                  <div
                    key={release.id}
                    onClick={() => navigate(`/xvibe/release/${release.id}`)}
                    className="flex items-center gap-4 p-4 bg-[#282828] rounded-lg hover:bg-[#333] cursor-pointer transition-colors group"
                  >
                    {/* Cover */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#181818]">
                      {release.cover_url ? (
                        <img 
                          src={release.cover_url} 
                          alt={release.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getReleaseIcon(release.release_type)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold truncate">{release.title}</h3>
                        {getStatusBadge(release.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#B3B3B3]">
                        <span className="capitalize">{release.release_type}</span>
                        <span>•</span>
                        <span>Updated {format(new Date(release.updated_at), 'MMM d, yyyy')}</span>
                      </div>
                      {release.status === 'rejected' && release.rejection_reason && (
                        <div className="flex items-center gap-1 mt-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{release.rejection_reason}</span>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-[#B3B3B3] group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </XVibeLayout>
  );
}
