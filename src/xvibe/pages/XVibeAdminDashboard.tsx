import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Shield, Music, Disc3, Users, AlertTriangle, CheckCircle, XCircle, Clock, Play, Pause, Flag, Ban, Search
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingRelease {
  id: string;
  type: 'track' | 'album';
  title: string;
  artist_name: string;
  cover_url: string | null;
  audio_url?: string;
  status: string;
  created_at: string;
}

interface ModerationAction {
  id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  admin_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export default function XVibeAdminDashboard() {
  const navigate = useNavigate();
  const [pendingItems, setPendingItems] = useState<PendingRelease[]>([]);
  const [recentActions, setRecentActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PendingRelease | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, flagged: 0 });

  useEffect(() => {
    checkAdminAccess();
    fetchPendingItems();
    fetchRecentActions();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/xvibe/auth'); return; }
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'moderator');
    if (!isAdmin) { toast.error('Access denied'); navigate('/xvibe/home'); }
  };

  const fetchStats = async () => {
    const { count: pending } = await supabase.from('xvibe_moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: approved } = await supabase.from('xvibe_moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: rejected } = await supabase.from('xvibe_moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
    setStats({ pending: pending || 0, approved: approved || 0, rejected: rejected || 0, flagged: 0 });
  };

  const fetchPendingItems = async () => {
    try {
      const { data: queue } = await supabase.from('xvibe_moderation_queue').select('*').eq('status', 'pending').order('created_at', { ascending: false });
      const items: PendingRelease[] = [];
      for (const item of queue || []) {
        if (item.content_type === 'track') {
          const { data: track } = await supabase.from('xvibe_tracks').select('*, xvibe_artists(name)').eq('id', item.content_id).single();
          if (track) {
            items.push({ id: item.id, type: 'track', title: track.title, artist_name: (track as any).xvibe_artists?.name || 'Unknown', cover_url: track.cover_url, audio_url: track.audio_url, status: item.status, created_at: item.created_at });
          }
        } else if (item.content_type === 'album') {
          const { data: album } = await supabase.from('xvibe_albums').select('*, xvibe_artists(name)').eq('id', item.content_id).single();
          if (album) {
            items.push({ id: item.id, type: 'album', title: album.title, artist_name: (album as any).xvibe_artists?.name || 'Unknown', cover_url: album.cover_url, status: item.status, created_at: item.created_at });
          }
        }
      }
      setPendingItems(items);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActions = async () => {
    const { data } = await supabase.from('xvibe_admin_actions').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) {
      const actions: ModerationAction[] = data.map(a => ({
        id: a.id,
        action_type: a.action_type,
        target_type: a.target_type,
        target_id: a.target_id,
        admin_id: a.admin_id,
        details: a.details as Record<string, unknown> | null,
        created_at: a.created_at
      }));
      setRecentActions(actions);
    }
  };

  const handleApprove = async (item: PendingRelease) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('xvibe_moderation_queue').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', item.id);
      if (item.type === 'track') await supabase.from('xvibe_tracks').update({ status: 'approved' }).eq('id', item.id);
      else await supabase.from('xvibe_albums').update({ status: 'approved' }).eq('id', item.id);
      await supabase.from('xvibe_admin_actions').insert({ admin_id: user?.id, action_type: 'approve', target_type: item.type, target_id: item.id, details: { reason: 'Approved' } });
      toast.success(`${item.title} approved`);
      setPendingItems(prev => prev.filter(i => i.id !== item.id));
      fetchStats();
    } catch (error) { toast.error('Failed to approve'); }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('xvibe_moderation_queue').update({ status: 'rejected', reviewed_at: new Date().toISOString(), rejection_reason: rejectReason }).eq('id', selectedItem.id);
      await supabase.from('xvibe_admin_actions').insert({ admin_id: user?.id, action_type: 'reject', target_type: selectedItem.type, target_id: selectedItem.id, details: { reason: rejectReason } });
      toast.success(`${selectedItem.title} rejected`);
      setPendingItems(prev => prev.filter(i => i.id !== selectedItem.id));
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedItem(null);
      fetchStats();
    } catch (error) { toast.error('Failed to reject'); }
  };

  const togglePlay = (item: PendingRelease) => {
    if (!item.audio_url) return;
    if (playingId === item.id) { audioRef?.pause(); setPlayingId(null); }
    else {
      audioRef?.pause();
      const audio = new Audio(item.audio_url);
      audio.play();
      setAudioRef(audio);
      setPlayingId(item.id);
      audio.onended = () => setPlayingId(null);
    }
  };

  const filteredItems = pendingItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.artist_name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <XVibeLayout><div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DB954]" /></div></XVibeLayout>;

  return (
    <XVibeLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-2xl font-bold text-white">XWave Admin</h1><p className="text-[#B3B3B3]">Content Moderation Dashboard</p></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' }, { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' }, { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' }, { label: 'Flagged', value: stats.flagged, icon: Flag, color: 'orange' }].map((s) => (
            <Card key={s.label} className="bg-[#181818] border-none"><CardContent className="p-4"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg bg-${s.color}-500/20`}><s.icon className={`w-5 h-5 text-${s.color}-400`} /></div><div><p className="text-2xl font-bold text-white">{s.value}</p><p className="text-sm text-[#B3B3B3]">{s.label}</p></div></div></CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="bg-[#181818] border-none">
            <TabsTrigger value="queue" className="data-[state=active]:bg-[#282828]">Moderation Queue</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#282828]">Action History</TabsTrigger>
            <TabsTrigger value="artists" className="data-[state=active]:bg-[#282828]">Artists</TabsTrigger>
            <TabsTrigger value="xwave" className="data-[state=active]:bg-[#282828]">XWave Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B3B3B3]" /><Input placeholder="Search pending items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-[#282828] border-none text-white" /></div>
            {filteredItems.length === 0 ? (
              <Card className="bg-[#181818] border-none"><CardContent className="p-12 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" /><h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3><p className="text-[#B3B3B3]">No pending items to review</p></CardContent></Card>
            ) : (
              <ScrollArea className="h-[600px]"><div className="space-y-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="bg-[#181818] border-none"><CardContent className="p-4"><div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg bg-[#282828] flex-shrink-0 overflow-hidden group">
                      {item.cover_url ? <img src={item.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{item.type === 'album' ? <Disc3 className="w-8 h-8 text-[#B3B3B3]" /> : <Music className="w-8 h-8 text-[#B3B3B3]" />}</div>}
                      {item.audio_url && <button onClick={() => togglePlay(item)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">{playingId === item.id ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}</button>}
                    </div>
                    <div className="flex-1 min-w-0"><h4 className="font-semibold text-white truncate">{item.title}</h4><p className="text-sm text-[#B3B3B3]">{item.artist_name}</p><Badge variant="outline" className="text-xs mt-2">{item.type}</Badge></div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleApprove(item)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400"><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                      <Button size="sm" onClick={() => { setSelectedItem(item); setShowRejectDialog(true); }} className="bg-red-500/20 hover:bg-red-500/30 text-red-400"><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                    </div>
                  </div></CardContent></Card>
                ))}
              </div></ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-[#181818] border-none"><CardHeader><CardTitle className="text-white">Recent Actions</CardTitle></CardHeader><CardContent><ScrollArea className="h-[400px]"><div className="space-y-3">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-[#282828]">
                  <div className="flex items-center gap-3">{action.action_type === 'approve' ? <CheckCircle className="w-5 h-5 text-green-400" /> : action.action_type === 'reject' ? <XCircle className="w-5 h-5 text-red-400" /> : <Ban className="w-5 h-5 text-orange-400" />}<div><p className="text-white capitalize">{action.action_type} {action.target_type}</p><p className="text-sm text-[#B3B3B3]">{(action.details as Record<string, string>)?.reason || 'No reason provided'}</p></div></div>
                  <span className="text-sm text-[#B3B3B3]">{new Date(action.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div></ScrollArea></CardContent></Card>
          </TabsContent>

          <TabsContent value="artists">
            <Card className="bg-[#181818] border-none"><CardContent className="p-12 text-center"><Users className="w-12 h-12 text-[#B3B3B3] mx-auto mb-4" /><h3 className="text-xl font-semibold text-white mb-2">Artist Management</h3><p className="text-[#B3B3B3]">Manage verified artists and permissions</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="xwave">
            <Card className="bg-[#181818] border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  XWave Blog Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[#B3B3B3]">Manage song blogs, editors, and editorial content.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => navigate('/xvibe/editor')} 
                    className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white"
                  >
                    Editor Dashboard
                  </Button>
                  <Button 
                    onClick={() => navigate('/xvibe/blog/new')} 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Create New Blog
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-[#181818] border-[#282828]"><DialogHeader><DialogTitle className="text-white">Reject Content</DialogTitle><DialogDescription className="text-[#B3B3B3]">Provide a reason for rejecting "{selectedItem?.title}"</DialogDescription></DialogHeader>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter rejection reason..." className="bg-[#282828] border-none text-white min-h-[100px]" />
            <DialogFooter><Button variant="outline" onClick={() => setShowRejectDialog(false)} className="border-white/20 text-white">Cancel</Button><Button onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white">Reject</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </XVibeLayout>
  );
}
