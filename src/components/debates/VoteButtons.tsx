import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  targetId: string;
  targetType: 'topic' | 'comment';
  upvotes: number;
  downvotes: number;
}

export function VoteButtons({ targetId, targetType, upvotes, downvotes }: VoteButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);

  useEffect(() => {
    loadUserVote();
  }, [user, targetId]);

  useEffect(() => {
    setLocalUpvotes(upvotes);
    setLocalDownvotes(downvotes);
  }, [upvotes, downvotes]);

  const loadUserVote = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('debate_votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .maybeSingle();
    
    if (data) {
      setUserVote(data.vote_type as 'upvote' | 'downvote');
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote', e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({ title: "Please log in to vote", variant: "destructive" });
      return;
    }

    // Optimistic update
    const wasUpvoted = userVote === 'upvote';
    const wasDownvoted = userVote === 'downvote';
    
    if (voteType === 'upvote') {
      if (wasUpvoted) {
        setLocalUpvotes(prev => prev - 1);
        setUserVote(null);
      } else {
        setLocalUpvotes(prev => prev + 1);
        if (wasDownvoted) setLocalDownvotes(prev => prev - 1);
        setUserVote('upvote');
      }
    } else {
      if (wasDownvoted) {
        setLocalDownvotes(prev => prev - 1);
        setUserVote(null);
      } else {
        setLocalDownvotes(prev => prev + 1);
        if (wasUpvoted) setLocalUpvotes(prev => prev - 1);
        setUserVote('downvote');
      }
    }

    // Actual database update
    if (userVote === voteType) {
      // Remove vote
      await supabase
        .from('debate_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType);
    } else if (userVote) {
      // Update vote
      await supabase
        .from('debate_votes')
        .update({ vote_type: voteType })
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType);
    } else {
      // Create vote
      await supabase
        .from('debate_votes')
        .insert({
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          vote_type: voteType
        });
    }
  };

  const karma = localUpvotes - localDownvotes;

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleVote('upvote', e)}
        className={cn(
          "h-8 w-8 p-0",
          userVote === 'upvote' && "text-green-500"
        )}
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
      <span className={cn(
        "font-semibold text-sm",
        karma > 0 && "text-green-500",
        karma < 0 && "text-red-500"
      )}>
        {karma}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleVote('downvote', e)}
        className={cn(
          "h-8 w-8 p-0",
          userVote === 'downvote' && "text-red-500"
        )}
      >
        <ArrowDown className="w-5 h-5" />
      </Button>
    </div>
  );
}