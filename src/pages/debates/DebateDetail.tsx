import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoteButtons } from "@/components/debates/VoteButtons";
import { CommentTree } from "@/components/debates/CommentTree";
import { ArrowLeft, Bookmark, Bell, Share2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DebateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [debate, setDebate] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newCommentStance, setNewCommentStance] = useState<'for' | 'against' | 'neutral'>('neutral');
  const [userStance, setUserStance] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("best");

  useEffect(() => {
    if (id) {
      loadDebate();
      loadComments();
      loadUserStance();
      incrementViewCount();

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`debate_${id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'debate_comments', filter: `debate_id=eq.${id}` }, () => {
          loadComments();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'debate_topics', filter: `id=eq.${id}` }, () => {
          loadDebate();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, sortBy]);

  const incrementViewCount = async () => {
    if (id) {
      await supabase
        .from('debate_topics')
        .update({ view_count: (debate?.view_count || 0) + 1 })
        .eq('id', id);
    }
  };

  const loadDebate = async () => {
    const { data, error } = await supabase
      .from('debate_topics')
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        debate_categories (name, color, icon)
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast({ title: "Error loading debate", variant: "destructive" });
      navigate('/debates');
    } else {
      setDebate(data);
    }
    setLoading(false);
  };

  const loadComments = async () => {
    let query = supabase
      .from('debate_comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq('debate_id', id)
      .is('parent_comment_id', null);

    switch (sortBy) {
      case 'best':
        query = query.order('upvotes', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('upvotes', { ascending: false });
        break;
    }

    const { data } = await query;
    if (data) setComments(data);
  };

  const loadUserStance = async () => {
    if (!user || !id) return;
    
    const { data } = await supabase
      .from('debate_user_stances')
      .select('stance')
      .eq('user_id', user.id)
      .eq('debate_id', id)
      .maybeSingle();
    
    if (data) setUserStance(data.stance);
  };

  const handleSetStance = async (stance: 'for' | 'against' | 'neutral') => {
    if (!user) {
      toast({ title: "Please log in to set your stance", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('debate_user_stances')
      .upsert({
        user_id: user.id,
        debate_id: id!,
        stance
      });

    if (!error) {
      setUserStance(stance);
      toast({ title: "Stance updated!" });
      loadDebate();
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({ title: "Please log in to comment", variant: "destructive" });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('debate_comments')
      .insert({
        debate_id: id!,
        user_id: user.id,
        content: newComment,
        stance: newCommentStance
      });

    if (error) {
      toast({ title: "Error posting comment", variant: "destructive" });
    } else {
      setNewComment("");
      setNewCommentStance('neutral');
      toast({ title: "Comment posted!" });
      loadComments();
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!debate) return null;

  const stanceTotal = (debate.stance_for_count || 0) + (debate.stance_against_count || 0) + (debate.stance_neutral_count || 0);
  const forPercent = stanceTotal > 0 ? (debate.stance_for_count / stanceTotal * 100) : 0;
  const againstPercent = stanceTotal > 0 ? (debate.stance_against_count / stanceTotal * 100) : 0;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/debates')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Debates
      </Button>

      {/* Debate Header */}
      <Card className="p-6">
        <div className="flex gap-4">
          <VoteButtons
            targetId={debate.id}
            targetType="topic"
            upvotes={debate.upvotes}
            downvotes={debate.downvotes}
          />
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{debate.title}</h1>
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <span>by {debate.profiles?.username || 'Anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}</span>
                {debate.debate_categories && (
                  <Badge style={{ backgroundColor: debate.debate_categories.color }}>
                    {debate.debate_categories.name}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {debate.view_count}
                </div>
              </div>
            </div>

            <p className="text-base whitespace-pre-wrap">{debate.description}</p>

            {debate.tags && debate.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {debate.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stance Selector */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">What's your stance?</h3>
        <div className="flex gap-2 mb-4">
          <Button
            variant={userStance === 'for' ? 'default' : 'outline'}
            onClick={() => handleSetStance('for')}
            className="flex-1"
          >
            👍 For
          </Button>
          <Button
            variant={userStance === 'against' ? 'default' : 'outline'}
            onClick={() => handleSetStance('against')}
            className="flex-1"
          >
            👎 Against
          </Button>
          <Button
            variant={userStance === 'neutral' ? 'default' : 'outline'}
            onClick={() => handleSetStance('neutral')}
            className="flex-1"
          >
            😐 Neutral
          </Button>
        </div>

        {stanceTotal > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2 h-3 rounded-full overflow-hidden">
              <div className="bg-green-500" style={{ width: `${forPercent}%` }} />
              <div className="bg-red-500" style={{ width: `${againstPercent}%` }} />
              <div className="bg-gray-400" style={{ width: `${100 - forPercent - againstPercent}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">{debate.stance_for_count} For ({forPercent.toFixed(0)}%)</span>
              <span className="text-red-600">{debate.stance_against_count} Against ({againstPercent.toFixed(0)}%)</span>
              <span>{debate.stance_neutral_count} Neutral</span>
            </div>
          </div>
        )}
      </Card>

      {/* Comment Input */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Add your argument</h3>
        <div className="space-y-4">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
          />
          <div className="flex justify-between items-center">
            <Select value={newCommentStance} onValueChange={(v: any) => setNewCommentStance(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="for">👍 For</SelectItem>
                <SelectItem value="against">👎 Against</SelectItem>
                <SelectItem value="neutral">😐 Neutral</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSubmitComment}>Post Comment</Button>
          </div>
        </div>
      </Card>

      {/* Comments */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{debate.comment_count || 0} Comments</h3>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best">Best</SelectItem>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="top">Top</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {comments.map(comment => (
            <CommentTree key={comment.id} comment={comment} debateId={id!} />
          ))}
        </div>
      </Card>
    </div>
  );
}