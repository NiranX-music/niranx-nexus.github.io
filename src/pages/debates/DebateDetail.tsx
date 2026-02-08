import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VoteButtons } from "@/components/debates/VoteButtons";
import { CommentTree } from "@/components/debates/CommentTree";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Bookmark, Bell, Share2, Eye, MessageSquare, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function DebateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [debate, setDebate] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [forComments, setForComments] = useState<any[]>([]);
  const [againstComments, setAgainstComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newCommentStance, setNewCommentStance] = useState<'for' | 'against' | 'neutral'>('neutral');
  const [userStance, setUserStance] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("best");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (id) {
      loadDebate();
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
  }, [id]);

  useEffect(() => {
    if (debate) {
      loadComments();
      loadUserStance();
    }
  }, [debate, sortBy]);

  const incrementViewCount = async () => {
    if (id) {
      try {
        const { data } = await supabase
          .from('debate_topics')
          .select('view_count')
          .eq('id', id)
          .single();
        
        if (data) {
          await supabase
            .from('debate_topics')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', id);
        }
      } catch (err) {
        console.error('Error incrementing view count:', err);
      }
    }
  };

  const loadDebate = async () => {
    try {
      // Fetch debate topic without joins to avoid foreign key issues
      const { data: debateData, error: debateError } = await supabase
        .from('debate_topics')
        .select('*')
        .eq('id', id)
        .single();

      if (debateError) {
        console.error('Error loading debate:', debateError);
        toast({ title: "Error loading debate", description: debateError.message, variant: "destructive" });
        navigate('/debates');
        return;
      }

      setDebate(debateData);

      // Fetch profile separately
      if (debateData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', debateData.user_id)
          .maybeSingle();
        setProfile(profileData);
      }

      // Fetch category separately
      if (debateData.category_id) {
        const { data: categoryData } = await supabase
          .from('debate_categories')
          .select('name, color, icon')
          .eq('id', debateData.category_id)
          .maybeSingle();
        setCategory(categoryData);
      }
    } catch (err: any) {
      console.error('Unexpected error loading debate:', err);
      toast({ title: "Error loading debate", variant: "destructive" });
      navigate('/debates');
    }
    setLoading(false);
  };

  const loadComments = async () => {
    let query = supabase
      .from('debate_comments')
      .select('*')
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

    const { data, error } = await query;
    
    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    // Fetch profiles for all comments
    const commentsWithProfiles = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: commentProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', comment.user_id)
          .maybeSingle();
        return { ...comment, profiles: commentProfile };
      })
    );

    setComments(commentsWithProfiles);
    setForComments(commentsWithProfiles.filter(c => c.stance === 'for'));
    setAgainstComments(commentsWithProfiles.filter(c => c.stance === 'against'));
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading debate...</p>
        </div>
      </div>
    );
  }

  if (!debate) return null;

  const stanceTotal = (debate.stance_for_count || 0) + (debate.stance_against_count || 0) + (debate.stance_neutral_count || 0);
  const forPercent = stanceTotal > 0 ? (debate.stance_for_count / stanceTotal * 100) : 0;
  const againstPercent = stanceTotal > 0 ? (debate.stance_against_count / stanceTotal * 100) : 0;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6">
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
            upvotes={debate.upvotes || 0}
            downvotes={debate.downvotes || 0}
          />
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{debate.title}</h1>
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                  </Avatar>
                  <span>{profile?.username || 'Anonymous'}</span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}</span>
                {category && (
                  <Badge style={{ backgroundColor: category.color }}>
                    {category.name}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {debate.view_count || 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {debate.comment_count || 0}
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

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
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
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button
            variant={userStance === 'for' ? 'default' : 'outline'}
            onClick={() => handleSetStance('for')}
            className={cn(
              "flex-1 gap-2",
              userStance === 'for' && "bg-green-600 hover:bg-green-700"
            )}
          >
            <ThumbsUp className="w-4 h-4" />
            For
          </Button>
          <Button
            variant={userStance === 'against' ? 'default' : 'outline'}
            onClick={() => handleSetStance('against')}
            className={cn(
              "flex-1 gap-2",
              userStance === 'against' && "bg-red-600 hover:bg-red-700"
            )}
          >
            <ThumbsDown className="w-4 h-4" />
            Against
          </Button>
          <Button
            variant={userStance === 'neutral' ? 'default' : 'outline'}
            onClick={() => handleSetStance('neutral')}
            className={cn(
              "flex-1 gap-2",
              userStance === 'neutral' && "bg-gray-600 hover:bg-gray-700"
            )}
          >
            <Minus className="w-4 h-4" />
            Neutral
          </Button>
        </div>

        {stanceTotal > 0 && (
          <div className="space-y-2">
            <div className="flex gap-1 h-4 rounded-full overflow-hidden">
              <div className="bg-green-500 transition-all" style={{ width: `${forPercent}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${againstPercent}%` }} />
              <div className="bg-gray-400 transition-all" style={{ width: `${100 - forPercent - againstPercent}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">{debate.stance_for_count || 0} For ({forPercent.toFixed(0)}%)</span>
              <span className="text-red-600 font-medium">{debate.stance_against_count || 0} Against ({againstPercent.toFixed(0)}%)</span>
              <span className="text-muted-foreground">{debate.stance_neutral_count || 0} Neutral</span>
            </div>
          </div>
        )}
      </Card>

      {/* Comment Input */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Add your argument</h3>
        <div className="space-y-4">
          <Textarea
            placeholder="Share your thoughts and arguments..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your stance:</span>
              <Select value={newCommentStance} onValueChange={(v: any) => setNewCommentStance(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for">
                    <span className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-500" /> For
                    </span>
                  </SelectItem>
                  <SelectItem value="against">
                    <span className="flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-red-500" /> Against
                    </span>
                  </SelectItem>
                  <SelectItem value="neutral">
                    <span className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-gray-500" /> Neutral
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              Post Argument
            </Button>
          </div>
        </div>
      </Card>

      {/* Comments Section with Tabs */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-semibold text-lg">{debate.comment_count || 0} Arguments</h3>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              All ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="for" className="gap-2">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              For ({forComments.length})
            </TabsTrigger>
            <TabsTrigger value="against" className="gap-2">
              <ThumbsDown className="w-4 h-4 text-red-500" />
              Against ({againstComments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No arguments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map(comment => (
                <CommentTree key={comment.id} comment={comment} debateId={id!} />
              ))
            )}
          </TabsContent>

          <TabsContent value="for" className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5" />
                Arguments For
              </h4>
              <p className="text-sm text-muted-foreground">
                These arguments support the debate topic
              </p>
            </div>
            {forComments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No supporting arguments yet.
              </p>
            ) : (
              forComments.map(comment => (
                <CommentTree key={comment.id} comment={comment} debateId={id!} />
              ))
            )}
          </TabsContent>

          <TabsContent value="against" className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-600 flex items-center gap-2">
                <ThumbsDown className="w-5 h-5" />
                Arguments Against (Counterviews)
              </h4>
              <p className="text-sm text-muted-foreground">
                These arguments oppose the debate topic
              </p>
            </div>
            {againstComments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No opposing arguments yet.
              </p>
            ) : (
              againstComments.map(comment => (
                <CommentTree key={comment.id} comment={comment} debateId={id!} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
