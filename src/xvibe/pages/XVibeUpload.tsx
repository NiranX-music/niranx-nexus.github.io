import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Music, 
  Image as ImageIcon,
  X,
  CheckCircle,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

const GENRES = [
  'Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Classical', 
  'Country', 'Reggae', 'Latin', 'K-Pop', 'Indie', 'Metal', 'Folk', 'Other'
];

const MOODS = [
  'Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Angry', 'Chill', 
  'Party', 'Focus', 'Sleep', 'Workout', 'Relaxing'
];

export default function XVibeUpload() {
  const navigate = useNavigate();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUploadMode, setAudioUploadMode] = useState<'file' | 'link'>('file');
  const [coverUploadMode, setCoverUploadMode] = useState<'file' | 'link'>('file');
  const [audioLink, setAudioLink] = useState('');
  const [coverLink, setCoverLink] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    mood: '',
    description: '',
    isExplicit: false,
    releaseType: 'single'
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Audio file must be less than 50MB');
        return;
      }
      setAudioFile(file);
      setAudioLink('');
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover image must be less than 5MB');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    const hasAudio = audioFile || (audioUploadMode === 'link' && audioLink && isValidUrl(audioLink));
    if (!hasAudio) {
      toast.error('Please upload an audio file or paste a valid audio link');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get artist profile
      const { data: artist } = await supabase
        .from('xvibe_artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!artist) {
        toast.error('Artist profile not found');
        navigate('/xvibe/artist/register');
        return;
      }

      setUploadProgress(10);

      // Get audio URL - either from file upload or link
      let finalAudioUrl: string;
      
      if (audioFile) {
        // Upload audio file
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `tracks/${artist.id}/${Date.now()}.${audioExt}`;
        
        const { error: audioError } = await supabase.storage
          .from('xvibe-audio')
          .upload(audioPath, audioFile);

        if (audioError) throw audioError;
        setUploadProgress(50);

        const { data: audioUrl } = supabase.storage
          .from('xvibe-audio')
          .getPublicUrl(audioPath);
        finalAudioUrl = audioUrl.publicUrl;
      } else {
        // Use provided link
        finalAudioUrl = audioLink;
        setUploadProgress(50);
      }

      // Get cover URL - either from file upload or link
      let coverUrl = null;
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `covers/${artist.id}/${Date.now()}.${coverExt}`;
        
        const { error: coverError } = await supabase.storage
          .from('xvibe-covers')
          .upload(coverPath, coverFile);

        if (!coverError) {
          const { data } = supabase.storage
            .from('xvibe-covers')
            .getPublicUrl(coverPath);
          coverUrl = data.publicUrl;
        }
      } else if (coverLink && isValidUrl(coverLink)) {
        coverUrl = coverLink;
      }
      setUploadProgress(80);

      // Create track record
      const { error: trackError } = await supabase
        .from('xvibe_tracks')
        .insert({
          title: formData.title,
          artist_id: artist.id,
          audio_url: finalAudioUrl,
          cover_url: coverUrl,
          genre: formData.genre || null,
          mood: formData.mood || null,
          description: formData.description || null,
          is_explicit: formData.isExplicit,
          status: saveAsDraft ? 'draft' : 'pending'
        });

      if (trackError) throw trackError;
      setUploadProgress(100);

      toast.success(saveAsDraft ? 'Track saved as draft' : 'Track submitted for review');
      navigate('/xvibe/artist/dashboard');

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload track');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <XVibeLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Track</h1>
          <p className="text-[#B3B3B3]">Share your music with the world</p>
        </div>

        <div className="space-y-6">
          {/* Audio Upload */}
          <Card className="bg-[#181818] border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-[#1DB954]" />
                Audio File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={audioUploadMode} onValueChange={(v) => setAudioUploadMode(v as 'file' | 'link')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#282828] mb-4">
                  <TabsTrigger value="file" className="data-[state=active]:bg-[#1DB954] data-[state=active]:text-black">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="link" className="data-[state=active]:bg-[#1DB954] data-[state=active]:text-black">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Paste Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file">
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                  
                  {audioFile ? (
                    <div className="flex items-center gap-4 p-4 bg-[#282828] rounded-lg">
                      <div className="p-3 bg-[#1DB954]/20 rounded-lg">
                        <Music className="w-6 h-6 text-[#1DB954]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{audioFile.name}</p>
                        <p className="text-sm text-[#B3B3B3]">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAudioFile(null)}
                        className="text-[#B3B3B3] hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full p-8 border-2 border-dashed border-white/20 rounded-lg hover:border-[#1DB954] transition-colors text-center"
                    >
                      <Upload className="w-10 h-10 text-[#B3B3B3] mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">Click to upload audio</p>
                      <p className="text-sm text-[#B3B3B3]">MP3, WAV, FLAC up to 50MB</p>
                    </button>
                  )}
                </TabsContent>

                <TabsContent value="link">
                  <div className="space-y-3">
                    <Input
                      value={audioLink}
                      onChange={(e) => {
                        setAudioLink(e.target.value);
                        setAudioFile(null);
                      }}
                      placeholder="https://example.com/audio.mp3"
                      className="bg-[#282828] border-none text-white"
                    />
                    <p className="text-xs text-[#B3B3B3]">
                      Paste a direct link to an audio file (MP3, WAV, etc.)
                    </p>
                    {audioLink && isValidUrl(audioLink) && (
                      <div className="flex items-center gap-2 text-[#1DB954]">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Valid URL</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Cover Art */}
          <Card className="bg-[#181818] border-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                Cover Art
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={coverUploadMode} onValueChange={(v) => setCoverUploadMode(v as 'file' | 'link')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#282828] mb-4">
                  <TabsTrigger value="file" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="link" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Paste Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                  
                  <div className="flex gap-4">
                    <div 
                      onClick={() => coverInputRef.current?.click()}
                      className="w-32 h-32 rounded-lg bg-[#282828] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors overflow-hidden"
                    >
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-[#B3B3B3]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">Upload cover art</p>
                      <p className="text-sm text-[#B3B3B3] mb-3">Recommended: 3000x3000px, JPG or PNG</p>
                      {coverFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCoverFile(null);
                            setCoverPreview(null);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="link">
                  <div className="space-y-3">
                    <Input
                      value={coverLink}
                      onChange={(e) => {
                        setCoverLink(e.target.value);
                        setCoverFile(null);
                        setCoverPreview(e.target.value || null);
                      }}
                      placeholder="https://example.com/cover.jpg"
                      className="bg-[#282828] border-none text-white"
                    />
                    <p className="text-xs text-[#B3B3B3]">
                      Paste a direct link to an image file (JPG, PNG, etc.)
                    </p>
                    {coverLink && isValidUrl(coverLink) && (
                      <div className="flex items-center gap-4">
                        <img 
                          src={coverLink} 
                          alt="Cover preview" 
                          className="w-16 h-16 rounded object-cover bg-[#282828]"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <div className="flex items-center gap-2 text-purple-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Valid URL</span>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Track Details */}
          <Card className="bg-[#181818] border-none">
            <CardHeader>
              <CardTitle className="text-white">Track Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#B3B3B3]">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter track title"
                  className="bg-[#282828] border-none text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#B3B3B3]">Genre</Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(value) => setFormData({ ...formData, genre: value })}
                  >
                    <SelectTrigger className="bg-[#282828] border-none text-white mt-1">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#282828] border-none">
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[#B3B3B3]">Mood</Label>
                  <Select
                    value={formData.mood}
                    onValueChange={(value) => setFormData({ ...formData, mood: value })}
                  >
                    <SelectTrigger className="bg-[#282828] border-none text-white mt-1">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#282828] border-none">
                      {MOODS.map((mood) => (
                        <SelectItem key={mood} value={mood.toLowerCase()}>
                          {mood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[#B3B3B3]">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell listeners about this track..."
                  className="bg-[#282828] border-none text-white mt-1 min-h-[100px]"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#282828] rounded-lg">
                <div>
                  <p className="text-white font-medium">Explicit Content</p>
                  <p className="text-sm text-[#B3B3B3]">Contains mature content or language</p>
                </div>
                <Switch
                  checked={formData.isExplicit}
                  onCheckedChange={(checked) => setFormData({ ...formData, isExplicit: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {isSubmitting && (
            <Card className="bg-[#181818] border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 text-[#1DB954] animate-spin" />
                  <span className="text-white">Uploading...</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </XVibeLayout>
  );
}
