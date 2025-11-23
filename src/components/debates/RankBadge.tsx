import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  const getRankConfig = (rank: string) => {
    const configs: any = {
      'Grandmaster': { emoji: '🏆', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', glow: 'shadow-lg shadow-yellow-500/50' },
      'Master': { emoji: '👑', color: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white', glow: 'shadow-lg shadow-purple-500/50' },
      'Expert': { emoji: '💎', color: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white', glow: 'shadow-lg shadow-blue-500/50' },
      'Skilled': { emoji: '🥇', color: 'bg-gradient-to-r from-green-400 to-green-600 text-white', glow: 'shadow-md shadow-green-500/50' },
      'Apprentice': { emoji: '🥈', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white', glow: 'shadow-md shadow-gray-400/50' },
      'Novice': { emoji: '🥉', color: 'bg-gradient-to-r from-orange-300 to-orange-500 text-white', glow: 'shadow-sm shadow-orange-400/50' }
    };
    return configs[rank] || configs['Novice'];
  };

  const config = getRankConfig(rank);

  return (
    <Badge className={cn(config.color, config.glow, "font-semibold", className)}>
      {config.emoji} {rank}
    </Badge>
  );
}
