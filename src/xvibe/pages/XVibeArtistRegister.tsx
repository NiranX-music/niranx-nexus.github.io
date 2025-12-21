import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { XVibeLayout } from '../components/layout/XVibeLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Music, 
  Image as ImageIcon,
  Loader2,
  Mic2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function XVibeArtistRegister() {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    genres: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter an artist name');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/xvibe/auth');
        return;
      }

      // Check if artist already exists
      const { data: existing } = await supabase
        .from('xvibe_artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        toast.error('You already have an artist profile');
        navigate('/xvibe/artist/dashboard');
        return;
      }

      // Upload avatar if provided
      let avatarUrl = null;
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `avatars/${user.id}/${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from('xvibe-avatars')
          .upload(path, avatarFile);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('xvibe-avatars')
            .getPublicUrl(path);
          avatarUrl = data.publicUrl;
        }
      }

      // Create artist profile
      const { error } = await supabase
        .from('xvibe_artists')
        .insert({
          user_id: user.id,
          name: formData.name,
          bio: formData.bio || null,
          avatar_url: avatarUrl,
          genres: formData.genres ? formData.genres.split(',').map(g => g.trim()) : []
        });

      if (error) throw error;

      toast.success('Artist profile created!');
      navigate('/xvibe/artist/dashboard');

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create artist profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <XVibeLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-[#181818] border-none">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center mx-auto mb-4">
              <Mic2 className="w-8 h-8 text-black" />
            </div>
            <CardTitle className="text-2xl text-white">Become an Artist</CardTitle>
            <CardDescription className="text-[#B3B3B3]">
              Create your artist profile and start sharing your music
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-[#282828] flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors overflow-hidden"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#B3B3B3]" />
                )}
              </div>
            </div>
            <p className="text-center text-sm text-[#B3B3B3]">Click to upload profile photo</p>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label className="text-[#B3B3B3]">Artist Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your artist name"
                  className="bg-[#282828] border-none text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-[#B3B3B3]">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell fans about yourself..."
                  className="bg-[#282828] border-none text-white mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label className="text-[#B3B3B3]">Genres</Label>
                <Input
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  placeholder="Pop, Hip-Hop, R&B (comma separated)"
                  className="bg-[#282828] border-none text-white mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Artist Profile
                </>
              )}
            </Button>

            <p className="text-center text-xs text-[#B3B3B3]">
              By creating an artist profile, you agree to our terms of service
            </p>
          </CardContent>
        </Card>
      </div>
    </XVibeLayout>
  );
}
