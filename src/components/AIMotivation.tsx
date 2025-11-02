import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Brain } from 'lucide-react';
import { useFocus } from '@/contexts/FocusContext';
import { useXP } from '@/contexts/XPContext';
import { useMood } from '@/contexts/MoodContext';

export default function AIMotivation() {
  const { getTodayStats } = useFocus();
  const { level } = useXP();
  const { mood } = useMood();
  const todayStats = getTodayStats();

  const getMotivationMessage = () => {
    const hour = new Date().getHours();
    const totalMinutes = todayStats.totalMinutes;

    if (mood === 'stressed') {
      return "Hey legend, take a deep breath. You got this. Maybe start with a quick 15-min session?";
    }

    if (mood === 'tired') {
      return "Energy low? No worries. Even 20 minutes of focused work counts. Let's crush it together.";
    }

    if (totalMinutes === 0) {
      if (hour < 12) {
        return "Good morning! Ready to dominate today? Start with Physics to build momentum.";
      } else if (hour < 17) {
        return "Afternoon vibes! Perfect time for deep work. Let's lock in for 45 minutes.";
      } else {
        return "Evening session! Review what you learned today. Consistency > Perfection.";
      }
    }

    if (totalMinutes < 60) {
      return `${totalMinutes} mins done. You're building momentum. Keep the streak alive!`;
    }

    if (totalMinutes < 120) {
      return `${totalMinutes} mins in! You're in the zone. One more session to hit 2 hours?`;
    }

    return `LEGEND STATUS: ${totalMinutes} mins today. You're absolutely crushing it! 🔥`;
  };

  const getProductivityTip = () => {
    const tips = [
      `You peak between 9–11AM based on your patterns. Schedule hard subjects then.`,
      `Try 40-min blocks instead of 25. Your focus metrics show better retention.`,
      `Level ${level} students average 3.5h/day. You're on track for greatness.`,
      `Chemistry sessions show frequent pauses. Try Havoc Mode for better flow.`,
      `Physics is your strongest subject. Use that confidence for other topics.`,
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (
    <Card className="glass-card border-accent/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1 flex items-center gap-2">
              AI Study Mentor
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getMotivationMessage()}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-background/50 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            💡 <span className="font-semibold">AI Insight:</span> {getProductivityTip()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
