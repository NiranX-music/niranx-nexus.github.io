import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useXFlow, useXFlowPosts, XFlowPost } from "@/hooks/useXFlow";
import { 
  Home, Search, Compass, Film, MessageCircle, Heart, 
  PlusSquare, User, Menu, Settings, Bookmark, Activity,
  LogOut, Moon, Sun
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import XFlowPostCard from "@/components/xflow/XFlowPostCard";
import XFlowCreatePost from "@/components/xflow/XFlowCreatePost";
import XFlowStories from "@/components/xflow/XFlowStories";

export default function XFlowFeed() {
  const navigate = useNavigate();
  const { currentProfile, isAuthenticated, logout, isLoading: profileLoading } = useXFlow();
  const { fetchFeed } = useXFlowPosts();
  
  const [posts, setPosts] = useState<XFlowPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!profileLoading && !isAuthenticated) {
      navigate('/xflow/login');
    }
  }, [profileLoading, isAuthenticated, navigate]);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setIsLoading(true);
    const feedPosts = await fetchFeed(50);
    setPosts(feedPosts);
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/xflow/login');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentProfile) return null;

  const sidebarItems = [
    { icon: Home, label: 'Home', onClick: () => navigate('/xflow') },
    { icon: Search, label: 'Search', onClick: () => {} },
    { icon: Compass, label: 'Explore', onClick: () => {} },
    { icon: Film, label: 'Reels', onClick: () => {} },
    { icon: MessageCircle, label: 'Messages', onClick: () => navigate('/xflow/messages') },
    { icon: Heart, label: 'Notifications', onClick: () => {} },
    { icon: PlusSquare, label: 'Create', onClick: () => setShowCreatePost(true) },
    { icon: User, label: 'Profile', onClick: () => navigate(`/xflow/${currentProfile.username}`) },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[245px] border-r border-white/10 p-3 fixed h-screen">
        <div className="py-6 px-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            XFlow
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <Sheet open={showMenu} onOpenChange={setShowMenu}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/10 transition-colors">
              <Menu className="h-6 w-6" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-zinc-900 border-white/10 w-[270px]">
            <div className="space-y-1 mt-8">
              <button className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/10">
                <Settings className="h-6 w-6" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/10">
                <Activity className="h-6 w-6" />
                <span>Your activity</span>
              </button>
              <button className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/10">
                <Bookmark className="h-6 w-6" />
                <span>Saved</span>
              </button>
              <button className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/10">
                <Moon className="h-6 w-6" />
                <span>Switch appearance</span>
              </button>
              <hr className="border-white/10 my-2" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/10 text-red-400"
              >
                <LogOut className="h-6 w-6" />
                <span>Log out</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[245px]">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">XFlow</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowCreatePost(true)}>
              <PlusSquare className="h-6 w-6" />
            </button>
            <button onClick={() => navigate('/xflow/messages')}>
              <MessageCircle className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Feed */}
        <div className="max-w-[470px] mx-auto py-4">
          {/* Stories */}
          <div className="mb-4 border-b border-border/20 pb-4">
            <XFlowStories />
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="h-4 w-32 bg-white/10 rounded" />
                  </div>
                  <div className="aspect-square bg-white/10" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="h-16 w-16 mx-auto mb-4 text-white/30" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-white/50 mb-4">Be the first to share something!</p>
              <Button onClick={() => setShowCreatePost(true)}>
                Create Post
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <XFlowPostCard 
                    post={post} 
                    currentProfile={currentProfile}
                    onRefresh={loadFeed}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-6 py-2 flex items-center justify-between">
          <button onClick={() => navigate('/xflow')}>
            <Home className="h-6 w-6" />
          </button>
          <button>
            <Search className="h-6 w-6" />
          </button>
          <button onClick={() => setShowCreatePost(true)}>
            <PlusSquare className="h-6 w-6" />
          </button>
          <button>
            <Film className="h-6 w-6" />
          </button>
          <button onClick={() => navigate(`/xflow/${currentProfile.username}`)}>
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentProfile.avatar_url || ''} />
              <AvatarFallback className="text-xs">
                {currentProfile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </nav>
      </main>

      {/* Create Post Modal */}
      <XFlowCreatePost 
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        currentProfile={currentProfile}
        onPostCreated={loadFeed}
      />
    </div>
  );
}
