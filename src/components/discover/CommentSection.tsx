import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DiscoverComment } from "@/types/discover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Reply, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function buildTree(flat: DiscoverComment[]): DiscoverComment[] {
  const map = new Map<string, DiscoverComment>();
  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  const roots: DiscoverComment[] = [];
  map.forEach((c) => {
    if (c.parent_comment_id && map.has(c.parent_comment_id)) {
      map.get(c.parent_comment_id)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

function CommentItem({
  comment,
  pageId,
  onPosted,
  depth = 0,
}: {
  comment: DiscoverComment;
  pageId: string;
  onPosted: () => void;
  depth?: number;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);

  const canDelete = user?.id === comment.user_id;

  const submitReply = async () => {
    if (!user || !reply.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("discover_page_comments").insert({
      page_id: pageId,
      parent_comment_id: comment.id,
      user_id: user.id,
      username: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      avatar_url: user.user_metadata?.avatar_url || null,
      content: reply.trim(),
    });
    setPosting(false);
    if (error) {
      toast.error("Failed to post reply");
      return;
    }
    setReply("");
    setReplying(false);
    onPosted();
  };

  const remove = async () => {
    const { error } = await supabase.from("discover_page_comments").delete().eq("id", comment.id);
    if (error) toast.error("Delete failed");
    else onPosted();
  };

  return (
    <div className={depth > 0 ? "ml-8 mt-3 border-l-2 border-border/50 pl-4" : "mt-4"}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.avatar_url || undefined} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {(comment.username || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="font-semibold text-foreground">{comment.username || "User"}</span>
            <span>· {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-2 mt-2">
            {user && depth < 4 && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setReplying((r) => !r)}>
                <Reply className="h-3 w-3 mr-1" /> Reply
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" onClick={remove}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {replying && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="text-sm min-h-[60px] rounded-lg"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={submitReply} disabled={posting || !reply.trim()}>
                  {posting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Post
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((r) => (
        <CommentItem key={r.id} comment={r} pageId={pageId} onPosted={onPosted} depth={depth + 1} />
      ))}
    </div>
  );
}

export function CommentSection({ pageId }: { pageId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<DiscoverComment[]>([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("discover_page_comments")
      .select("*")
      .eq("page_id", pageId)
      .order("created_at", { ascending: true });
    setComments((data as DiscoverComment[]) || []);
  };

  useEffect(() => {
    load();
  }, [pageId]);

  const post = async () => {
    if (!user || !content.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("discover_page_comments").insert({
      page_id: pageId,
      user_id: user.id,
      username: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      avatar_url: user.user_metadata?.avatar_url || null,
      content: content.trim(),
    });
    setPosting(false);
    if (error) {
      toast.error("Failed to post comment");
      return;
    }
    setContent("");
    load();
  };

  const tree = buildTree(comments);

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Discussion <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
      </h2>
      {user ? (
        <div className="mb-6 space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[90px] rounded-xl resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={post} disabled={posting || !content.trim()}>
              {posting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6 p-4 rounded-xl bg-muted/30 border border-border">
          Sign in to join the discussion.
        </p>
      )}
      <div className="space-y-1">
        {tree.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
        ) : (
          tree.map((c) => <CommentItem key={c.id} comment={c} pageId={pageId} onPosted={load} />)
        )}
      </div>
    </section>
  );
}
