import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useXFlow, useXFlowPosts, useXFlowFollow, XFlowProfile as ProfileType, XFlowPost } from "@/hooks/useXFlow";
import { 
  Grid3X3, Bookmark, Film, Settings, ArrowLeft, 
  MoreHorizontal, Link2, BadgeCheck, MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import XFlowEditProfile from "@/components/xflow/XFlowEditProfile";

export default function XFlowProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { currentProfile, getProfile, isAuthenticated, logout } = useXFlow();
  const { fetchUserPosts } = useXFlowPosts();
  const { follow, unfollow, checkIfFollowing } = useXFlowFollow();
  
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<XFlowPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = currentProfile?.username === username;

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;
    
    setIsLoading(true);
    const profileData = await getProfile(username);
    
    if (profileData) {
      setProfile(profileData);
      const userPosts = await fetchUserPosts(profileData.id);
      setPosts(userPosts);
      
      if (currentProfile && !isOwnProfile) {
        const following = await checkIfFollowing(currentProfile.id, profileData.id);
        setIsFollowing(following);
      }
    }
    
    setIsLoading(false);
  };

  const handleFollow = async () => {
    if (!currentProfile || !profile) return;
    
    if (isFollowing) {
      await unfollow(currentProfile.id, profile.id);
      setIsFollowing(false);
      setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count - 1 } : null);
    } else {
      await follow(currentProfile.id, profile.id);
      setIsFollowing(true);
      setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/xflow/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">User not found</h2>
          <p className="text-white/50 mb-4">This profile doesn't exist</p>
          <Button onClick={() => navigate('/xflow')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/xflow')}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-semibold flex items-center gap-1">
              {profile.username}
              {profile.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
            </h1>
          </div>
        </div>
        
        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetTrigger asChild>
            <button>
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-zinc-900 border-white/10 rounded-t-xl">
            <div className="space-y-1 py-4">
              {isOwnProfile && (
                <>
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditProfile(true);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 text-red-400"
                  >
                    Log out
                  </button>
                </>
              )}
              {!isOwnProfile && (
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 text-red-400">
                  Report
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Profile Info */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-6 mb-4">
          <Avatar className="h-20 w-20 md:h-36 md:w-36 ring-2 ring-primary/50">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-2xl md:text-4xl bg-gradient-to-br from-primary to-purple-600">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowEditProfile(true)}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    Edit profile
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={handleFollow}
                    className={isFollowing ? 'bg-white/10 hover:bg-white/20' : ''}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigate('/xflow/messages')}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-6 text-sm mb-4">
              <div>
                <span className="font-semibold">{profile.posts_count}</span>{' '}
                <span className="text-white/50">posts</span>
              </div>
              <div>
                <span className="font-semibold">{profile.followers_count}</span>{' '}
                <span className="text-white/50">followers</span>
              </div>
              <div>
                <span className="font-semibold">{profile.following_count}</span>{' '}
                <span className="text-white/50">following</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {profile.display_name && (
            <p className="font-semibold">{profile.display_name}</p>
          )}
          {profile.bio && (
            <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
          )}
          {profile.website && (
            <a 
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 flex items-center gap-1"
            >
              <Link2 className="h-3 w-3" />
              {profile.website}
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-transparent border-t border-white/10 rounded-none h-12 p-0">
          <TabsTrigger 
            value="posts" 
            className="flex-1 h-full rounded-none border-t-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
          >
            <Grid3X3 className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="reels" 
            className="flex-1 h-full rounded-none border-t-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
          >
            <Film className="h-5 w-5" />
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger 
              value="saved" 
              className="flex-1 h-full rounded-none border-t-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
            >
              <Bookmark className="h-5 w-5" />
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-white/30" />
              <h3 className="font-semibold mb-1">No posts yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-square relative group cursor-pointer"
                  onClick={() => navigate(`/xflow/post/${post.id}`)}
                >
                  {post.media_urls && post.media_urls.length > 0 ? (
                    post.media_type === 'video' ? (
                      <video 
                        src={post.media_urls[0]} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img 
                        src={post.media_urls[0]} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <p className="text-xs text-white/50 p-2 text-center line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  )}
                  
                  {post.is_pinned && (
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    </div>
                  )}
                  
                  {post.media_type === 'video' && (
                    <div className="absolute top-2 right-2">
                      <Film className="h-4 w-4" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <span className="flex items-center gap-1">
                      ❤️ {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {post.comments_count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reels" className="mt-0">
          <div className="py-16 text-center">
            <Film className="h-12 w-12 mx-auto mb-4 text-white/30" />
            <h3 className="font-semibold mb-1">No reels yet</h3>
          </div>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="saved" className="mt-0">
            <div className="py-16 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-white/30" />
              <h3 className="font-semibold mb-1">No saved posts</h3>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Profile Sheet */}
      <XFlowEditProfile 
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={profile}
        onProfileUpdated={() => {
          loadProfile();
          setShowEditProfile(false);
        }}
      />
    </div>
  );
}
