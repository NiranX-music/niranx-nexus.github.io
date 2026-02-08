import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButtons } from "./VoteButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface CommentTreeProps {
  comment: any;
  debateId: string;
  depth?: number;
}

export function CommentTree({ comment, debateId, depth = 0 }: CommentTreeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!collapsed && depth < 5) {
      loadReplies();
    }
  }, [collapsed, comment.id]);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('debate_comments')
        .select('*')
        .eq('parent_comment_id', comment.id)
        .order('upvotes', { ascending: false });
      
      if (error) {
        console.error('Error loading replies:', error);
        return;
      }

      // Fetch profiles for replies
      const repliesWithProfiles = await Promise.all(
        (data || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', reply.user_id)
            .maybeSingle();
          return { ...reply, profiles: profile };
        })
      );

      setReplies(repliesWithProfiles);
    } catch (err) {
      console.error('Error loading replies:', err);
    }
    setLoadingReplies(false);
  };

  const handleReply = async () => {
    if (!user) {
      toast({ title: "Please log in to reply", variant: "destructive" });
      return;
    }

    if (!replyText.trim()) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('debate_comments')
      .insert({
        debate_id: debateId,
        parent_comment_id: comment.id,
        user_id: user.id,
        content: replyText,
        depth_level: depth + 1,
        stance: comment.stance
      });

    if (error) {
      toast({ title: "Error posting reply", variant: "destructive" });
    } else {
      setReplyText("");
      setShowReply(false);
      toast({ title: "Reply posted!" });
      loadReplies();
    }
    setSubmitting(false);
  };

  const stanceConfig = {
    for: { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'For' },
    against: { icon: ThumbsDown, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Against' },
    neutral: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'Neutral' }
  };

  const stance = stanceConfig[comment.stance as keyof typeof stanceConfig] || stanceConfig.neutral;
  const StanceIcon = stance.icon;

  return (
    <div className={cn("space-y-2", depth > 0 && "ml-4 md:ml-8 border-l-2 border-border pl-4")}>
      <Card className={cn("p-4", stance.bg, stance.border)}>
        <div className="flex gap-3">
          <VoteButtons
            targetId={comment.id}
            targetType="comment"
            upvotes={comment.upvotes || 0}
            downvotes={comment.downvotes || 0}
          />

          <div className="flex-1 space-y-2 min-w-0">
            {/* Author Info */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{comment.profiles?.username || 'Anonymous'}</span>
              <Badge variant="outline" className={cn("text-xs gap-1", stance.color)}>
                <StanceIcon className="w-3 h-3" />
                {stance.label}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              )}
            </div>

            {/* Comment Content */}
            {!collapsed && (
              <>
                <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>

                {comment.ai_argument_score && (
                  <Badge variant="outline" className="text-xs">
                    🧠 Argument Score: {comment.ai_argument_score}/100
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReply(!showReply)}
                    className="h-8 text-xs"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  {replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCollapsed(!collapsed)}
                      className="h-8 text-xs"
                    >
                      {collapsed ? (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Show {replies.length} replies
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Hide replies
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Reply Input */}
                {showReply && (
                  <div className="space-y-2 mt-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowReply(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleReply} disabled={submitting || !replyText.trim()}>
                        {submitting ? "Posting..." : "Post Reply"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {collapsed && replies.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCollapsed(false)} className="text-xs">
                [+] Show {replies.length} replies
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Nested Replies */}
      {!collapsed && replies.length > 0 && (
        <div className="space-y-2">
          {replies.map(reply => (
            <CommentTree key={reply.id} comment={reply} debateId={debateId} depth={depth + 1} />
          ))}
        </div>
      )}

      {loadingReplies && depth < 5 && (
        <div className="text-xs text-muted-foreground pl-4">Loading replies...</div>
      )}
    </div>
  );
}