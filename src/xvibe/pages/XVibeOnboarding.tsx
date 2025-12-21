import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GENRES, MOODS } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function XVibeOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleComplete = async () => {
    if (!user) {
      navigate('/xvibe');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('xvibe_user_preferences')
        .upsert({
          user_id: user.id,
          preferred_genres: selectedGenres,
          preferred_moods: selectedMoods,
          onboarding_completed: true,
        });

      if (error) throw error;
      toast.success('Preferences saved!');
      navigate('/xvibe');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#0f0f23] flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#1DB954]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn(
                'w-24 h-1.5 rounded-full transition-colors',
                s <= step ? 'bg-[#1DB954]' : 'bg-white/20'
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="bg-[#181818] rounded-2xl p-8 shadow-2xl">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  What do you like?
                </h1>
                <p className="text-[#B3B3B3]">
                  Pick at least 3 genres you enjoy
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={cn(
                        'relative p-4 rounded-lg border-2 transition-all text-left',
                        isSelected
                          ? 'border-[#1DB954] bg-[#1DB954]/10'
                          : 'border-[#282828] bg-[#282828] hover:border-[#3e3e3e]'
                      )}
                    >
                      <span className="font-medium text-white">{genre}</span>
                      {isSelected && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-[#1DB954]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={selectedGenres.length < 3}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-6 rounded-full"
              >
                Continue
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>

              <button
                onClick={() => navigate('/xvibe')}
                className="w-full mt-4 text-[#B3B3B3] hover:text-white text-sm"
              >
                Skip for now
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  What's your vibe?
                </h1>
                <p className="text-[#B3B3B3]">
                  Select moods that match your listening style
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {MOODS.map((mood) => {
                  const isSelected = selectedMoods.includes(mood);
                  return (
                    <button
                      key={mood}
                      onClick={() => toggleMood(mood)}
                      className={cn(
                        'relative p-4 rounded-lg border-2 transition-all text-left',
                        isSelected
                          ? 'border-[#1DB954] bg-[#1DB954]/10'
                          : 'border-[#282828] bg-[#282828] hover:border-[#3e3e3e]'
                      )}
                    >
                      <span className="font-medium text-white">{mood}</span>
                      {isSelected && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-[#1DB954]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-[#3e3e3e] text-white hover:bg-[#282828] py-6 rounded-full"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading || selectedMoods.length === 0}
                  className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-6 rounded-full"
                >
                  {loading ? 'Saving...' : 'Start Listening'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
