import { useState, useEffect } from 'react';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Music, 
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  Eye,
  AlertTriangle,
  Shield,
  Disc3
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingItem {
  id: string;
  title: string;
  type: 'track' | 'album';
  artist_name: string;
  artist_id: string;
  cover_url: string | null;
  audio_url?: string;
  created_at: string;
  is_explicit: boolean;
  genre?: string;
}

export default function XVibeModeration() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioRef] = useState(() => new Audio());

  useEffect(() => {
    fetchPendingItems();
    return () => {
      audioRef.pause();
    };
  }, []);

  const fetchPendingItems = async () => {
    try {
      // Fetch pending tracks
      const { data: tracks } = await supabase
        .from('xvibe_tracks')
        .select(`
          id, title, cover_url, audio_url, created_at, is_explicit, genre,
          artist:xvibe_artists(id, name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      const trackItems: PendingItem[] = (tracks || []).map(t => ({
        id: t.id,
        title: t.title,
        type: 'track' as const,
        artist_name: (t.artist as any)?.name || 'Unknown',
        artist_id: (t.artist as any)?.id,
        cover_url: t.cover_url,
        audio_url: t.audio_url,
        created_at: t.created_at,
        is_explicit: t.is_explicit || false,
        genre: t.genre
      }));

      // Fetch pending albums
      const { data: albums } = await supabase
        .from('xvibe_albums')
        .select(`
          id, title, cover_url, created_at,
          artist:xvibe_artists(id, name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      const albumItems: PendingItem[] = (albums || []).map(a => ({
        id: a.id,
        title: a.title,
        type: 'album' as const,
        artist_name: (a.artist as any)?.name || 'Unknown',
        artist_id: (a.artist as any)?.id,
        cover_url: a.cover_url,
        created_at: a.created_at,
        is_explicit: false
      }));

      setPendingItems([...trackItems, ...albumItems].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ));

    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = (item: PendingItem) => {
    if (!item.audio_url) return;

    if (playingId === item.id) {
      audioRef.pause();
      setPlayingId(null);
    } else {
      audioRef.src = item.audio_url;
      audioRef.play();
      setPlayingId(item.id);
    }
  };

  const handleApprove = async (item: PendingItem) => {
    try {
      const table = item.type === 'track' ? 'xvibe_tracks' : 'xvibe_albums';
      
      const { error } = await supabase
        .from(table)
        .update({ status: 'approved' })
        .eq('id', item.id);

      if (error) throw error;

      setPendingItems(prev => prev.filter(i => i.id !== item.id));
      toast.success(`${item.type === 'track' ? 'Track' : 'Album'} approved`);

    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;

    try {
      const table = selectedItem.type === 'track' ? 'xvibe_tracks' : 'xvibe_albums';
      
      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'rejected',
          rejection_reason: rejectReason 
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setPendingItems(prev => prev.filter(i => i.id !== selectedItem.id));
      toast.success(`${selectedItem.type === 'track' ? 'Track' : 'Album'} rejected`);
      setShowRejectDialog(false);
      setSelectedItem(null);
      setRejectReason('');

    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Failed to reject');
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
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-[#1DB954]/20">
            <Shield className="w-8 h-8 text-[#1DB954]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
            <p className="text-[#B3B3B3]">Review and approve submitted content</p>
          </div>
          <Badge className="ml-auto bg-yellow-500/20 text-yellow-400">
            {pendingItems.length} Pending
          </Badge>
        </div>

        {/* Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-[#181818] border-none">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#282828]">
              All ({pendingItems.length})
            </TabsTrigger>
            <TabsTrigger value="tracks" className="data-[state=active]:bg-[#282828]">
              Tracks ({pendingItems.filter(i => i.type === 'track').length})
            </TabsTrigger>
            <TabsTrigger value="albums" className="data-[state=active]:bg-[#282828]">
              Albums ({pendingItems.filter(i => i.type === 'album').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'tracks', 'albums'].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {pendingItems
                .filter(i => tab === 'all' || i.type === tab.slice(0, -1))
                .length === 0 ? (
                <Card className="bg-[#181818] border-none">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-[#1DB954] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
                    <p className="text-[#B3B3B3]">No pending items to review</p>
                  </CardContent>
                </Card>
              ) : (
                pendingItems
                  .filter(i => tab === 'all' || i.type === tab.slice(0, -1))
                  .map(item => (
                  <Card key={item.id} className="bg-[#181818] border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Cover */}
                        <div className="relative w-20 h-20 rounded bg-[#282828] flex-shrink-0 overflow-hidden group">
                          {item.cover_url ? (
                            <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.type === 'album' ? (
                                <Disc3 className="w-8 h-8 text-[#B3B3B3]" />
                              ) : (
                                <Music className="w-8 h-8 text-[#B3B3B3]" />
                              )}
                            </div>
                          )}
                          {item.type === 'track' && item.audio_url && (
                            <button
                              onClick={() => handlePlayPreview(item)}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              {playingId === item.id ? (
                                <Pause className="w-8 h-8 text-white" />
                              ) : (
                                <Play className="w-8 h-8 text-white" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white truncate">{item.title}</h4>
                            {item.is_explicit && (
                              <Badge className="bg-red-500/20 text-red-400 text-xs">E</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#B3B3B3]">{item.artist_name}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge className="bg-white/10 text-white capitalize">
                              {item.type}
                            </Badge>
                            {item.genre && (
                              <Badge className="bg-purple-500/20 text-purple-400">
                                {item.genre}
                              </Badge>
                            )}
                            <span className="text-xs text-[#B3B3B3]">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleApprove(item)}
                            className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRejectDialog(true);
                            }}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-[#181818] border-none">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Reject {selectedItem?.type}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-[#B3B3B3] mb-4">
                Rejecting: <span className="text-white font-medium">{selectedItem?.title}</span> by {selectedItem?.artist_name}
              </p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (required)"
                className="bg-[#282828] border-none text-white min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowRejectDialog(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </XVibeLayout>
  );
}
