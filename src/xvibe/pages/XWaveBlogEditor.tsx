import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, Send, ArrowLeft, Music2, Plus, Trash2, ExternalLink, Link2, Eye,
  BookOpen, Sparkles, Image
} from 'lucide-react';
import { toast } from 'sonner';

// Platform configurations
const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', color: '#1DB954', icon: '🎵' },
  { id: 'apple_music', name: 'Apple Music', color: '#FA2D48', icon: '🍎' },
  { id: 'youtube_music', name: 'YouTube Music', color: '#FF0000', icon: '▶️' },
  { id: 'jio_saavn', name: 'JioSaavn', color: '#2BC5B4', icon: '🎶' },
  { id: 'soundcloud', name: 'SoundCloud', color: '#FF5500', icon: '☁️' },
  { id: 'amazon_music', name: 'Amazon Music', color: '#00A8E1', icon: '📦' },
  { id: 'deezer', name: 'Deezer', color: '#FEAA2D', icon: '🎧' },
  { id: 'tidal', name: 'Tidal', color: '#000000', icon: '🌊' },
  { id: 'other', name: 'Other', color: '#6B7280', icon: '🔗' }
];

interface ExternalLink {
  id?: string;
  platform: string;
  url: string;
  custom_label: string;
  display_order: number;
}

interface Song {
  id: string;
  title: string;
  cover_url: string | null;
  artist_name: string;
}

export default function XWaveBlogEditor() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!blogId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorId, setEditorId] = useState<string | null>(null);

  // Blog fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [editorialTag, setEditorialTag] = useState('article');
  const [status, setStatus] = useState('draft');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  // External links
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [newLink, setNewLink] = useState<ExternalLink>({ platform: 'spotify', url: '', custom_label: '', display_order: 0 });

  // Songs list for selection
  const [songs, setSongs] = useState<Song[]>([]);
  const [songSearch, setSongSearch] = useState('');
  const [showSongDialog, setShowSongDialog] = useState(false);

  useEffect(() => {
    checkEditorAccess();
    fetchSongs();
    if (isEditing) {
      fetchBlogPost();
    } else {
      setLoading(false);
    }
  }, [blogId]);

  const checkEditorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in');
      navigate('/xvibe/auth');
      return;
    }

    // Check if user is an editor
    const { data: editor } = await supabase
      .from('xwave_editors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (editor) {
      setEditorId(editor.id);
    } else {
      // Check if admin/moderator
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'moderator');
      if (!isAdmin) {
        toast.error('You need editor access to write blogs');
        navigate('/xvibe/home');
        return;
      }

      // Auto-create editor profile for admin
      const { data: newEditor } = await supabase
        .from('xwave_editors')
        .insert({ 
          user_id: user.id, 
          name: user.email?.split('@')[0] || 'Editor',
          role: 'senior_editor' 
        })
        .select('id')
        .single();

      if (newEditor) setEditorId(newEditor.id);
    }
  };

  const fetchSongs = async () => {
    const { data } = await supabase
      .from('xvibe_tracks')
      .select('id, title, cover_url, xvibe_artists(name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setSongs(data.map(t => ({
        id: t.id,
        title: t.title,
        cover_url: t.cover_url,
        artist_name: (t as any).xvibe_artists?.name || 'Unknown'
      })));
    }
  };

  const fetchBlogPost = async () => {
    try {
      const { data: blog } = await supabase
        .from('xwave_blog_posts')
        .select('*')
        .eq('id', blogId)
        .single();

      if (blog) {
        setTitle(blog.title);
        setContent(blog.content);
        setExcerpt(blog.excerpt || '');
        setCoverImageUrl(blog.cover_image_url || '');
        setEditorialTag(blog.editorial_tag);
        setStatus(blog.status);
        setSelectedSongId(blog.song_id);

        // Fetch external links for the song
        if (blog.song_id) {
          const { data: links } = await supabase
            .from('xwave_external_links')
            .select('*')
            .eq('song_id', blog.song_id)
            .order('display_order');
          
          if (links) setExternalLinks(links);
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!editorId) {
      toast.error('Editor access required');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const blogData = {
        editor_id: editorId,
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        editorial_tag: editorialTag,
        song_id: selectedSongId,
        status: publish ? 'published' : status,
        published_at: publish ? new Date().toISOString() : null
      };

      let savedBlogId = blogId;

      if (isEditing) {
        await supabase
          .from('xwave_blog_posts')
          .update(blogData)
          .eq('id', blogId);
      } else {
        const { data: newBlog } = await supabase
          .from('xwave_blog_posts')
          .insert(blogData)
          .select('id')
          .single();
        
        if (newBlog) savedBlogId = newBlog.id;
      }

      // Save external links
      if (selectedSongId && externalLinks.length > 0) {
        // Delete existing links
        await supabase
          .from('xwave_external_links')
          .delete()
          .eq('song_id', selectedSongId);

        // Insert new links
        await supabase
          .from('xwave_external_links')
          .insert(externalLinks.map((link, index) => ({
            song_id: selectedSongId,
            platform: link.platform,
            url: link.url,
            custom_label: link.custom_label || null,
            display_order: index
          })));
      }

      toast.success(publish ? 'Blog published!' : 'Blog saved!');
      
      if (publish && savedBlogId) {
        navigate(`/xvibe/song/${selectedSongId}`);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const addExternalLink = () => {
    if (!newLink.url.trim()) {
      toast.error('URL is required');
      return;
    }

    setExternalLinks([...externalLinks, { ...newLink, display_order: externalLinks.length }]);
    setNewLink({ platform: 'spotify', url: '', custom_label: '', display_order: 0 });
    setShowLinkDialog(false);
  };

  const removeExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
    s.artist_name.toLowerCase().includes(songSearch.toLowerCase())
  );

  const selectedSong = songs.find(s => s.id === selectedSongId);

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
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Blog Post' : 'New Blog Post'}
                </h1>
                <p className="text-[#B3B3B3]">XWave Editorial</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="border-white/20 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving || !selectedSongId}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card className="bg-[#181818] border-none">
                <CardContent className="p-6">
                  <Input
                    placeholder="Enter blog title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-none text-white placeholder:text-[#B3B3B3] p-0 focus-visible:ring-0"
                  />
                </CardContent>
              </Card>

              {/* Excerpt */}
              <Card className="bg-[#181818] border-none">
                <CardContent className="p-6">
                  <label className="text-sm text-[#B3B3B3] mb-2 block">Excerpt (optional)</label>
                  <Textarea
                    placeholder="Write a short summary..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="bg-[#282828] border-none text-white min-h-[80px]"
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#1DB954]" />
                    Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write your blog content here... (HTML supported)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-[#282828] border-none text-white min-h-[400px] font-mono"
                  />
                  <p className="text-xs text-[#B3B3B3] mt-2">
                    Supports HTML for rich formatting. Use &lt;p&gt;, &lt;h2&gt;, &lt;blockquote&gt;, etc.
                  </p>
                </CardContent>
              </Card>

              {/* External Links */}
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-[#1DB954]" />
                      Streaming Links
                    </CardTitle>
                    <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-[#1DB954] hover:bg-[#1ed760] text-black">
                          <Plus className="w-4 h-4 mr-1" /> Add Link
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#181818] border-[#282828]">
                        <DialogHeader>
                          <DialogTitle className="text-white">Add Streaming Link</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="text-sm text-[#B3B3B3] mb-2 block">Platform</label>
                            <div className="grid grid-cols-3 gap-2">
                              {PLATFORMS.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => setNewLink({ ...newLink, platform: p.id })}
                                  className={`p-3 rounded-lg text-center transition-colors ${
                                    newLink.platform === p.id
                                      ? 'bg-[#1DB954]/20 border border-[#1DB954]'
                                      : 'bg-[#282828] hover:bg-[#383838]'
                                  }`}
                                >
                                  <span className="text-2xl">{p.icon}</span>
                                  <p className="text-xs text-white mt-1">{p.name}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-[#B3B3B3] mb-2 block">URL</label>
                            <Input
                              placeholder="https://..."
                              value={newLink.url}
                              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                              className="bg-[#282828] border-none text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-[#B3B3B3] mb-2 block">Custom Label (optional)</label>
                            <Input
                              placeholder="e.g., Listen Free"
                              value={newLink.custom_label}
                              onChange={(e) => setNewLink({ ...newLink, custom_label: e.target.value })}
                              className="bg-[#282828] border-none text-white"
                            />
                          </div>
                          <Button onClick={addExternalLink} className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black">
                            Add Link
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {externalLinks.length === 0 ? (
                    <div className="text-center py-8 text-[#B3B3B3]">
                      <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No streaming links added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {externalLinks.map((link, index) => {
                        const platform = PLATFORMS.find(p => p.id === link.platform);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#282828] rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{platform?.icon}</span>
                              <div>
                                <p className="text-white">{link.custom_label || platform?.name}</p>
                                <p className="text-xs text-[#B3B3B3] truncate max-w-[200px]">{link.url}</p>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeExternalLink(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Song Selection */}
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music2 className="w-5 h-5 text-[#1DB954]" />
                    Song
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSong ? (
                    <div className="flex items-center gap-3 p-3 bg-[#282828] rounded-lg">
                      <div className="w-12 h-12 rounded bg-[#383838] overflow-hidden">
                        {selectedSong.cover_url ? (
                          <img src={selectedSong.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-[#B3B3B3]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{selectedSong.title}</p>
                        <p className="text-sm text-[#B3B3B3]">{selectedSong.artist_name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSongDialog(true)}
                        className="text-[#B3B3B3]"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowSongDialog(true)}
                      variant="outline"
                      className="w-full border-dashed border-white/20 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Select Song
                    </Button>
                  )}

                  <Dialog open={showSongDialog} onOpenChange={setShowSongDialog}>
                    <DialogContent className="bg-[#181818] border-[#282828] max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-white">Select Song</DialogTitle>
                      </DialogHeader>
                      <Input
                        placeholder="Search songs..."
                        value={songSearch}
                        onChange={(e) => setSongSearch(e.target.value)}
                        className="bg-[#282828] border-none text-white"
                      />
                      <ScrollArea className="h-[300px] mt-4">
                        <div className="space-y-2">
                          {filteredSongs.map(song => (
                            <button
                              key={song.id}
                              onClick={() => {
                                setSelectedSongId(song.id);
                                setShowSongDialog(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                selectedSongId === song.id
                                  ? 'bg-[#1DB954]/20'
                                  : 'bg-[#282828] hover:bg-[#383838]'
                              }`}
                            >
                              <div className="w-10 h-10 rounded bg-[#383838] overflow-hidden">
                                {song.cover_url ? (
                                  <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Music2 className="w-5 h-5 text-[#B3B3B3]" />
                                  </div>
                                )}
                              </div>
                              <div className="text-left">
                                <p className="text-white">{song.title}</p>
                                <p className="text-sm text-[#B3B3B3]">{song.artist_name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-[#B3B3B3] mb-2 block">Editorial Tag</label>
                    <Select value={editorialTag} onValueChange={setEditorialTag}>
                      <SelectTrigger className="bg-[#282828] border-none text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#282828] border-[#383838]">
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="deep_dive">Deep Dive</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-[#B3B3B3] mb-2 block">Cover Image URL</label>
                    <Input
                      placeholder="https://..."
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="bg-[#282828] border-none text-white"
                    />
                    {coverImageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <img src={coverImageUrl} alt="Cover" className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-[#B3B3B3] mb-2 block">Status</label>
                    <Badge className={
                      status === 'published' ? 'bg-green-500/20 text-green-400' :
                      status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-[#282828] text-[#B3B3B3]'
                    }>
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Link */}
              {selectedSongId && (
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white"
                  onClick={() => window.open(`/xvibe/song/${selectedSongId}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Song Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </XVibeLayout>
  );
}