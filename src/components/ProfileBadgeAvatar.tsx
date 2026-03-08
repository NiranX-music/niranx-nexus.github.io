import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface StreakBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  streak_requirement: number;
  badge_color: string;
  rarity: string;
}

interface ProfileBadgeAvatarProps {
  avatarUrl?: string | null;
  fallback?: string;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showManage?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
};

const badgeSizeClasses = {
  sm: 'w-4 h-4 text-[8px]',
  md: 'w-5 h-5 text-[10px]',
  lg: 'w-8 h-8 text-base',
};

const rarityColors: Record<string, string> = {
  common: 'border-muted-foreground/30',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-red-500',
  mythic: 'border-pink-500',
};

export function ProfileBadgeAvatar({
  avatarUrl,
  fallback = '?',
  userId,
  size = 'md',
  showManage = false,
}: ProfileBadgeAvatarProps) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [equippedBadge, setEquippedBadge] = useState<StreakBadge | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<StreakBadge[]>([]);
  const [allBadges, setAllBadges] = useState<StreakBadge[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!targetUserId) return;
    fetchEquippedBadge();
  }, [targetUserId]);

  const fetchEquippedBadge = async () => {
    if (!targetUserId) return;
    const { data } = await supabase
      .from('user_equipped_badges')
      .select('badge_id, streak_badges(*)')
      .eq('user_id', targetUserId)
      .single();

    if (data?.streak_badges) {
      setEquippedBadge(data.streak_badges as unknown as StreakBadge);
    }
  };

  const loadBadgesForManage = async () => {
    if (!user) return;

    const [{ data: earned }, { data: all }] = await Promise.all([
      supabase
        .from('user_earned_badges')
        .select('badge_id, streak_badges(*)')
        .eq('user_id', user.id),
      supabase.from('streak_badges').select('*').order('streak_requirement'),
    ]);

    setEarnedBadges(
      (earned || []).map((e: any) => e.streak_badges as StreakBadge)
    );
    setAllBadges((all || []) as StreakBadge[]);
  };

  const equipBadge = async (badge: StreakBadge) => {
    if (!user) return;

    // Upsert equipped badge
    const { error } = await supabase
      .from('user_equipped_badges')
      .upsert({ user_id: user.id, badge_id: badge.id, equipped_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to equip badge');
      return;
    }

    setEquippedBadge(badge);
    toast.success(`Equipped "${badge.name}" badge!`);
    setDialogOpen(false);
  };

  const unequipBadge = async () => {
    if (!user) return;
    await supabase.from('user_equipped_badges').delete().eq('user_id', user.id);
    setEquippedBadge(null);
    toast.success('Badge unequipped');
    setDialogOpen(false);
  };

  const isOwner = user?.id === targetUserId;
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  const avatarElement = (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} border-2 ${equippedBadge ? rarityColors[equippedBadge.rarity] || '' : 'border-border'}`}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
          {fallback}
        </AvatarFallback>
      </Avatar>
      {equippedBadge && (
        <span
          className={`absolute -bottom-1 -right-1 ${badgeSizeClasses[size]} flex items-center justify-center rounded-full bg-background border border-border shadow-sm`}
        >
          {equippedBadge.icon}
        </span>
      )}
    </div>
  );

  if (!showManage || !isOwner) {
    if (equippedBadge) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{avatarElement}</TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{equippedBadge.icon} {equippedBadge.name}</p>
              <p className="text-xs text-muted-foreground">{equippedBadge.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return avatarElement;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      setDialogOpen(open);
      if (open) loadBadgesForManage();
    }}>
      <DialogTrigger asChild>
        <button className="cursor-pointer hover:opacity-80 transition-opacity">
          {avatarElement}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Streak Badges</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {allBadges.map((badge) => {
            const earned = earnedIds.has(badge.id);
            const isEquipped = equippedBadge?.id === badge.id;

            return (
              <div
                key={badge.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  earned ? 'bg-muted/50 border-border' : 'opacity-40 border-border/30'
                } ${isEquipped ? 'ring-2 ring-primary' : ''}`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{badge.name}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {badge.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  <p className="text-xs text-muted-foreground">{badge.streak_requirement} day streak</p>
                </div>
                {earned && (
                  <Button
                    size="sm"
                    variant={isEquipped ? 'destructive' : 'default'}
                    onClick={() => isEquipped ? unequipBadge() : equipBadge(badge)}
                    className="text-xs"
                  >
                    {isEquipped ? 'Remove' : 'Equip'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
