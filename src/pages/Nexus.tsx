import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExternalLink, Music, Play, Pause, Volume2, VolumeX, ChevronDown, X, Home, Sparkles, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface NexusLink {
  id: string;
  category_id: string | null;
  name: string;
  url: string;
  description: string | null;
  image_url: string | null;
  tile_color: string | null;
  effect_type: string | null;
  special_comment: string | null;
  comment_color: string | null;
}

interface NexusSettings {
  background_url?: string;
  background_type?: string;
  background_music_url?: string;
}

export default function Nexus() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<NexusLink[]>([]);
  const [settings, setSettings] = useState<NexusSettings>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [catsRes, linksRes, settingsRes] = await Promise.all([
        supabase.from('nexus_categories').select('*').order('display_order'),
        supabase.from('nexus_links').select('*').order('display_order'),
        supabase.from('nexus_settings').select('*'),
      ]);

      if (catsRes.data) {
        setCategories(catsRes.data);
        if (catsRes.data.length > 0) {
          setSelectedCategory(catsRes.data[0].id);
        }
      }
      if (linksRes.data) setLinks(linksRes.data);
      if (settingsRes.data) {
        const s: NexusSettings = {};
        settingsRes.data.forEach((item) => {
          s[item.setting_key as keyof NexusSettings] = item.setting_value || undefined;
        });
        setSettings(s);
      }
      setIsLoading(false);
    };
    fetchData();

    const timer = setTimeout(() => setShowWelcome(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <Icons.Folder className="w-5 h-5" />;
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Icons.Folder className="w-5 h-5" />;
  };

  const filteredLinks = selectedCategory
    ? links.filter((l) => l.category_id === selectedCategory)
    : links;

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {settings.background_type === 'video' && settings.background_url ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src={settings.background_url} type="video/mp4" />
          </video>
        ) : settings.background_url ? (
          <img
            src={settings.background_url}
            alt="Background"
            className="w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0a0f] via-[#0f1a2a] to-[#0a0a0f]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/50" />
      </div>

      {/* Welcome Transition */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-[#0a0a0f] flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold font-[Orbitron] mb-4"
              >
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Welcome to Nexus
                </span>
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 text-lg"
              >
                Your gateway to everything NiranX
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="w-48 h-1 mx-auto mt-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 w-64 h-screen bg-[#0d0d14]/95 backdrop-blur-xl border-r border-cyan-900/30 z-40 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-cyan-900/30">
                <h2 className="text-lg font-bold font-[Orbitron] text-cyan-400">Nexus</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Categories */}
              <ScrollArea className="flex-1 p-3">
                <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 transition-all group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="font-medium text-sm">
                          {selectedCategoryData?.name || 'Select Category'}
                        </span>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        categoryOpen && "rotate-180"
                      )} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all',
                          selectedCategory === cat.id
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {getIcon(cat.icon)}
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}>
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-[#0d0d14]/80 backdrop-blur-xl border-b border-cyan-900/30">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Icons.Menu className="w-5 h-5" />
                  </Button>
                )}
                <h1 className="text-xl font-bold font-[Orbitron] text-white">
                  {selectedCategoryData?.name || 'NiranX Portals'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {settings.background_music_url && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </>
                )}
                <Link to="/songs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Explore Music
                  </Button>
                </Link>
                <Link to="/app-library">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    User Apps
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-white/10 hover:border-gray-400"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Portal Cards Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredLinks.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', damping: 20 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative rounded-xl overflow-hidden bg-[#12121a] border border-cyan-900/20 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {link.image_url ? (
                      <img
                        src={link.image_url}
                        alt={link.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div 
                        className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center"
                        style={{ background: link.tile_color || undefined }}
                      >
                        <Icons.Link className="w-10 h-10 text-cyan-400/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
                    
                    {/* External Link Icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {link.name}
                    </h3>
                    {link.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                    {link.special_comment && (
                      <p
                        className="text-xs mt-2 font-medium"
                        style={{ color: link.comment_color || '#22d3ee' }}
                      >
                        {link.special_comment}
                      </p>
                    )}
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
                  </div>
                </motion.a>
              ))}
            </motion.div>

            {filteredLinks.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Music className="w-10 h-10 text-cyan-400/50" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No portals yet</h3>
                <p className="text-gray-400">Check back later for updates.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Audio Player */}
      {settings.background_music_url && (
        <audio
          ref={(el) => {
            if (el) {
              el.muted = isMuted;
              if (isPlaying) el.play();
              else el.pause();
            }
          }}
          src={settings.background_music_url}
          loop
        />
      )}
    </div>
  );
}
