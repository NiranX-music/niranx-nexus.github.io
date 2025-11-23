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
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
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

  useEffect(() => {
    if (!collapsed && depth < 5) {
      loadReplies();
    }
  }, [collapsed, comment.id]);

  const loadReplies = async () => {
    setLoadingReplies(true);
    const { data } = await supabase
      .from('debate_comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('parent_comment_id', comment.id)
      .order('upvotes', { ascending: false });
    
    if (data) setReplies(data);
    setLoadingReplies(false);
  };

  const handleReply = async () => {
    if (!user) {
      toast({ title: "Please log in to reply", variant: "destructive" });
      return;
    }

    if (!replyText.trim()) return;

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
  };

  const stanceBadgeColor = {
    for: 'bg-green-500',
    against: 'bg-red-500',
    neutral: 'bg-gray-400'
  };

  const stanceIcon = {
    for: '👍',
    against: '👎',
    neutral: '😐'
  };

  return (
    <div className={cn("space-y-2", depth > 0 && "ml-8 border-l-2 border-border pl-4")}>
      <Card className="p-4">
        <div className="flex gap-3">
          <VoteButtons
            targetId={comment.id}
            targetType="comment"
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
          />

          <div className="flex-1 space-y-2">
            {/* Author Info */}
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="w-6 h-6">
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback>{comment.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{comment.profiles?.username || 'Anonymous'}</span>
              <Badge 
                variant="outline" 
                className={cn("text-xs", stanceBadgeColor[comment.stance as keyof typeof stanceBadgeColor])}
              >
                {stanceIcon[comment.stance as keyof typeof stanceIcon]} {comment.stance}
              </Badge>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              )}
            </div>

            {/* Comment Content */}
            {!collapsed && (
              <>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

                {comment.ai_argument_score && (
                  <Badge variant="outline" className="text-xs">
                    🧠 Argument Score: {comment.ai_argument_score}/100
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReply(!showReply)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Reply Input */}
                {showReply && (
                  <div className="space-y-2 mt-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowReply(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleReply}>
                        Post Reply
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {collapsed && (
              <Button variant="ghost" size="sm" onClick={() => setCollapsed(false)}>
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
    </div>
  );
}