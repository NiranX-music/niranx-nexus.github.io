import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  Play, 
  Clock, 
  Calendar,
  Search,
  Trash2,
  ExternalLink,
  CheckCircle,
  Circle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface VideoHistory {
  id: string;
  video_name: string;
  video_url: string;
  duration_seconds: number | null;
  last_position_seconds: number;
  completed: boolean;
  watch_count: number;
  first_watched_at: string;
  last_watched_at: string;
}

export default function VideoLibrary() {
  const [videos, setVideos] = useState<VideoHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadVideoHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadVideoHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading video history:', error);
      toast.error('Failed to load video history');
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_watch_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.filter(v => v.id !== id));
      toast.success('Video removed from history');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgress = (video: VideoHistory) => {
    if (!video.duration_seconds) return 0;
    return (video.last_position_seconds / video.duration_seconds) * 100;
  };

  const filteredVideos = videos.filter(video =>
    video.video_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please login to view your video library
            </p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          📺 Your Video Library
        </h1>
        <p className="text-muted-foreground">
          Track all your watched videos and continue where you left off
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
              <Video className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {videos.filter(v => v.completed).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {videos.filter(v => !v.completed && v.last_position_seconds > 0).length}
                </p>
              </div>
              <Play className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Watches</p>
                <p className="text-2xl font-bold">
                  {videos.reduce((sum, v) => sum + v.watch_count, 0)}
                </p>
              </div>
              <Circle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Start watching videos to build your library!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {video.video_name}
                      </h3>
                      {video.completed && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(video.duration_seconds)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(video.last_watched_at)}
                      </div>
                      <Badge variant="secondary">
                        Watched {video.watch_count}x
                      </Badge>
                    </div>

                    {!video.completed && video.duration_seconds && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{Math.round(getProgress(video))}%</span>
                        </div>
                        <Progress value={getProgress(video)} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(video.video_url, '_blank')}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {video.completed ? 'Watch Again' : 'Continue'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(video.video_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open Link
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteVideo(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
