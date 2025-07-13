import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Smile, 
  Meh, 
  Frown, 
  Play,
  Pause,
  Coffee,
  Sun,
  Moon,
  Sparkles,
  Wind,
  Waves
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MoodEntry {
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad';
  note?: string;
}

const ChillCorner = () => {
  const [currentMood, setCurrentMood] = useState<MoodEntry['mood'] | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  const affirmations = [
    "You are capable of amazing things! 🌟",
    "Every challenge is an opportunity to grow. 💪",
    "Your hard work is paying off. Keep going! 🚀",
    "You've got this! Believe in yourself. ✨",
    "Progress, not perfection. You're doing great! 🎯",
    "Your effort today builds tomorrow's success. 🌱",
    "You are stronger than you think. 💎",
    "Small steps lead to big achievements. 🏆",
    "Your potential is limitless. Shine bright! ☀️",
    "You make a difference just by being you. 🌈"
  ];

  const relaxingSounds = [
    { name: 'Rain', icon: <Wind className="w-4 h-4" />, duration: '10:00' },
    { name: 'Ocean Waves', icon: <Waves className="w-4 h-4" />, duration: '8:30' },
    { name: 'Forest', icon: <Sun className="w-4 h-4" />, duration: '12:00' },
    { name: 'Night Rain', icon: <Moon className="w-4 h-4" />, duration: '15:00' },
  ];

  // Load mood history from localStorage
  useEffect(() => {
    const savedMoodHistory = localStorage.getItem('studyverse-mood-history');
    if (savedMoodHistory) {
      try {
        setMoodHistory(JSON.parse(savedMoodHistory));
      } catch (error) {
        console.error('Error loading mood history:', error);
      }
    }

    // Set daily affirmation
    const today = new Date().toDateString();
    const savedAffirmation = localStorage.getItem(`studyverse-daily-affirmation-${today}`);
    
    if (savedAffirmation) {
      setCurrentAffirmation(savedAffirmation);
    } else {
      const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
      setCurrentAffirmation(randomAffirmation);
      localStorage.setItem(`studyverse-daily-affirmation-${today}`, randomAffirmation);
    }

    // Check if user already logged mood today
    const todayMood = moodHistory.find(entry => entry.date === today);
    if (todayMood) {
      setCurrentMood(todayMood.mood);
    }
  }, []);

  // Save mood history to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-mood-history', JSON.stringify(moodHistory));
  }, [moodHistory]);

  // Breathing exercise timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingCount(prev => {
          const newCount = prev + 1;
          
          if (breathingPhase === 'inhale' && newCount >= 4) {
            setBreathingPhase('hold');
            return 0;
          } else if (breathingPhase === 'hold' && newCount >= 7) {
            setBreathingPhase('exhale');
            return 0;
          } else if (breathingPhase === 'exhale' && newCount >= 8) {
            setBreathingPhase('inhale');
            return 0;
          }
          
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing, breathingPhase]);

  const logMood = (mood: MoodEntry['mood']) => {
    const today = new Date().toDateString();
    const existingEntryIndex = moodHistory.findIndex(entry => entry.date === today);
    
    const newEntry: MoodEntry = {
      date: today,
      mood
    };

    if (existingEntryIndex >= 0) {
      const newHistory = [...moodHistory];
      newHistory[existingEntryIndex] = newEntry;
      setMoodHistory(newHistory);
    } else {
      setMoodHistory(prev => [...prev, newEntry]);
    }

    setCurrentMood(mood);
    
    toast({
      title: "Mood Logged! 💝",
      description: "Thanks for checking in with yourself.",
    });
  };

  const getMoodIcon = (mood: MoodEntry['mood']) => {
    switch (mood) {
      case 'great':
        return <Smile className="w-6 h-6 text-green-500" />;
      case 'good':
        return <Smile className="w-6 h-6 text-blue-500" />;
      case 'okay':
        return <Meh className="w-6 h-6 text-yellow-500" />;
      case 'bad':
        return <Frown className="w-6 h-6 text-red-500" />;
    }
  };

  const getMoodColor = (mood: MoodEntry['mood']) => {
    switch (mood) {
      case 'great':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'good':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'okay':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'bad':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
    }
  };

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
    if (!isBreathing) {
      setBreathingCount(0);
      setBreathingPhase('inhale');
    }
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe In...';
      case 'hold':
        return 'Hold...';
      case 'exhale':
        return 'Breathe Out...';
    }
  };

  const getWeeklyMoodTrend = () => {
    const lastWeek = moodHistory.slice(-7);
    const moodValues = { great: 4, good: 3, okay: 2, bad: 1 };
    const average = lastWeek.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / lastWeek.length;
    
    if (average >= 3.5) return { trend: 'positive', emoji: '📈', text: 'Great week!' };
    if (average >= 2.5) return { trend: 'stable', emoji: '➡️', text: 'Steady mood' };
    return { trend: 'needs-attention', emoji: '💙', text: 'Take care of yourself' };
  };

  const weeklyTrend = getWeeklyMoodTrend();

  return (
    <Card className="widget">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Chill Corner</h3>
            <p className="text-sm text-muted-foreground">
              Your wellness sanctuary 🧘‍♀️
            </p>
          </div>
        </div>

        {/* Daily Affirmation */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-600">Daily Affirmation</span>
          </div>
          <p className="text-sm italic text-purple-700 dark:text-purple-300">
            "{currentAffirmation}"
          </p>
        </div>

        {/* Mood Tracker */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">How are you feeling today?</h4>
          
          {currentMood ? (
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getMoodIcon(currentMood)}
                <span className="font-medium capitalize">{currentMood}</span>
              </div>
              <p className="text-xs text-muted-foreground">Logged for today</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMood(null)}
                className="mt-2"
              >
                Update Mood
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {(['great', 'good', 'okay', 'bad'] as const).map((mood) => (
                <Button
                  key={mood}
                  variant="outline"
                  onClick={() => logMood(mood)}
                  className={`p-3 h-auto flex-col gap-1 ${getMoodColor(mood)}`}
                >
                  {getMoodIcon(mood)}
                  <span className="text-xs capitalize">{mood}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Mood Trend */}
          {moodHistory.length >= 3 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{weeklyTrend.emoji}</span>
              <span>{weeklyTrend.text}</span>
            </div>
          )}
        </div>

        {/* Breathing Exercise */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">4-7-8 Breathing Exercise</h4>
          
          <div className="text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div 
                className={`w-24 h-24 rounded-full border-4 border-blue-500/30 flex items-center justify-center transition-all duration-1000 ${
                  isBreathing ? 
                    breathingPhase === 'inhale' ? 'scale-110 bg-blue-500/20' :
                    breathingPhase === 'hold' ? 'scale-110 bg-purple-500/20 border-purple-500/30' :
                    'scale-90 bg-green-500/20 border-green-500/30'
                  : 'bg-blue-500/10'
                }`}
              >
                <Wind className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            {isBreathing ? (
              <div className="space-y-2">
                <p className="font-medium text-blue-600">{getBreathingInstruction()}</p>
                <p className="text-2xl font-bold text-blue-600">{breathingCount + 1}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Inhale for 4, hold for 7, exhale for 8
              </p>
            )}
            
            <Button
              onClick={toggleBreathing}
              variant={isBreathing ? 'destructive' : 'default'}
              className="w-full"
            >
              {isBreathing ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Breathing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Breathing
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Relaxing Sounds */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Relaxing Sounds</h4>
          <div className="grid grid-cols-2 gap-2">
            {relaxingSounds.map((sound, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex-col gap-1"
                onClick={() => {
                  toast({
                    title: `Playing ${sound.name}`,
                    description: "Enjoy your relaxation time! 🎵",
                  });
                }}
              >
                {sound.icon}
                <span className="text-xs">{sound.name}</span>
                <span className="text-xs text-muted-foreground">{sound.duration}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Quick Wellness</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Self-Care Reminder 💝",
                  description: "Remember to drink water and take breaks!",
                });
              }}
            >
              <Coffee className="w-4 h-4 mr-2" />
              Hydrate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Stretch Break! 🤸‍♀️",
                  description: "Take 2 minutes to stretch your body.",
                });
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Stretch
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChillCorner;