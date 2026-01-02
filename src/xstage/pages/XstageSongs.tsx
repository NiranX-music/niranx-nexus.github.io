import { useState, useEffect } from 'react';
import { useXstage } from '../contexts/XstageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Plus, Music, ListMusic, Clock, Hash, Trash2, Edit, GripVertical, Play } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

interface Song {
  id: string;
  title: string;
  bpm: number | null;
  key: string | null;
  duration_seconds: number | null;
  lyrics: string | null;
  notes: string | null;
  created_at: string;
}

interface Setlist {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface SetlistSong {
  id: string;
  song_id: string;
  position: number;
  notes: string | null;
  song?: Song;
}

const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'
];

export const XstageSongs = () => {
  const { currentProject } = useXstage();
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [setlistSongs, setSetlistSongs] = useState<SetlistSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [setlistDialogOpen, setSetlistDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const [songForm, setSongForm] = useState({
    title: '',
    bpm: '',
    key: '',
    duration_seconds: '',
    lyrics: '',
    notes: ''
  });

  const [setlistForm, setSetlistForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (currentProject) {
      fetchSongs();
      fetchSetlists();
    }
  }, [currentProject]);

  useEffect(() => {
    if (selectedSetlist) {
      fetchSetlistSongs(selectedSetlist.id);
    }
  }, [selectedSetlist]);

  const fetchSongs = async () => {
    if (!currentProject) return;
    const { data, error } = await supabase
      .from('xstage_songs')
      .select('*')
      .eq('project_id', currentProject.id)
      .order('title');
    
    if (!error && data) setSongs(data);
    setLoading(false);
  };

  const fetchSetlists = async () => {
    if (!currentProject) return;
    const { data, error } = await supabase
      .from('xstage_setlists')
      .select('*')
      .eq('project_id', currentProject.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) setSetlists(data);
  };

  const fetchSetlistSongs = async (setlistId: string) => {
    const { data, error } = await supabase
      .from('xstage_setlist_songs')
      .select('*, song:xstage_songs(*)')
      .eq('setlist_id', setlistId)
      .order('position');
    
    if (!error && data) {
      setSetlistSongs(data.map(item => ({
        ...item,
        song: item.song as Song
      })));
    }
  };

  const handleSaveSong = async () => {
    if (!currentProject || !songForm.title.trim()) {
      toast.error('Song title is required');
      return;
    }

    if (editingSong) {
      const { error } = await supabase
        .from('xstage_songs')
        .update({
          title: songForm.title.trim(),
          bpm: songForm.bpm ? parseInt(songForm.bpm) : null,
          key: songForm.key || null,
          duration_seconds: songForm.duration_seconds ? parseInt(songForm.duration_seconds) : null,
          lyrics: songForm.lyrics || null,
          notes: songForm.notes || null
        })
        .eq('id', editingSong.id);
      
      if (error) {
        toast.error('Failed to update song');
      } else {
        toast.success('Song updated');
        fetchSongs();
      }
    } else {
      const { error } = await supabase
        .from('xstage_songs')
        .insert({
          project_id: currentProject.id,
          created_by: user?.id || '',
          title: songForm.title.trim(),
          bpm: songForm.bpm ? parseInt(songForm.bpm) : null,
          key: songForm.key || null,
          duration_seconds: songForm.duration_seconds ? parseInt(songForm.duration_seconds) : null,
          lyrics: songForm.lyrics || null,
          notes: songForm.notes || null
        });
      
      if (error) {
        toast.error('Failed to create song');
      } else {
        toast.success('Song created');
        fetchSongs();
      }
    }

    setSongDialogOpen(false);
    resetSongForm();
  };

  const handleDeleteSong = async (songId: string) => {
    const { error } = await supabase
      .from('xstage_songs')
      .delete()
      .eq('id', songId);
    
    if (error) {
      toast.error('Failed to delete song');
    } else {
      toast.success('Song deleted');
      fetchSongs();
    }
  };

  const handleSaveSetlist = async () => {
    if (!currentProject || !setlistForm.name.trim()) {
      toast.error('Setlist name is required');
      return;
    }

    const { error } = await supabase
      .from('xstage_setlists')
      .insert({
        project_id: currentProject.id,
        created_by: user?.id || '',
        name: setlistForm.name.trim(),
        description: setlistForm.description || null
      });

    if (error) {
      toast.error('Failed to create setlist');
    } else {
      toast.success('Setlist created');
      fetchSetlists();
      setSetlistDialogOpen(false);
      setSetlistForm({ name: '', description: '' });
    }
  };

  const handleAddToSetlist = async (songId: string) => {
    if (!selectedSetlist) return;

    const position = setlistSongs.length + 1;
    const { error } = await supabase
      .from('xstage_setlist_songs')
      .insert({
        setlist_id: selectedSetlist.id,
        song_id: songId,
        position
      });

    if (error) {
      toast.error('Failed to add song to setlist');
    } else {
      toast.success('Song added to setlist');
      fetchSetlistSongs(selectedSetlist.id);
    }
  };

  const handleRemoveFromSetlist = async (setlistSongId: string) => {
    const { error } = await supabase
      .from('xstage_setlist_songs')
      .delete()
      .eq('id', setlistSongId);

    if (error) {
      toast.error('Failed to remove song');
    } else {
      if (selectedSetlist) fetchSetlistSongs(selectedSetlist.id);
    }
  };

  const handleReorderSetlist = async (newOrder: SetlistSong[]) => {
    setSetlistSongs(newOrder);
    
    const updates = newOrder.map((item, index) => ({
      id: item.id,
      position: index + 1
    }));

    for (const update of updates) {
      await supabase
        .from('xstage_setlist_songs')
        .update({ position: update.position })
        .eq('id', update.id);
    }
  };

  const resetSongForm = () => {
    setSongForm({ title: '', bpm: '', key: '', duration_seconds: '', lyrics: '', notes: '' });
    setEditingSong(null);
  };

  const openEditSong = (song: Song) => {
    setEditingSong(song);
    setSongForm({
      title: song.title,
      bpm: song.bpm?.toString() || '',
      key: song.key || '',
      duration_seconds: song.duration_seconds?.toString() || '',
      lyrics: song.lyrics || '',
      notes: song.notes || ''
    });
    setSongDialogOpen(true);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    const total = setlistSongs.reduce((acc, item) => acc + (item.song?.duration_seconds || 0), 0);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a project to view songs</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          Songs & Setlists
        </h1>
      </div>

      <Tabs defaultValue="songs" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="songs" className="data-[state=active]:bg-fuchsia-500/20">
            <Music className="h-4 w-4 mr-2" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="setlists" className="data-[state=active]:bg-fuchsia-500/20">
            <ListMusic className="h-4 w-4 mr-2" />
            Setlists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={songDialogOpen} onOpenChange={(open) => {
              setSongDialogOpen(open);
              if (!open) resetSongForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-fuchsia-500 to-pink-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Song
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingSong ? 'Edit Song' : 'New Song'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Song Title"
                    value={songForm.title}
                    onChange={(e) => setSongForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      type="number"
                      placeholder="BPM"
                      value={songForm.bpm}
                      onChange={(e) => setSongForm(prev => ({ ...prev, bpm: e.target.value }))}
                    />
                    <Select value={songForm.key} onValueChange={(v) => setSongForm(prev => ({ ...prev, key: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Key" />
                      </SelectTrigger>
                      <SelectContent>
                        {MUSICAL_KEYS.map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Duration (seconds)"
                      value={songForm.duration_seconds}
                      onChange={(e) => setSongForm(prev => ({ ...prev, duration_seconds: e.target.value }))}
                    />
                  </div>
                  <Textarea
                    placeholder="Lyrics"
                    rows={6}
                    value={songForm.lyrics}
                    onChange={(e) => setSongForm(prev => ({ ...prev, lyrics: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Notes"
                    rows={3}
                    value={songForm.notes}
                    onChange={(e) => setSongForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                  <Button onClick={handleSaveSong} className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500">
                    {editingSong ? 'Update Song' : 'Create Song'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{song.title}</CardTitle>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" onClick={() => openEditSong(song)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteSong(song.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {song.bpm && (
                        <Badge variant="outline" className="border-fuchsia-500/50">
                          <Hash className="h-3 w-3 mr-1" />
                          {song.bpm} BPM
                        </Badge>
                      )}
                      {song.key && (
                        <Badge variant="outline" className="border-pink-500/50">
                          {song.key}
                        </Badge>
                      )}
                      {song.duration_seconds && (
                        <Badge variant="outline" className="border-cyan-500/50">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(song.duration_seconds)}
                        </Badge>
                      )}
                    </div>
                    {selectedSetlist && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleAddToSetlist(song.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Setlist
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {songs.length === 0 && !loading && (
            <div className="text-center py-12">
              <Music className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No songs yet. Add your first song!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="setlists" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Setlists</h3>
                <Dialog open={setlistDialogOpen} onOpenChange={setSetlistDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                      <DialogTitle>New Setlist</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Setlist Name"
                        value={setlistForm.name}
                        onChange={(e) => setSetlistForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={setlistForm.description}
                        onChange={(e) => setSetlistForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                      <Button onClick={handleSaveSetlist} className="w-full">
                        Create Setlist
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {setlists.map((setlist) => (
                    <Card
                      key={setlist.id}
                      className={`cursor-pointer transition-all ${
                        selectedSetlist?.id === setlist.id
                          ? 'bg-fuchsia-500/20 border-fuchsia-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedSetlist(setlist)}
                    >
                      <CardContent className="p-3">
                        <p className="font-medium">{setlist.name}</p>
                        {setlist.description && (
                          <p className="text-xs text-muted-foreground truncate">{setlist.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="md:col-span-2">
              {selectedSetlist ? (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedSetlist.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {setlistSongs.length} songs • {getTotalDuration()} total
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Run Show
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Reorder.Group values={setlistSongs} onReorder={handleReorderSetlist} className="space-y-2">
                      {setlistSongs.map((item, index) => (
                        <Reorder.Item key={item.id} value={item}>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground w-6">{index + 1}</span>
                            <div className="flex-1">
                              <p className="font-medium">{item.song?.title}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {item.song?.bpm && <span>{item.song.bpm} BPM</span>}
                                {item.song?.key && <span>• {item.song.key}</span>}
                                {item.song?.duration_seconds && (
                                  <span>• {formatDuration(item.song.duration_seconds)}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveFromSetlist(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>

                    {setlistSongs.length === 0 && (
                      <div className="text-center py-8">
                        <ListMusic className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">
                          Add songs from the Songs tab
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ListMusic className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Select a setlist to view songs</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
