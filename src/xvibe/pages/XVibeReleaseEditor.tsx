import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Send, 
  ArrowLeft,
  Image as ImageIcon,
  Music,
  Info,
  Users,
  FileText,
  Store,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface ReleaseData {
  id?: string;
  title: string;
  release_type: 'single' | 'ep' | 'album';
  cover_url: string | null;
  description: string;
  language: string;
  primary_genre: string;
  secondary_genre: string;
  is_cover_version: boolean;
  is_compilation: boolean;
  copyright_composition: string;
  copyright_recording: string;
  record_label: string;
  original_release_date: string;
  preorder_date: string;
  sales_start_date: string;
  is_explicit: boolean;
  status: string;
}

interface Writer {
  id?: string;
  first_name: string;
  last_name: string;
  role: 'writer' | 'composer' | 'lyricist' | 'producer';
}

interface ArtworkValidation {
  isValid: boolean;
  errors: string[];
  dimensions?: { width: number; height: number };
}

const GENRES = [
  'Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Dance', 'Jazz', 'Classical',
  'Country', 'Reggae', 'Latin', 'K-Pop', 'Indie', 'Metal', 'Folk', 'Blues',
  'Soul', 'Funk', 'Disco', 'House', 'Techno', 'Ambient', 'World', 'Other'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 
  'Japanese', 'Korean', 'Chinese', 'Hindi', 'Arabic', 'Russian', 'Other'
];

const currentYear = new Date().getFullYear();

export default function XVibeReleaseEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showStatusWarning, setShowStatusWarning] = useState(false);

  const [formData, setFormData] = useState<ReleaseData>({
    title: '',
    release_type: 'single',
    cover_url: null,
    description: '',
    language: 'English',
    primary_genre: '',
    secondary_genre: '',
    is_cover_version: false,
    is_compilation: false,
    copyright_composition: `© ${currentYear}`,
    copyright_recording: `℗ ${currentYear}`,
    record_label: '',
    original_release_date: '',
    preorder_date: '',
    sales_start_date: '',
    is_explicit: false,
    status: 'draft',
  });

  const [writers, setWriters] = useState<Writer[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [artworkValidation, setArtworkValidation] = useState<ArtworkValidation | null>(null);

  useEffect(() => {
    initializeEditor();
  }, [id]);

  const initializeEditor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/xvibe/auth');
      return;
    }

    const { data: artist } = await supabase
      .from('xvibe_artists')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (!artist) {
      navigate('/xvibe/artist/register');
      return;
    }

    setArtistId(artist.id);
    
    // Set default record label to artist name
    if (!isEditing) {
      setFormData(prev => ({ ...prev, record_label: artist.name }));
    }

    if (isEditing && id) {
      await fetchRelease(id);
    } else {
      setLoading(false);
    }
  };

  const fetchRelease = async (releaseId: string) => {
    try {
      const { data, error } = await supabase
        .from('xvibe_releases')
        .select('*')
        .eq('id', releaseId)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        original_release_date: data.original_release_date || '',
        preorder_date: data.preorder_date || '',
        sales_start_date: data.sales_start_date || '',
      } as ReleaseData);

      if (data.cover_url) {
        setCoverPreview(data.cover_url);
      }

      if (data.status === 'approved' || data.status === 'live') {
        setShowStatusWarning(true);
      }

      // Fetch writers
      const { data: writersData } = await supabase
        .from('xvibe_release_writers')
        .select('*')
        .eq('release_id', releaseId);

      if (writersData) {
        setWriters(writersData as Writer[]);
      }
    } catch (error) {
      console.error('Error fetching release:', error);
      toast.error('Failed to load release');
      navigate('/xvibe/releases');
    } finally {
      setLoading(false);
    }
  };

  const validateArtwork = async (file: File): Promise<ArtworkValidation> => {
    const errors: string[] = [];
    
    // Check file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      errors.push('File size must be less than 25MB');
    }

    // Check file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      errors.push('Only JPG and PNG formats are allowed');
    }

    // Check dimensions
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 3000 || img.height < 3000) {
          errors.push('Image must be at least 3000x3000 pixels');
        }
        if (img.width !== img.height) {
          errors.push('Image must be square (1:1 aspect ratio)');
        }
        resolve({
          isValid: errors.length === 0,
          errors,
          dimensions: { width: img.width, height: img.height }
        });
      };
      img.onerror = () => {
        errors.push('Failed to load image');
        resolve({ isValid: false, errors });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateArtwork(file);
    setArtworkValidation(validation);

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async (submit = false) => {
    if (!artistId) return;

    if (!formData.title.trim()) {
      toast.error('Please enter a release title');
      return;
    }

    if (submit && !formData.primary_genre) {
      toast.error('Please select a primary genre');
      return;
    }

    if (submit && artworkValidation && !artworkValidation.isValid) {
      toast.error('Please fix artwork issues before submitting');
      return;
    }

    const saveFn = submit ? setSubmitting : setSaving;
    saveFn(true);

    try {
      let coverUrl = formData.cover_url;

      // Upload cover if new file
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `releases/${artistId}/${Date.now()}.${coverExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('xvibe-covers')
          .upload(coverPath, coverFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('xvibe-covers')
          .getPublicUrl(coverPath);
        coverUrl = urlData.publicUrl;
      }

      const releaseData = {
        artist_id: artistId,
        title: formData.title,
        release_type: formData.release_type,
        cover_url: coverUrl,
        description: formData.description || null,
        language: formData.language,
        primary_genre: formData.primary_genre || null,
        secondary_genre: formData.secondary_genre || null,
        is_cover_version: formData.is_cover_version,
        is_compilation: formData.is_compilation,
        copyright_composition: formData.copyright_composition || null,
        copyright_recording: formData.copyright_recording || null,
        record_label: formData.record_label || null,
        original_release_date: formData.original_release_date || null,
        preorder_date: formData.preorder_date || null,
        sales_start_date: formData.sales_start_date || null,
        is_explicit: formData.is_explicit,
        status: submit ? 'in_review' : 'draft',
        submitted_at: submit ? new Date().toISOString() : null,
      };

      let releaseId = id;

      if (isEditing && id) {
        const { error } = await supabase
          .from('xvibe_releases')
          .update(releaseData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('xvibe_releases')
          .insert(releaseData)
          .select('id')
          .single();
        if (error) throw error;
        releaseId = data.id;
      }

      // Save writers
      if (releaseId && writers.length > 0) {
        // Delete existing writers
        await supabase
          .from('xvibe_release_writers')
          .delete()
          .eq('release_id', releaseId);

        // Insert new writers
        const { error: writersError } = await supabase
          .from('xvibe_release_writers')
          .insert(writers.map(w => ({
            release_id: releaseId,
            first_name: w.first_name,
            last_name: w.last_name,
            role: w.role,
          })));
        if (writersError) console.error('Writers save error:', writersError);
      }

      toast.success(submit ? 'Release submitted for review!' : 'Release saved as draft');
      navigate('/xvibe/releases');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save release');
    } finally {
      saveFn(false);
    }
  };

  const addWriter = () => {
    setWriters([...writers, { first_name: '', last_name: '', role: 'writer' }]);
  };

  const updateWriter = (index: number, field: keyof Writer, value: string) => {
    const updated = [...writers];
    updated[index] = { ...updated[index], [field]: value };
    setWriters(updated);
  };

  const removeWriter = (index: number) => {
    setWriters(writers.filter((_, i) => i !== index));
  };

  const getProgress = () => {
    let completed = 0;
    const total = 5;

    if (formData.title) completed++;
    if (coverPreview) completed++;
    if (formData.primary_genre) completed++;
    if (formData.copyright_composition && formData.copyright_recording) completed++;
    if (formData.record_label) completed++;

    return (completed / total) * 100;
  };

  if (loading) {
    return (
      <XVibeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        </div>
      </XVibeLayout>
    );
  }

  return (
    <XVibeLayout>
      <div className="min-h-full bg-[#121212]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/xvibe/releases')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {isEditing ? 'Edit Release' : 'New Release'}
                </h1>
                <p className="text-sm text-[#B3B3B3]">
                  {formData.release_type.charAt(0).toUpperCase() + formData.release_type.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving || submitting}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving || submitting}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit for Review
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Status Warning */}
          {showStatusWarning && (
            <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/50">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-500">
                Editing an approved release will send it back for review.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress */}
          <Card className="bg-[#181818] border-none mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#B3B3B3]">Release Progress</span>
                <span className="text-sm text-white font-medium">{Math.round(getProgress())}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 bg-[#181818] mb-6">
              <TabsTrigger value="details" className="data-[state=active]:bg-[#282828]">
                <Info className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="artwork" className="data-[state=active]:bg-[#282828]">
                <ImageIcon className="w-4 h-4 mr-2" />
                Artwork
              </TabsTrigger>
              <TabsTrigger value="tracks" className="data-[state=active]:bg-[#282828]">
                <Music className="w-4 h-4 mr-2" />
                Tracks
              </TabsTrigger>
              <TabsTrigger value="legal" className="data-[state=active]:bg-[#282828]">
                <FileText className="w-4 h-4 mr-2" />
                Legal
              </TabsTrigger>
              <TabsTrigger value="store" className="data-[state=active]:bg-[#282828]">
                <Store className="w-4 h-4 mr-2" />
                Store
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white">Album Details</CardTitle>
                  <CardDescription>Basic information about your release</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#B3B3B3]">Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(v) => setFormData({ ...formData, language: v })}
                      >
                        <SelectTrigger className="bg-[#282828] border-none text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#B3B3B3]">Release Type</Label>
                      <Select
                        value={formData.release_type}
                        onValueChange={(v) => setFormData({ ...formData, release_type: v as any })}
                      >
                        <SelectTrigger className="bg-[#282828] border-none text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="ep">EP</SelectItem>
                          <SelectItem value="album">Album</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#B3B3B3]">Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter release title"
                      className="bg-[#282828] border-none text-white mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-[#282828] rounded-lg">
                      <Label className="text-white">Cover Version</Label>
                      <Switch
                        checked={formData.is_cover_version}
                        onCheckedChange={(v) => setFormData({ ...formData, is_cover_version: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#282828] rounded-lg">
                      <Label className="text-white">Compilation Album</Label>
                      <Switch
                        checked={formData.is_compilation}
                        onCheckedChange={(v) => setFormData({ ...formData, is_compilation: v })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#B3B3B3]">Primary Genre *</Label>
                      <Select
                        value={formData.primary_genre}
                        onValueChange={(v) => setFormData({ ...formData, primary_genre: v })}
                      >
                        <SelectTrigger className="bg-[#282828] border-none text-white mt-1">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map(genre => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#B3B3B3]">Secondary Genre</Label>
                      <Select
                        value={formData.secondary_genre}
                        onValueChange={(v) => setFormData({ ...formData, secondary_genre: v })}
                      >
                        <SelectTrigger className="bg-[#282828] border-none text-white mt-1">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map(genre => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
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
                      placeholder="Tell listeners about this release..."
                      className="bg-[#282828] border-none text-white mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#282828] rounded-lg">
                    <div>
                      <Label className="text-white">Explicit Content</Label>
                      <p className="text-sm text-[#B3B3B3]">Does this release contain explicit lyrics?</p>
                    </div>
                    <Switch
                      checked={formData.is_explicit}
                      onCheckedChange={(v) => setFormData({ ...formData, is_explicit: v })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Artwork Tab */}
            <TabsContent value="artwork">
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white">Cover Artwork</CardTitle>
                  <CardDescription>Upload high-quality artwork for your release</CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />

                  <div className="flex gap-6">
                    {/* Preview */}
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="w-64 h-64 rounded-lg bg-[#282828] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors overflow-hidden group relative"
                    >
                      {coverPreview ? (
                        <>
                          <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-[#B3B3B3] mx-auto mb-2" />
                          <p className="text-[#B3B3B3]">Click to upload</p>
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="flex-1 space-y-4">
                      <h3 className="text-white font-semibold">Artwork Requirements</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 text-[#B3B3B3]">
                          <CheckCircle className={`w-4 h-4 ${artworkValidation?.dimensions?.width && artworkValidation.dimensions.width >= 3000 ? 'text-green-500' : 'text-[#B3B3B3]'}`} />
                          3000 × 3000 pixels minimum
                        </li>
                        <li className="flex items-center gap-2 text-[#B3B3B3]">
                          <CheckCircle className={`w-4 h-4 ${artworkValidation?.dimensions?.width === artworkValidation?.dimensions?.height ? 'text-green-500' : 'text-[#B3B3B3]'}`} />
                          Square format (1:1 ratio)
                        </li>
                        <li className="flex items-center gap-2 text-[#B3B3B3]">
                          <CheckCircle className="w-4 h-4" />
                          RGB color mode
                        </li>
                        <li className="flex items-center gap-2 text-[#B3B3B3]">
                          <CheckCircle className="w-4 h-4" />
                          Less than 25MB
                        </li>
                        <li className="flex items-center gap-2 text-[#B3B3B3]">
                          <CheckCircle className="w-4 h-4" />
                          JPG or PNG format
                        </li>
                      </ul>

                      {artworkValidation && !artworkValidation.isValid && (
                        <Alert className="bg-red-500/10 border-red-500/50">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-400">
                            <ul className="list-disc list-inside">
                              {artworkValidation.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {artworkValidation?.isValid && (
                        <Alert className="bg-green-500/10 border-green-500/50">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-400">
                            Artwork meets all requirements ({artworkValidation.dimensions?.width}×{artworkValidation.dimensions?.height}px)
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tracks Tab */}
            <TabsContent value="tracks">
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white">Tracks</CardTitle>
                  <CardDescription>Add tracks to your release</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
                    <Music className="w-12 h-12 text-[#B3B3B3] mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No tracks added yet</h3>
                    <p className="text-[#B3B3B3] mb-4">Add tracks from your uploads or upload new ones</p>
                    <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tracks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Legal Tab */}
            <TabsContent value="legal">
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white">Legal & Rights</CardTitle>
                  <CardDescription>Copyright and publishing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Writers */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-white text-base">Writers</Label>
                        <p className="text-sm text-[#B3B3B3]">Songwriters and composers</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addWriter}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Writer
                      </Button>
                    </div>

                    {writers.length === 0 ? (
                      <p className="text-[#B3B3B3] text-sm">No writers added yet</p>
                    ) : (
                      <div className="space-y-3">
                        {writers.map((writer, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-[#282828] rounded-lg">
                            <div className="grid grid-cols-3 gap-3 flex-1">
                              <Input
                                placeholder="First Name"
                                value={writer.first_name}
                                onChange={(e) => updateWriter(index, 'first_name', e.target.value)}
                                className="bg-[#181818] border-none text-white"
                              />
                              <Input
                                placeholder="Last Name"
                                value={writer.last_name}
                                onChange={(e) => updateWriter(index, 'last_name', e.target.value)}
                                className="bg-[#181818] border-none text-white"
                              />
                              <Select
                                value={writer.role}
                                onValueChange={(v) => updateWriter(index, 'role', v)}
                              >
                                <SelectTrigger className="bg-[#181818] border-none text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="writer">Writer</SelectItem>
                                  <SelectItem value="composer">Composer</SelectItem>
                                  <SelectItem value="lyricist">Lyricist</SelectItem>
                                  <SelectItem value="producer">Producer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeWriter(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Copyright */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#B3B3B3]">Composition Copyright ©</Label>
                      <Input
                        value={formData.copyright_composition}
                        onChange={(e) => setFormData({ ...formData, copyright_composition: e.target.value })}
                        placeholder="© 2024 Your Name"
                        className="bg-[#282828] border-none text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[#B3B3B3]">Sound Recording Copyright ℗</Label>
                      <Input
                        value={formData.copyright_recording}
                        onChange={(e) => setFormData({ ...formData, copyright_recording: e.target.value })}
                        placeholder="℗ 2024 Your Label"
                        className="bg-[#282828] border-none text-white mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#B3B3B3]">Record Label *</Label>
                    <Input
                      value={formData.record_label}
                      onChange={(e) => setFormData({ ...formData, record_label: e.target.value })}
                      placeholder="Your label name"
                      className="bg-[#282828] border-none text-white mt-1"
                    />
                    <p className="text-xs text-[#B3B3B3] mt-1">Use your artist name if self-releasing</p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#B3B3B3]">Original Release Date</Label>
                      <Input
                        type="date"
                        value={formData.original_release_date}
                        onChange={(e) => setFormData({ ...formData, original_release_date: e.target.value })}
                        className="bg-[#282828] border-none text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[#B3B3B3]">Pre-order Date</Label>
                      <Input
                        type="date"
                        value={formData.preorder_date}
                        onChange={(e) => setFormData({ ...formData, preorder_date: e.target.value })}
                        className="bg-[#282828] border-none text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[#B3B3B3]">Sales Start Date</Label>
                      <Input
                        type="date"
                        value={formData.sales_start_date}
                        onChange={(e) => setFormData({ ...formData, sales_start_date: e.target.value })}
                        className="bg-[#282828] border-none text-white mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Store Tab */}
            <TabsContent value="store">
              <Card className="bg-[#181818] border-none">
                <CardHeader>
                  <CardTitle className="text-white">Distribution Store</CardTitle>
                  <CardDescription>Where your music will be available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-[#282828] rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-[#1DB954] flex items-center justify-center">
                      <Music className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">XWave • XVibe</h3>
                      <p className="text-sm text-[#B3B3B3]">Your music will be available on XVibe</p>
                    </div>
                    <Badge className="bg-[#1DB954] text-black">Enabled</Badge>
                  </div>

                  <p className="text-sm text-[#B3B3B3] mt-4">
                    XVibe is the only distribution store for XWave releases. Your music will be available 
                    to all XVibe listeners once approved.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </XVibeLayout>
  );
}
