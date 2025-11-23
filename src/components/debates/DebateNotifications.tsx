import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function DebateNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to replies on user's comments
    const replyChannel = supabase
      .channel('debate_notifications_replies')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debate_comments'
      }, async (payload: any) => {
        if (payload.new.parent_comment_id) {
          // Check if this is a reply to user's comment
          const { data: parentComment } = await supabase
            .from('debate_comments')
            .select('user_id, content')
            .eq('id', payload.new.parent_comment_id)
            .single();

          if (parentComment?.user_id === user.id) {
            const { data: replier } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', payload.new.user_id)
              .single();

            toast({
              title: "💬 New Reply",
              description: `${replier?.username || 'Someone'} replied to your comment`,
            });

            // Create notification in database
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'New Reply',
              type: 'debate_reply',
              message: `${replier?.username || 'Someone'} replied to your comment`,
              data: {
                comment_id: payload.new.id,
                debate_id: payload.new.debate_id
              }
            });
          }
        }
      })
      .subscribe();

    // Subscribe to upvote milestones
    const voteChannel = supabase
      .channel('debate_notifications_votes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'debate_comments'
      }, async (payload: any) => {
        if (payload.new.user_id === user.id) {
          const karma = payload.new.upvotes - payload.new.downvotes;
          const oldKarma = payload.old.upvotes - payload.old.downvotes;
          
          // Check for milestones
          const milestones = [10, 50, 100, 500, 1000];
          for (const milestone of milestones) {
            if (karma >= milestone && oldKarma < milestone) {
              toast({
                title: `🎉 ${milestone} Karma Milestone!`,
                description: `Your comment reached ${milestone} karma!`,
              });
            }
          }
        }
      })
      .subscribe();

    // Subscribe to awards
    const awardChannel = supabase
      .channel('debate_notifications_awards')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debate_awards_given',
        filter: `given_to=eq.${user.id}`
      }, async (payload: any) => {
        const { data: award } = await supabase
          .from('debate_awards')
          .select('name, icon')
          .eq('id', payload.new.award_id)
          .single();

        const { data: giver } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', payload.new.given_by)
          .single();

        if (award) {
          toast({
            title: `${award.icon} Award Received!`,
            description: `${giver?.username || 'Someone'} gave you "${award.name}"`,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(replyChannel);
      supabase.removeChannel(voteChannel);
      supabase.removeChannel(awardChannel);
    };
  }, [user, toast]);

  return null;
}
