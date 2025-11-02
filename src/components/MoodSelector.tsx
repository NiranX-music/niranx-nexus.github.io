import { useMood, MoodType } from '@/contexts/MoodContext';
import { Card, CardContent } from '@/components/ui/card';
import { Smile, Target, Waves, Coffee, Frown } from 'lucide-react';

const moods: { type: MoodType; icon: typeof Smile; label: string; emoji: string }[] = [
  { type: 'excited', icon: Smile, label: 'Excited', emoji: '😄' },
  { type: 'focused', icon: Target, label: 'Focused', emoji: '🎯' },
  { type: 'calm', icon: Waves, label: 'Calm', emoji: '😌' },
  { type: 'tired', icon: Coffee, label: 'Tired', emoji: '😴' },
  { type: 'stressed', icon: Frown, label: 'Stressed', emoji: '😰' },
];

export default function MoodSelector() {
  const { mood, setMood, getMoodTheme } = useMood();
  const theme = getMoodTheme();

  return (
    <Card className="glass-card border-primary/20">
      <CardContent className="pt-6">
        <h3 className="text-sm font-semibold mb-4 text-center gradient-text">
          How are you feeling today?
        </h3>
        <div className="flex justify-center gap-3">
          {moods.map(({ type, icon: Icon, label, emoji }) => (
            <button
              key={type}
              onClick={() => setMood(type)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 hover:scale-110 ${
                mood === type
                  ? 'bg-primary/20 border-2 border-primary shadow-neon'
                  : 'bg-background/50 border border-border hover:bg-background/70'
              }`}
              title={label}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
