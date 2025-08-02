import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Zap } from 'lucide-react';
import { useXP } from '@/contexts/XPContext';

const XPDisplay = ({ className = "" }: { className?: string }) => {
  const { xp, level, getXPProgress } = useXP();
  const progress = getXPProgress();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-sm font-bold">
          <Star className="w-3 h-3" />
          <span>L{level}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-bold">
          <Zap className="w-3 h-3" />
          <span>{xp} XP</span>
        </div>
      </div>
      <div className="flex-1 max-w-24">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

export default XPDisplay;