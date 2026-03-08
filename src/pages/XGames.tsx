import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Search, Maximize2, X, Star, TrendingUp, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface GameItem {
  title: string;
  description: string;
  thumb: string;
  url: string;
  category: string;
  tags?: string[];
}

const FEATURED_GAMES: GameItem[] = [
  { title: 'Temple Run 2', description: 'Run, slide, jump and turn to avoid obstacles', thumb: 'https://img.gamedistribution.com/ed65e4198fe74fdbb0b2ac015dd81128-512x384.jpeg', url: 'https://html5.gamedistribution.com/ed65e4198fe74fdbb0b2ac015dd81128/', category: 'Action' },
  { title: 'Subway Surfers', description: 'Dash through the subway and dodge oncoming trains', thumb: 'https://img.gamedistribution.com/4f3045e1c4cc4f0e9adc4e4e56b0e68c-512x384.jpeg', url: 'https://html5.gamedistribution.com/4f3045e1c4cc4f0e9adc4e4e56b0e68c/', category: 'Action' },
  { title: 'Stickman Hook', description: 'Swing through each level like a stickman ninja', thumb: 'https://img.gamedistribution.com/c6dd381c6bd84cd2aab3fb8b41188e58-512x384.jpeg', url: 'https://html5.gamedistribution.com/c6dd381c6bd84cd2aab3fb8b41188e58/', category: 'Action' },
  { title: 'Moto X3M', description: 'Ride your bike through awesome tracks with insane stunts', thumb: 'https://img.gamedistribution.com/64417b0549d04aec8e8a6810bfb1f714-512x384.jpeg', url: 'https://html5.gamedistribution.com/64417b0549d04aec8e8a6810bfb1f714/', category: 'Racing' },
  { title: 'Tunnel Rush', description: 'Dodge obstacles in a colorful 3D tunnel', thumb: 'https://img.gamedistribution.com/2bff4234fa5d4213a8d52e51f8d26830-512x384.jpeg', url: 'https://html5.gamedistribution.com/2bff4234fa5d4213a8d52e51f8d26830/', category: 'Action' },
  { title: 'Snake.io', description: 'Grow your snake and dominate the arena', thumb: 'https://img.gamedistribution.com/ba8f47b59ffb4373835e3ad7eed94f62-512x384.jpeg', url: 'https://html5.gamedistribution.com/ba8f47b59ffb4373835e3ad7eed94f62/', category: 'Arcade' },
  { title: 'Basketball Stars', description: 'Show off your basketball skills in 1v1 matches', thumb: 'https://img.gamedistribution.com/220d783a3e974f55b32b0e0a3acf498a-512x384.jpeg', url: 'https://html5.gamedistribution.com/220d783a3e974f55b32b0e0a3acf498a/', category: 'Sports' },
  { title: 'Cut the Rope', description: 'Cut the rope to feed candy to the little monster', thumb: 'https://img.gamedistribution.com/1ab3ca2b430742e0a3c5616e498a0252-512x384.jpeg', url: 'https://html5.gamedistribution.com/1ab3ca2b430742e0a3c5616e498a0252/', category: 'Puzzle' },
  { title: 'Shell Shockers', description: 'Online egg-based multiplayer shooter', thumb: 'https://img.gamedistribution.com/f09c6b45db7d4acfa7ade4e72c0bba5d-512x384.jpeg', url: 'https://html5.gamedistribution.com/f09c6b45db7d4acfa7ade4e72c0bba5d/', category: 'Shooter' },
  { title: 'Venge.io', description: 'Fast-paced multiplayer FPS in your browser', thumb: 'https://img.gamedistribution.com/46872f59f39a4a0690a0c6e3b6ccdb71-512x384.jpeg', url: 'https://html5.gamedistribution.com/46872f59f39a4a0690a0c6e3b6ccdb71/', category: 'Shooter' },
  { title: '2048', description: 'Join the numbers and get to the 2048 tile', thumb: 'https://img.gamedistribution.com/b6b65354e76e459d97b427db5a3bce15-512x384.jpeg', url: 'https://html5.gamedistribution.com/b6b65354e76e459d97b427db5a3bce15/', category: 'Puzzle' },
  { title: 'Geometry Dash', description: 'Jump and fly through danger in this rhythm game', thumb: 'https://img.gamedistribution.com/eec2b4afe1474ef98ed2e6f13efad738-512x384.jpeg', url: 'https://html5.gamedistribution.com/eec2b4afe1474ef98ed2e6f13efad738/', category: 'Action' },
];

const CATEGORIES = ['All', 'Action', 'Puzzle', 'Racing', 'Sports', 'Arcade', 'Shooter'];

const XGames = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const { toast } = useToast();

  const filteredGames = FEATURED_GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayGame = useCallback((game: GameItem) => {
    setActiveGame(game);
    toast({ title: `Loading ${game.title}`, description: 'Game is loading in iframe...' });
  }, [toast]);

  const handleCustomEmbed = () => {
    if (!customUrl.trim()) return;
    let url = customUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    setActiveGame({ title: 'Custom Game', description: '', thumb: '', url, category: 'Custom' });
    toast({ title: 'Loading Custom Game' });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center justify-center gap-3">
            <Gamepad2 className="w-10 h-10 text-primary" />
            XGames
            <Badge variant="secondary" className="text-xs font-medium">by NiranX</Badge>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Play hundreds of free HTML5 games powered by GameDistribution — right in your browser
          </p>
        </motion.div>

        {/* Active Game Player */}
        <AnimatePresence>
          {activeGame && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                      {activeGame.title}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setFullscreen(true)} className="gap-1">
                        <Maximize2 className="w-4 h-4" /> Fullscreen
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(activeGame.url, '_blank')} className="gap-1">
                        <ExternalLink className="w-4 h-4" /> New Tab
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setActiveGame(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full aspect-video border-t rounded-b-lg overflow-hidden bg-muted">
                    <iframe
                      src={activeGame.url}
                      className="w-full h-full border-0"
                      title={activeGame.title}
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Dialog */}
        <Dialog open={fullscreen} onOpenChange={setFullscreen}>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                {activeGame?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 h-full pb-4 px-4">
              {activeGame && (
                <iframe
                  src={activeGame.url}
                  className="w-full h-full rounded-lg border-0"
                  title={activeGame.title}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  allowFullScreen
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom URL Embed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Embed Custom Game
            </CardTitle>
            <CardDescription>Paste a GameDistribution URL or any HTML5 game URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://html5.gamedistribution.com/..."
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomEmbed()}
                className="flex-1"
              />
              <Button onClick={handleCustomEmbed} className="gap-2">
                <Gamepad2 className="w-4 h-4" /> Play
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Featured Games
            <Badge variant="outline">{filteredGames.length}</Badge>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredGames.map((game, i) => (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all hover:border-primary/40"
                  onClick={() => handlePlayGame(game)}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    <img
                      src={game.thumb}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/512x384/1a1a2e/e0e0e0?text=${encodeURIComponent(game.title)}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <Button size="sm" className="w-full gap-2">
                        <Gamepad2 className="w-4 h-4" /> Play Now
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">
                      {game.category}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm text-foreground truncate">{game.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{game.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No games found</p>
              <p className="text-sm">Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default XGames;
