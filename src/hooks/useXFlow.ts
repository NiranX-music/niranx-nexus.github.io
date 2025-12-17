import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface XFlowProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  gender: string | null;
  is_private: boolean;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
}

export interface XFlowPost {
  id: string;
  profile_id: string;
  content: string | null;
  media_urls: string[];
  media_type: string;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  created_at: string;
  profile?: XFlowProfile;
}

export interface XFlowComment {
  id: string;
  post_id: string;
  profile_id: string;
  parent_comment_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  profile?: XFlowProfile;
  replies?: XFlowComment[];
}

export function useXFlow() {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState<XFlowProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProfile = localStorage.getItem('xflow_current_profile');
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setCurrentProfile(parsed);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('xflow_profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();
    
    return !data && error?.code === 'PGRST116';
  };

  const createProfile = async (
    username: string,
    password: string,
    displayName?: string,
    bio?: string
  ): Promise<XFlowProfile | null> => {
    if (!user) {
      toast.error('You must be logged in to create an XFlow profile');
      return null;
    }

    const isAvailable = await checkUsernameAvailable(username);
    if (!isAvailable) {
      toast.error('Username is already taken');
      return null;
    }

    const passwordHash = btoa(password);

    const { data, error } = await supabase
      .from('xflow_profiles')
      .insert({
        user_id: user.id,
        username: username.toLowerCase(),
        display_name: displayName || username,
        bio,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create profile');
      console.error(error);
      return null;
    }

    setCurrentProfile(data);
    setIsAuthenticated(true);
    localStorage.setItem('xflow_current_profile', JSON.stringify(data));
    toast.success('XFlow profile created!');
    return data;
  };

  const loginToProfile = async (username: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('xflow_profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !data) {
      toast.error('Profile not found');
      return false;
    }

    const passwordHash = btoa(password);
    if (data.password_hash !== passwordHash) {
      toast.error('Incorrect password');
      return false;
    }

    setCurrentProfile(data);
    setIsAuthenticated(true);
    localStorage.setItem('xflow_current_profile', JSON.stringify(data));
    toast.success(`Welcome back, @${data.username}!`);
    return true;
  };

  const logout = () => {
    setCurrentProfile(null);
    setIsAuthenticated(false);
    localStorage.removeItem('xflow_current_profile');
  };

  const getProfile = async (username: string): Promise<XFlowProfile | null> => {
    const { data, error } = await supabase
      .from('xflow_profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error) return null;
    return data;
  };

  const updateProfile = async (updates: Partial<XFlowProfile>): Promise<boolean> => {
    if (!currentProfile) return false;

    const { error } = await supabase
      .from('xflow_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', currentProfile.id);

    if (error) {
      toast.error('Failed to update profile');
      return false;
    }

    const updated = { ...currentProfile, ...updates };
    setCurrentProfile(updated);
    localStorage.setItem('xflow_current_profile', JSON.stringify(updated));
    toast.success('Profile updated');
    return true;
  };

  const getUserProfiles = async (): Promise<XFlowProfile[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('xflow_profiles')
      .select('*')
      .eq('user_id', user.id);

    if (error) return [];
    return data || [];
  };

  return {
    currentProfile,
    isAuthenticated,
    isLoading,
    checkUsernameAvailable,
    createProfile,
    loginToProfile,
    logout,
    getProfile,
    updateProfile,
    getUserProfiles
  };
}

const parseMediaUrls = (mediaUrls: any): string[] => {
  if (Array.isArray(mediaUrls)) {
    return mediaUrls.map(url => String(url));
  }
  return [];
};

export function useXFlowPosts() {
  const fetchFeed = async (limit = 20): Promise<XFlowPost[]> => {
    const { data, error } = await supabase
      .from('xflow_posts')
      .select(`*, profile:xflow_profiles(*)`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching feed:', error);
      return [];
    }

    return (data || []).map(post => ({
      ...post,
      media_urls: parseMediaUrls(post.media_urls)
    }));
  };

  const fetchUserPosts = async (profileId: string): Promise<XFlowPost[]> => {
    const { data, error } = await supabase
      .from('xflow_posts')
      .select(`*, profile:xflow_profiles(*)`)
      .eq('profile_id', profileId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(post => ({
      ...post,
      media_urls: parseMediaUrls(post.media_urls)
    }));
  };

  const fetchPost = async (postId: string): Promise<XFlowPost | null> => {
    const { data, error } = await supabase
      .from('xflow_posts')
      .select(`*, profile:xflow_profiles(*)`)
      .eq('id', postId)
      .single();

    if (error) return null;
    return {
      ...data,
      media_urls: parseMediaUrls(data.media_urls)
    };
  };

  const createPost = async (
    profileId: string,
    content: string,
    mediaUrls: string[],
    mediaType: string
  ): Promise<XFlowPost | null> => {
    const { data, error } = await supabase
      .from('xflow_posts')
      .insert({
        profile_id: profileId,
        content,
        media_urls: mediaUrls,
        media_type: mediaType
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create post');
      return null;
    }

    // Update posts count
    await supabase
      .from('xflow_profiles')
      .update({ posts_count: supabase.rpc as any })
      .eq('id', profileId);

    toast.success('Post created!');
    return { ...data, media_urls: parseMediaUrls(data.media_urls) };
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('xflow_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      toast.error('Failed to delete post');
      return false;
    }

    toast.success('Post deleted');
    return true;
  };

  const toggleLike = async (profileId: string, postId: string): Promise<boolean> => {
    const { data: existing } = await supabase
      .from('xflow_likes')
      .select('id')
      .eq('profile_id', profileId)
      .eq('post_id', postId)
      .single();

    if (existing) {
      await supabase.from('xflow_likes').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('xflow_likes').insert({ profile_id: profileId, post_id: postId });
      return true;
    }
  };

  const checkIfLiked = async (profileId: string, postId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('xflow_likes')
      .select('id')
      .eq('profile_id', profileId)
      .eq('post_id', postId)
      .single();

    return !!data;
  };

  return {
    fetchFeed,
    fetchUserPosts,
    fetchPost,
    createPost,
    deletePost,
    toggleLike,
    checkIfLiked
  };
}

export function useXFlowComments(postId: string) {
  const [comments, setComments] = useState<XFlowComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('xflow_comments')
      .select(`*, profile:xflow_profiles(*)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const commentMap = new Map<string, XFlowComment>();
      const rootComments: XFlowComment[] = [];

      data.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      data.forEach(comment => {
        const mappedComment = commentMap.get(comment.id)!;
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) parent.replies?.push(mappedComment);
        } else {
          rootComments.push(mappedComment);
        }
      });

      setComments(rootComments);
    }
    setIsLoading(false);
  };

  const addComment = async (profileId: string, content: string, parentCommentId?: string): Promise<boolean> => {
    const { error } = await supabase
      .from('xflow_comments')
      .insert({ post_id: postId, profile_id: profileId, content, parent_comment_id: parentCommentId });

    if (error) {
      toast.error('Failed to add comment');
      return false;
    }
    fetchComments();
    return true;
  };

  return { comments, isLoading, addComment, refetch: fetchComments };
}

export function useXFlowFollow() {
  const follow = async (followerId: string, followingId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('xflow_follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      toast.error('Failed to follow');
      return false;
    }
    return true;
  };

  const unfollow = async (followerId: string, followingId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('xflow_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      toast.error('Failed to unfollow');
      return false;
    }
    return true;
  };

  const checkIfFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('xflow_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    return !!data;
  };

  return { follow, unfollow, checkIfFollowing };
}

export function useXFlowMessages(profileId?: string) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchConversations = async (myProfileId: string) => {
    const { data } = await supabase
      .from('xflow_messages')
      .select(`*, sender:xflow_profiles!sender_id(*), receiver:xflow_profiles!receiver_id(*)`)
      .or(`sender_id.eq.${myProfileId},receiver_id.eq.${myProfileId}`)
      .order('created_at', { ascending: false });

    const convMap = new Map();
    data?.forEach(msg => {
      const partnerId = msg.sender_id === myProfileId ? msg.receiver_id : msg.sender_id;
      const partner = msg.sender_id === myProfileId ? msg.receiver : msg.sender;
      if (!convMap.has(partnerId)) convMap.set(partnerId, { partner, lastMessage: msg });
    });

    setConversations(Array.from(convMap.values()));
  };

  const fetchMessages = async (myProfileId: string, otherProfileId: string) => {
    const { data } = await supabase
      .from('xflow_messages')
      .select(`*, sender:xflow_profiles!sender_id(*)`)
      .or(`and(sender_id.eq.${myProfileId},receiver_id.eq.${otherProfileId}),and(sender_id.eq.${otherProfileId},receiver_id.eq.${myProfileId})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async (senderId: string, receiverId: string, content: string): Promise<boolean> => {
    const { error } = await supabase
      .from('xflow_messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, content });
    if (error) {
      toast.error('Failed to send message');
      return false;
    }
    return true;
  };

  return { conversations, messages, fetchConversations, fetchMessages, sendMessage };
}
