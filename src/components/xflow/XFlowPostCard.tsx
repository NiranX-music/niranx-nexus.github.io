import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { XFlowPost, XFlowProfile, useXFlowPosts } from "@/hooks/useXFlow";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

interface XFlowPostCardProps {
  post: XFlowPost;
  currentProfile: XFlowProfile;
  onRefresh: () => void;
}

export default function XFlowPostCard({ post, currentProfile, onRefresh }: XFlowPostCardProps) {
  const navigate = useNavigate();
  const { toggleLike, checkIfLiked } = useXFlowPosts();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  useState(() => {
    checkIfLiked(currentProfile.id, post.id).then(setIsLiked);
  });

  const handleLike = async () => {
    const nowLiked = await toggleLike(currentProfile.id, post.id);
    setIsLiked(nowLiked);
    setLikesCount(prev => prev + (nowLiked ? 1 : -1));
  };

  return (
    <div className="border-b border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/xflow/${post.profile?.username}`)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.profile?.avatar_url || ''} />
            <AvatarFallback>{post.profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{post.profile?.username}</span>
        </div>
        <button><MoreHorizontal className="h-5 w-5" /></button>
      </div>

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div 
          className="aspect-square bg-black cursor-pointer"
          onClick={() => navigate(`/xflow/post/${post.id}`)}
        >
          {post.media_type === 'video' ? (
            <video src={post.media_urls[0]} className="w-full h-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={handleLike}>
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button onClick={() => navigate(`/xflow/post/${post.id}`)}>
            <MessageCircle className="h-6 w-6" />
          </button>
          <button><Send className="h-6 w-6" /></button>
          <button className="ml-auto"><Bookmark className="h-6 w-6" /></button>
        </div>

        <p className="font-semibold text-sm mb-1">{likesCount} likes</p>

        {post.content && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{post.profile?.username}</span>
            {post.content}
          </p>
        )}

        {post.comments_count > 0 && (
          <button 
            className="text-sm text-white/50 mt-1"
            onClick={() => navigate(`/xflow/post/${post.id}`)}
          >
            View all {post.comments_count} comments
          </button>
        )}

        <p className="text-xs text-white/40 mt-1 uppercase">
          {format(new Date(post.created_at), 'MMMM d')}
        </p>
      </div>
    </div>
  );
}
