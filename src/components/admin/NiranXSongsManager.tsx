import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, User, Music, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Artist {
  id: string;
  name: string;
  image_url: string | null;
  spotify_url: string | null;
  display_order: number;
}

interface Song {
  id: string;
  title: string;
  artist_id: string | null;
  spotify_url: string | null;
  display_order: number;
}

export function NiranXSongsManager() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'artists' | 'songs'>('artists');

  // Artist form
  const [artistDialogOpen, setArtistDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [artistForm, setArtistForm] = useState({ name: '', image_url: '', spotify_url: '', display_order: 0 });

  // Song form
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songForm, setSongForm] = useState({ title: '', artist_id: '', spotify_url: '', display_order: 0 });

  const fetchData = async () => {
    const [artistsRes, songsRes] = await Promise.all([
      supabase.from('niranx_artists').select('*').order('display_order'),
      supabase.from('niranx_songs').select('*').order('display_order'),
    ]);
    if (artistsRes.data) setArtists(artistsRes.data);
    if (songsRes.data) setSongs(songsRes.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Artist handlers
  const handleArtistSubmit = async () => {
    if (!artistForm.name) return toast.error('Name is required');
    const payload = { ...artistForm, is_visible: true };

    if (editingArtist) {
      const { error } = await supabase.from('niranx_artists').update(payload).eq('id', editingArtist.id);
      if (error) return toast.error('Failed to update');
    } else {
      const { error } = await supabase.from('niranx_artists').insert([payload]);
      if (error) return toast.error('Failed to add');
    }
    toast.success('Saved');
    setArtistDialogOpen(false);
    setEditingArtist(null);
    setArtistForm({ name: '', image_url: '', spotify_url: '', display_order: 0 });
    fetchData();
  };

  const deleteArtist = async (id: string) => {
    if (!confirm('Delete this artist and all their songs?')) return;
    await supabase.from('niranx_artists').delete().eq('id', id);
    toast.success('Deleted');
    fetchData();
  };

  // Song handlers
  const handleSongSubmit = async () => {
    if (!songForm.title) return toast.error('Title is required');
    const payload = { ...songForm, artist_id: songForm.artist_id || null, is_visible: true };

    if (editingSong) {
      const { error } = await supabase.from('niranx_songs').update(payload).eq('id', editingSong.id);
      if (error) return toast.error('Failed to update');
    } else {
      const { error } = await supabase.from('niranx_songs').insert([payload]);
      if (error) return toast.error('Failed to add');
    }
    toast.success('Saved');
    setSongDialogOpen(false);
    setEditingSong(null);
    setSongForm({ title: '', artist_id: '', spotify_url: '', display_order: 0 });
    fetchData();
  };

  const deleteSong = async (id: string) => {
    if (!confirm('Delete this song?')) return;
    await supabase.from('niranx_songs').delete().eq('id', id);
    toast.success('Deleted');
    fetchData();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button variant={activeTab === 'artists' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('artists')}>
          <User className="w-4 h-4 mr-1" /> Artists
        </Button>
        <Button variant={activeTab === 'songs' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('songs')}>
          <Music className="w-4 h-4 mr-1" /> Songs
        </Button>
      </div>

      {activeTab === 'artists' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Artists</h3>
            <Dialog open={artistDialogOpen} onOpenChange={setArtistDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { setEditingArtist(null); setArtistForm({ name: '', image_url: '', spotify_url: '', display_order: 0 }); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Artist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingArtist ? 'Edit' : 'Add'} Artist</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Name" value={artistForm.name} onChange={(e) => setArtistForm(f => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Image URL" value={artistForm.image_url} onChange={(e) => setArtistForm(f => ({ ...f, image_url: e.target.value }))} />
                  <Input placeholder="Spotify URL" value={artistForm.spotify_url} onChange={(e) => setArtistForm(f => ({ ...f, spotify_url: e.target.value }))} />
                  <Input type="number" placeholder="Order" value={artistForm.display_order} onChange={(e) => setArtistForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
                  <Button onClick={handleArtistSubmit} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Spotify</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-32">{a.spotify_url || '-'}</TableCell>
                  <TableCell>{a.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditingArtist(a); setArtistForm({ name: a.name, image_url: a.image_url || '', spotify_url: a.spotify_url || '', display_order: a.display_order }); setArtistDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteArtist(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {activeTab === 'songs' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Songs</h3>
            <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { setEditingSong(null); setSongForm({ title: '', artist_id: '', spotify_url: '', display_order: 0 }); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Song
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingSong ? 'Edit' : 'Add'} Song</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Title" value={songForm.title} onChange={(e) => setSongForm(f => ({ ...f, title: e.target.value }))} />
                  <Select value={songForm.artist_id} onValueChange={(v) => setSongForm(f => ({ ...f, artist_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select artist" /></SelectTrigger>
                    <SelectContent>
                      {artists.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Spotify URL" value={songForm.spotify_url} onChange={(e) => setSongForm(f => ({ ...f, spotify_url: e.target.value }))} />
                  <Input type="number" placeholder="Order" value={songForm.display_order} onChange={(e) => setSongForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
                  <Button onClick={handleSongSubmit} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{artists.find(a => a.id === s.artist_id)?.name || '-'}</TableCell>
                  <TableCell>{s.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditingSong(s); setSongForm({ title: s.title, artist_id: s.artist_id || '', spotify_url: s.spotify_url || '', display_order: s.display_order }); setSongDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteSong(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
