import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useXFlow, useXFlowPosts, useXFlowComments, useXFlowFollow, XFlowPost, XFlowComment } from "@/hooks/useXFlow";
import { 
  ArrowLeft, Heart, MessageCircle, Send, Bookmark, 
  MoreHorizontal, VolumeX, Volume2, Download, Play, Pause 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

export default function XFlowPostView() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { currentProfile } = useXFlow();
  const { fetchPost, toggleLike, checkIfLiked } = useXFlowPosts();
  const { follow, unfollow, checkIfFollowing } = useXFlowFollow();
  
  const [post, setPost] = useState<XFlowPost | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { comments, addComment, isLoading: commentsLoading } = useXFlowComments(postId || '');

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    
    setIsLoading(true);
    const postData = await fetchPost(postId);
    
    if (postData) {
      setPost(postData);
      
      if (currentProfile) {
        const liked = await checkIfLiked(currentProfile.id, postId);
        setIsLiked(liked);
        
        if (postData.profile && postData.profile.id !== currentProfile.id) {
          const following = await checkIfFollowing(currentProfile.id, postData.profile.id);
          setIsFollowing(following);
        }
      }
    }
    
    setIsLoading(false);
  };

  const handleLike = async () => {
    if (!currentProfile || !post) return;
    
    const nowLiked = await toggleLike(currentProfile.id, post.id);
    setIsLiked(nowLiked);
    setPost(prev => prev ? { 
      ...prev, 
      likes_count: prev.likes_count + (nowLiked ? 1 : -1) 
    } : null);
  };

  const handleFollow = async () => {
    if (!currentProfile || !post?.profile) return;
    
    if (isFollowing) {
      await unfollow(currentProfile.id, post.profile.id);
      setIsFollowing(false);
    } else {
      await follow(currentProfile.id, post.profile.id);
      setIsFollowing(true);
    }
  };

  const handleComment = async () => {
    if (!currentProfile || !newComment.trim()) return;
    
    await addComment(currentProfile.id, newComment.trim());
    setNewComment("");
    setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
  };

  const handleDownload = async () => {
    if (!post?.media_urls?.[0]) return;
    
    try {
      const response = await fetch(post.media_urls[0]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xflow-${post.id}.${post.media_type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleShare = () => {
    if (!currentProfile) {
      toast.error('Login to share');
      return;
    }
    navigate('/xflow/messages');
    toast.info('Select a chat to share this post');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Post not found</h2>
          <Button onClick={() => navigate('/xflow')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const isVideo = post.media_type === 'video' || post.media_type === 'reel';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Media Section */}
      <div className="relative flex-1 flex items-center justify-center bg-black">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Download & Mute buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={handleDownload}
            className="p-2 rounded-full bg-black/50"
          >
            <Download className="h-5 w-5" />
          </button>
          {isVideo && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/50"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          )}
        </div>

        {post.media_urls && post.media_urls.length > 0 ? (
          isVideo ? (
            <div className="relative w-full max-w-[400px] aspect-[9/16]">
              <video
                ref={videoRef}
                src={post.media_urls[0]}
                className="w-full h-full object-cover"
                loop
                autoPlay
                muted={isMuted}
                playsInline
                onClick={togglePlayPause}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white/80" />
                </div>
              )}
            </div>
          ) : (
            <img 
              src={post.media_urls[0]} 
              alt="" 
              className="max-h-[90vh] max-w-full object-contain"
            />
          )
        ) : (
          <div className="p-8 max-w-lg text-center">
            <p className="text-xl">{post.content}</p>
          </div>
        )}

        {/* Action buttons on side (Instagram reels style) */}
        <div className="absolute right-4 bottom-20 md:hidden flex flex-col items-center gap-6">
          <button onClick={handleLike} className="flex flex-col items-center">
            <Heart className={`h-7 w-7 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-xs mt-1">{post.likes_count}</span>
          </button>
          
          <button className="flex flex-col items-center">
            <MessageCircle className="h-7 w-7" />
            <span className="text-xs mt-1">{post.comments_count}</span>
          </button>
          
          <button onClick={handleShare} className="flex flex-col items-center">
            <Send className="h-7 w-7" />
          </button>
          
          <button className="flex flex-col items-center">
            <Bookmark className="h-7 w-7" />
          </button>
        </div>

        {/* Profile info at bottom */}
        {post.profile && (
          <div className="absolute bottom-4 left-4 md:hidden flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer"
              onClick={() => navigate(`/xflow/${post.profile?.username}`)}
            >
              <AvatarImage src={post.profile.avatar_url || ''} />
              <AvatarFallback>{post.profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.profile.username}</p>
              {post.content && (
                <p className="text-sm text-white/70 line-clamp-2">{post.content}</p>
              )}
            </div>
            {currentProfile?.id !== post.profile.id && (
              <Button 
                size="sm" 
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Comments Section - Desktop */}
      <div className="hidden md:flex w-[400px] border-l border-white/10 flex-col">
        {/* Header */}
        {post.profile && (
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar 
                className="cursor-pointer"
                onClick={() => navigate(`/xflow/${post.profile?.username}`)}
              >
                <AvatarImage src={post.profile.avatar_url || ''} />
                <AvatarFallback>{post.profile.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{post.profile.username}</span>
            </div>
            <button>
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Comments */}
        <ScrollArea className="flex-1 p-4">
          {/* Original post caption */}
          {post.content && post.profile && (
            <div className="flex gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.profile.avatar_url || ''} />
                <AvatarFallback>{post.profile.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p>
                  <span className="font-semibold mr-2">{post.profile.username}</span>
                  {post.content}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {format(new Date(post.created_at), 'MMM d')}
                </p>
              </div>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-4 text-white/50">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2">No comments yet</h3>
                <p className="text-white/50">Start the conversation.</p>
              </div>
            ) : (
              <CommentList comments={comments} />
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={handleLike}>
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button>
              <MessageCircle className="h-6 w-6" />
            </button>
            <button onClick={handleShare}>
              <Send className="h-6 w-6" />
            </button>
            <button className="ml-auto">
              <Bookmark className="h-6 w-6" />
            </button>
          </div>
          
          <p className="font-semibold mb-1">{post.likes_count} likes</p>
          <p className="text-xs text-white/50 mb-3">
            {format(new Date(post.created_at), 'MMMM d, yyyy')}
          </p>

          {/* Comment input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 px-0"
            />
            {newComment.trim() && (
              <Button variant="ghost" size="sm" onClick={handleComment} className="text-primary">
                Post
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile comments sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <div className="md:hidden" />
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-zinc-900 border-white/10 h-[80vh] rounded-t-xl">
          <div className="p-4">
            <h3 className="text-center font-semibold mb-4">Comments</h3>
            <ScrollArea className="h-[calc(80vh-150px)]">
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-white/50">No comments yet</div>
                ) : (
                  <CommentList comments={comments} />
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2 mt-4">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/10 border-0"
              />
              <Button size="sm" onClick={handleComment}>Post</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CommentList({ comments }: { comments: XFlowComment[] }) {
  const navigate = useNavigate();
  
  return (
    <>
      {comments.map((comment) => (
        <motion.div 
          key={comment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <Avatar 
            className="h-8 w-8 cursor-pointer"
            onClick={() => navigate(`/xflow/${comment.profile?.username}`)}
          >
            <AvatarImage src={comment.profile?.avatar_url || ''} />
            <AvatarFallback>
              {comment.profile?.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p>
              <span className="font-semibold mr-2">{comment.profile?.username}</span>
              {comment.content}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
              <span>{format(new Date(comment.created_at), 'MMM d')}</span>
              <button>{comment.likes_count} likes</button>
              <button>Reply</button>
            </div>
            
            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-6 mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.profile?.avatar_url || ''} />
                      <AvatarFallback>{reply.profile?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold mr-2">{reply.profile?.username}</span>
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button>
            <Heart className="h-4 w-4 text-white/50" />
          </button>
        </motion.div>
      ))}
    </>
  );
}
