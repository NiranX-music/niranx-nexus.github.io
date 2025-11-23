import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useXP } from "@/contexts/XPContext";
import { useToast } from "@/hooks/use-toast";

export function useDebateXP() {
  const { user } = useAuth();
  const { addXP } = useXP();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to debate topics changes
    const topicChannel = supabase
      .channel('debate_xp_topics')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debate_topics',
        filter: `user_id=eq.${user.id}`
      }, () => {
        addXP(50);
        toast({
          title: "🎯 +50 XP",
          description: "Created a new debate!",
        });
      })
      .subscribe();

    // Subscribe to debate comments changes
    const commentChannel = supabase
      .channel('debate_xp_comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debate_comments',
        filter: `user_id=eq.${user.id}`
      }, () => {
        addXP(5);
        toast({
          title: "💬 +5 XP",
          description: "Posted a comment!",
        });
      })
      .subscribe();

    // Subscribe to debate votes (when receiving upvotes)
    const voteChannel = supabase
      .channel('debate_xp_votes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debate_votes'
      }, async (payload: any) => {
        if (payload.new.vote_type === 'upvote') {
          // Check if the vote is on user's content
          if (payload.new.target_type === 'topic') {
            const { data } = await supabase
              .from('debate_topics')
              .select('user_id')
              .eq('id', payload.new.target_id)
              .single();
            
            if (data?.user_id === user.id) {
              addXP(2);
            }
          } else {
            const { data } = await supabase
              .from('debate_comments')
              .select('user_id')
              .eq('id', payload.new.target_id)
              .single();
            
            if (data?.user_id === user.id) {
              addXP(2);
            }
          }
        }
      })
      .subscribe();

    // Subscribe to awards received
    const awardChannel = supabase
      .channel('debate_xp_awards')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debate_awards_given',
        filter: `given_to=eq.${user.id}`
      }, async (payload: any) => {
        const { data } = await supabase
          .from('debate_awards')
          .select('xp_value, name')
          .eq('id', payload.new.award_id)
          .single();
        
        if (data) {
          addXP(data.xp_value);
          toast({
            title: `✨ +${data.xp_value} XP`,
            description: `Received ${data.name} award!`,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(topicChannel);
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(voteChannel);
      supabase.removeChannel(awardChannel);
    };
  }, [user, addXP, toast]);

  return null;
}
