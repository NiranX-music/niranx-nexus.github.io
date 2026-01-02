import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ExternalLink, Menu, X, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/niranx/GlassCard';
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
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [audioRef] = useState<HTMLAudioElement | null>(null);

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

    // Hide welcome after 2s
    const timer = setTimeout(() => setShowWelcome(false), 2000);
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

  const getEffectClass = (effect: string | null) => {
    switch (effect) {
      case 'opaque':
        return 'bg-card';
      case 'transparent':
        return 'bg-transparent border-transparent';
      default:
        return 'bg-card/30 backdrop-blur-xl';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {settings.background_type === 'video' && settings.background_url ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={settings.background_url} type="video/mp4" />
          </video>
        ) : (
          <img
            src={settings.background_url || 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920'}
            alt="Background"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />
      </div>

      {/* Welcome Transition */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold font-[Orbitron] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to Nexus
              </h1>
              <p className="text-muted-foreground mt-4">Your gateway to everything</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/30 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold font-[Orbitron]">Nexus Portal</h1>
          <div className="flex items-center gap-2">
            {settings.background_music_url && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 pt-16 flex min-h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed md:sticky top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-card/30 backdrop-blur-xl border-r border-border/30 z-30"
            >
              <ScrollArea className="h-full p-4">
                <h2 className="text-sm font-semibold text-muted-foreground mb-4">Categories</h2>
                <nav className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                        selectedCategory === cat.id
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {getIcon(cat.icon)}
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={cn('flex-1 p-4 md:p-8', sidebarOpen && 'md:ml-0')}>
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {filteredLinks.map((link, i) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={cn(
                  'block rounded-2xl border border-border/30 overflow-hidden group',
                  getEffectClass(link.effect_type)
                )}
                style={{
                  background: link.tile_color || undefined,
                }}
              >
                {link.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={link.image_url}
                      alt={link.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">{link.name}</h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {link.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{link.description}</p>
                  )}
                  {link.special_comment && (
                    <p
                      className="text-xs mt-2 font-medium"
                      style={{ color: link.comment_color || 'hsl(var(--primary))' }}
                    >
                      {link.special_comment}
                    </p>
                  )}
                </div>
              </motion.a>
            ))}
          </motion.div>

          {filteredLinks.length === 0 && (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No links yet</h3>
              <p className="text-muted-foreground">Check back later for updates.</p>
            </div>
          )}
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
