import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, Heart, Share2, Plus, ExternalLink, Music2, Sparkles, 
  BookOpen, Brain, Zap, Music, User, Calendar, Eye, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useXVibePlayer } from '../contexts/XVibePlayerContext';

// Platform icons mapping
const PLATFORM_ICONS: Record<string, { name: string; color: string; icon: string }> = {
  spotify: { name: 'Spotify', color: '#1DB954', icon: '🎵' },
  apple_music: { name: 'Apple Music', color: '#FA2D48', icon: '🍎' },
  youtube_music: { name: 'YouTube Music', color: '#FF0000', icon: '▶️' },
  jio_saavn: { name: 'JioSaavn', color: '#2BC5B4', icon: '🎶' },
  soundcloud: { name: 'SoundCloud', color: '#FF5500', icon: '☁️' },
  amazon_music: { name: 'Amazon Music', color: '#00A8E1', icon: '📦' },
  deezer: { name: 'Deezer', color: '#FEAA2D', icon: '🎧' },
  tidal: { name: 'Tidal', color: '#000000', icon: '🌊' },
  other: { name: 'Listen', color: '#6B7280', icon: '🔗' }
};

interface Song {
  id: string;
  title: string;
  audio_url: string;
  cover_url: string | null;
  duration: number;
  genre: string | null;
  lyrics: string | null;
  artist: { id: string; name: string; avatar_url: string | null; is_verified: boolean };
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  editorial_tag: string;
  published_at: string;
  view_count: number;
  like_count: number;
  editor: { name: string; avatar_url: string | null; role: string };
}

interface ExternalLink {
  id: string;
  platform: string;
  url: string;
  custom_label: string | null;
}

interface AIInsight {
  meaning: string | null;
  lyrics_analysis: string | null;
  mood: string | null;
  energy_level: number | null;
  mood_tags: string[] | null;
  themes: string[] | null;
  tldr: string | null;
}

export default function XWaveSongPage() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useXVibePlayer();
  
  const [song, setSong] = useState<Song | null>(null);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeAITab, setActiveAITab] = useState('meaning');

  useEffect(() => {
    if (songId) {
      fetchSongData();
    }
  }, [songId]);

  const fetchSongData = async () => {
    try {
      // Fetch song with artist
      const { data: trackData } = await supabase
        .from('xvibe_tracks')
        .select('*, xvibe_artists(id, name, avatar_url, is_verified)')
        .eq('id', songId)
        .single();

      if (trackData) {
        setSong({
          id: trackData.id,
          title: trackData.title,
          audio_url: trackData.audio_url,
          cover_url: trackData.cover_url,
          duration: trackData.duration,
          genre: trackData.genre,
          lyrics: trackData.lyrics,
          artist: (trackData as any).xvibe_artists || { id: '', name: 'Unknown', avatar_url: null, is_verified: false }
        });
      }

      // Fetch blog post for this song
      const { data: blogData } = await supabase
        .from('xwave_blog_posts')
        .select('*, xwave_editors(name, avatar_url, role)')
        .eq('song_id', songId)
        .eq('status', 'published')
        .single();

      if (blogData) {
        setBlog({
          id: blogData.id,
          title: blogData.title,
          content: blogData.content,
          excerpt: blogData.excerpt,
          editorial_tag: blogData.editorial_tag,
          published_at: blogData.published_at || '',
          view_count: blogData.view_count,
          like_count: blogData.like_count,
          editor: (blogData as any).xwave_editors || { name: 'XWave Editorial', avatar_url: null, role: 'editor' }
        });

        // Increment view count
        await supabase
          .from('xwave_blog_posts')
          .update({ view_count: blogData.view_count + 1 })
          .eq('id', blogData.id);
      }

      // Fetch external links
      const { data: linksData } = await supabase
        .from('xwave_external_links')
        .select('*')
        .eq('song_id', songId)
        .order('display_order');

      setExternalLinks(linksData || []);

      // Fetch AI insights
      const { data: insightsData } = await supabase
        .from('xwave_ai_insights')
        .select('*')
        .eq('song_id', songId)
        .single();

      if (insightsData) {
        setAiInsights({
          meaning: insightsData.meaning,
          lyrics_analysis: insightsData.lyrics_analysis,
          mood: insightsData.mood,
          energy_level: insightsData.energy_level,
          mood_tags: insightsData.mood_tags,
          themes: insightsData.themes,
          tldr: insightsData.tldr
        });
      }

      // Check if user liked
      const { data: { user } } = await supabase.auth.getUser();
      if (user && songId) {
        const { data: likeData } = await supabase
          .from('xvibe_likes')
          .select('id')
          .eq('track_id', songId)
          .eq('user_id', user.id)
          .single();
        setIsLiked(!!likeData);
      }

    } catch (error) {
      console.error('Error fetching song data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (!song) return;
    if (currentTrack?.id === song.id) {
      togglePlayPause();
    } else {
      playTrack({
        id: song.id,
        title: song.title,
        artist_id: song.artist.id,
        audio_url: song.audio_url,
        cover_url: song.cover_url || undefined,
        duration: song.duration,
        genre: song.genre || undefined,
        is_explicit: false,
        play_count: 0,
        status: 'approved',
        created_at: '',
        artist: {
          id: song.artist.id,
          name: song.artist.name,
          avatar_url: song.artist.avatar_url || undefined,
          is_verified: song.artist.is_verified,
          monthly_listeners: 0,
          follower_count: 0,
          status: 'approved',
          created_at: ''
        }
      });
    }
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to like songs');
      return;
    }

    if (isLiked) {
      await supabase.from('xvibe_likes').delete().eq('track_id', songId).eq('user_id', user.id);
      setIsLiked(false);
      toast.success('Removed from liked songs');
    } else {
      await supabase.from('xvibe_likes').insert({ track_id: songId, user_id: user.id });
      setIsLiked(true);
      toast.success('Added to liked songs');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const isCurrentlyPlaying = currentTrack?.id === song?.id && isPlaying;

  if (loading) {
    return (
      <XVibeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DB954]" />
        </div>
      </XVibeLayout>
    );
  }

  if (!song) {
    return (
      <XVibeLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Music2 className="w-16 h-16 text-[#B3B3B3]" />
          <h2 className="text-2xl font-bold text-white">Song not found</h2>
          <Button onClick={() => navigate('/xvibe/home')} variant="outline">Go Home</Button>
        </div>
      </XVibeLayout>
    );
  }

  return (
    <XVibeLayout>
      <div className="min-h-screen pb-32">
        {/* Hero Section */}
        <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            {song.cover_url ? (
              <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1DB954] to-[#191414]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Cover Art */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-48 h-48 md:w-64 md:h-64 rounded-xl shadow-2xl overflow-hidden flex-shrink-0"
              >
                {song.cover_url ? (
                  <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                    <Music2 className="w-20 h-20 text-[#B3B3B3]" />
                  </div>
                )}
              </motion.div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <Badge className="bg-[#1DB954]/20 text-[#1DB954] mb-2">
                  {song.genre || 'Music'}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 line-clamp-2">
                  {song.title}
                </h1>
                <button
                  onClick={() => navigate(`/xvibe/artist/${song.artist.id}`)}
                  className="flex items-center gap-2 text-lg text-white/80 hover:text-white transition-colors"
                >
                  {song.artist.avatar_url && (
                    <img src={song.artist.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                  )}
                  <span>{song.artist.name}</span>
                  {song.artist.is_verified && (
                    <svg className="w-5 h-5 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-6">
                  <Button
                    onClick={handlePlay}
                    size="lg"
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-full px-8"
                  >
                    {isCurrentlyPlaying ? (
                      <><Pause className="w-5 h-5 mr-2" /> Pause</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" /> Play</>
                    )}
                  </Button>
                  <Button
                    onClick={handleLike}
                    size="icon"
                    variant="ghost"
                    className={`rounded-full ${isLiked ? 'text-[#1DB954]' : 'text-white'}`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button onClick={handleShare} size="icon" variant="ghost" className="rounded-full text-white">
                    <Share2 className="w-6 h-6" />
                  </Button>
                  <Button size="icon" variant="ghost" className="rounded-full text-white">
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* External Links Bar */}
        {externalLinks.length > 0 && (
          <div className="bg-[#181818] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <span className="text-sm text-[#B3B3B3] flex-shrink-0">Listen on:</span>
                {externalLinks.map((link) => {
                  const platform = PLATFORM_ICONS[link.platform] || PLATFORM_ICONS.other;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#282828] hover:bg-[#383838] transition-colors flex-shrink-0"
                      style={{ borderColor: platform.color, borderWidth: 1 }}
                    >
                      <span>{platform.icon}</span>
                      <span className="text-sm text-white">{link.custom_label || platform.name}</span>
                      <ExternalLink className="w-3 h-3 text-[#B3B3B3]" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Blog & Lyrics */}
            <div className="lg:col-span-2 space-y-8">
              {/* XWave Editorial Blog */}
              {blog && (
                <Card className="bg-[#181818] border-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 border-b border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-[#1DB954]/20 text-[#1DB954]">
                          <BookOpen className="w-3 h-3 mr-1" />
                          XWave Editorial
                        </Badge>
                        <Badge variant="outline" className="text-[#B3B3B3] capitalize">
                          {blog.editorial_tag.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-4">{blog.title}</h2>
                      
                      {/* Author */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#282828] flex items-center justify-center">
                            {blog.editor.avatar_url ? (
                              <img src={blog.editor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-[#B3B3B3]" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{blog.editor.name}</p>
                            <p className="text-sm text-[#B3B3B3] capitalize">{blog.editor.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#B3B3B3]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(blog.published_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {blog.view_count}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Blog Content */}
                    <div className="p-6">
                      <div 
                        className="prose prose-invert prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lyrics Section */}
              {song.lyrics && (
                <Card className="bg-[#181818] border-none">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Music className="w-5 h-5 text-[#1DB954]" />
                      <h3 className="text-xl font-bold text-white">Lyrics</h3>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <pre className="text-[#B3B3B3] whitespace-pre-wrap font-sans leading-relaxed">
                        {song.lyrics}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - AI Insights */}
            <div className="space-y-6">
              {/* AI Insights Card */}
              <Card className="bg-[#181818] border-none sticky top-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">AI Insights</h3>
                  </div>

                  {aiInsights ? (
                    <Tabs value={activeAITab} onValueChange={setActiveAITab}>
                      <TabsList className="grid grid-cols-3 bg-[#282828]">
                        <TabsTrigger value="meaning" className="data-[state=active]:bg-[#1DB954]/20">
                          <Brain className="w-4 h-4 mr-1" /> Meaning
                        </TabsTrigger>
                        <TabsTrigger value="lyrics" className="data-[state=active]:bg-[#1DB954]/20">
                          <BookOpen className="w-4 h-4 mr-1" /> Analysis
                        </TabsTrigger>
                        <TabsTrigger value="mood" className="data-[state=active]:bg-[#1DB954]/20">
                          <Zap className="w-4 h-4 mr-1" /> Mood
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="meaning" className="mt-4">
                        <p className="text-[#B3B3B3] leading-relaxed">
                          {aiInsights.meaning || 'AI meaning analysis coming soon...'}
                        </p>
                      </TabsContent>

                      <TabsContent value="lyrics" className="mt-4">
                        <p className="text-[#B3B3B3] leading-relaxed">
                          {aiInsights.lyrics_analysis || 'AI lyrics analysis coming soon...'}
                        </p>
                      </TabsContent>

                      <TabsContent value="mood" className="mt-4 space-y-4">
                        <div>
                          <p className="text-sm text-[#B3B3B3] mb-2">Mood</p>
                          <Badge className="bg-[#1DB954]/20 text-[#1DB954] capitalize">
                            {aiInsights.mood || 'Unknown'}
                          </Badge>
                        </div>

                        {aiInsights.energy_level !== null && (
                          <div>
                            <p className="text-sm text-[#B3B3B3] mb-2">Energy Level</p>
                            <div className="h-2 bg-[#282828] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760]"
                                style={{ width: `${aiInsights.energy_level}%` }}
                              />
                            </div>
                            <p className="text-right text-sm text-[#B3B3B3] mt-1">{aiInsights.energy_level}%</p>
                          </div>
                        )}

                        {aiInsights.mood_tags && aiInsights.mood_tags.length > 0 && (
                          <div>
                            <p className="text-sm text-[#B3B3B3] mb-2">Mood Tags</p>
                            <div className="flex flex-wrap gap-2">
                              {aiInsights.mood_tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-[#B3B3B3]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 text-[#B3B3B3] mx-auto mb-3" />
                      <p className="text-[#B3B3B3]">AI insights are being generated...</p>
                    </div>
                  )}

                  {/* TL;DR */}
                  {aiInsights?.tldr && (
                    <div className="mt-6 p-4 bg-[#282828] rounded-lg">
                      <p className="text-sm text-[#B3B3B3] mb-2">📝 TL;DR</p>
                      <p className="text-white">{aiInsights.tldr}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Artist Card */}
              <Card 
                className="bg-[#181818] border-none cursor-pointer hover:bg-[#282828] transition-colors"
                onClick={() => navigate(`/xvibe/artist/${song.artist.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#282828] overflow-hidden">
                      {song.artist.avatar_url ? (
                        <img src={song.artist.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-[#B3B3B3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#B3B3B3] mb-1">Artist</p>
                      <p className="text-lg font-semibold text-white flex items-center gap-2">
                        {song.artist.name}
                        {song.artist.is_verified && (
                          <svg className="w-5 h-5 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </XVibeLayout>
  );
}