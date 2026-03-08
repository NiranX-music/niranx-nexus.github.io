import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, Flame, Dice5, ExternalLink, Star, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BGGItem {
  id: string;
  name: string;
  yearPublished?: string;
  type?: string;
  thumbnail?: string;
  image?: string;
  description?: string;
  minPlayers?: string;
  maxPlayers?: string;
  playingTime?: string;
  rating?: string;
  rank?: string;
}

const parseXML = (xml: string): Document => {
  return new DOMParser().parseFromString(xml, 'text/xml');
};

const XBoardGames = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<BGGItem[]>([]);
  const [hotItems, setHotItems] = useState<BGGItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHot, setLoadingHot] = useState(true);
  const [selected, setSelected] = useState<BGGItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { toast } = useToast();

  const fetchHotItems = useCallback(async () => {
    setLoadingHot(true);
    try {
      const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://boardgamegeek.com/xmlapi2/hot?type=boardgame'));
      const text = await res.text();
      const doc = parseXML(text);
      const items = Array.from(doc.querySelectorAll('item')).map(item => ({
        id: item.getAttribute('id') || '',
        name: item.querySelector('name')?.getAttribute('value') || '',
        yearPublished: item.querySelector('yearpublished')?.getAttribute('value') || '',
        thumbnail: item.querySelector('thumbnail')?.getAttribute('value') || '',
        rank: item.getAttribute('rank') || '',
      }));
      setHotItems(items);
    } catch {
      toast({ title: 'Failed to load hot items', variant: 'destructive' });
    } finally {
      setLoadingHot(false);
    }
  }, [toast]);

  useEffect(() => { fetchHotItems(); }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(searchQuery)}&type=boardgame`));
      const text = await res.text();
      const doc = parseXML(text);
      const items = Array.from(doc.querySelectorAll('item')).slice(0, 30).map(item => ({
        id: item.getAttribute('id') || '',
        name: item.querySelector('name')?.getAttribute('value') || '',
        yearPublished: item.querySelector('yearpublished')?.getAttribute('value') || '',
        type: item.getAttribute('type') || '',
      }));
      setResults(items);
      if (items.length === 0) toast({ title: 'No results found' });
    } catch {
      toast({ title: 'Search failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (item: BGGItem) => {
    setSelected(item);
    setDetailLoading(true);
    try {
      const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(`https://boardgamegeek.com/xmlapi2/thing?id=${item.id}&stats=1`));
      const text = await res.text();
      const doc = parseXML(text);
      const thing = doc.querySelector('item');
      if (thing) {
        const desc = thing.querySelector('description')?.textContent || '';
        setSelected({
          ...item,
          name: thing.querySelector('name[type="primary"]')?.getAttribute('value') || item.name,
          yearPublished: thing.querySelector('yearpublished')?.getAttribute('value') || item.yearPublished,
          thumbnail: thing.querySelector('thumbnail')?.textContent || item.thumbnail,
          image: thing.querySelector('image')?.textContent || '',
          description: desc.replace(/&#10;/g, '\n').replace(/<[^>]*>/g, ''),
          minPlayers: thing.querySelector('minplayers')?.getAttribute('value') || '',
          maxPlayers: thing.querySelector('maxplayers')?.getAttribute('value') || '',
          playingTime: thing.querySelector('playingtime')?.getAttribute('value') || '',
          rating: thing.querySelector('statistics ratings average')?.getAttribute('value') || '',
          rank: thing.querySelector('statistics ratings ranks rank[type="subtype"]')?.getAttribute('value') || '',
        });
      }
    } catch {
      toast({ title: 'Failed to load details', variant: 'destructive' });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-accent/8" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/60 backdrop-blur text-xs text-muted-foreground mb-3">
              <Dice5 className="w-3.5 h-3.5" /> BoardGameGeek API
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">XBoard</span>
              <span className="text-foreground"> Games</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              Explore the world's largest board game database — powered by BoardGameGeek
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search board games..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="hot">
          <TabsList>
            <TabsTrigger value="hot" className="gap-1"><Flame className="w-3.5 h-3.5" /> Hot Right Now</TabsTrigger>
            <TabsTrigger value="search" className="gap-1"><Search className="w-3.5 h-3.5" /> Search Results</TabsTrigger>
          </TabsList>

          {/* Hot Items */}
          <TabsContent value="hot">
            {loadingHot ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse"><CardContent className="pt-6 h-48" /></Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {hotItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card
                      className="overflow-hidden cursor-pointer group hover:shadow-lg hover:border-primary/40 transition-all"
                      onClick={() => fetchDetail(item)}
                    >
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dice5 className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 text-[10px]" variant="secondary">#{item.rank}</Badge>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">{item.name}</h3>
                        {item.yearPublished && (
                          <p className="text-xs text-muted-foreground mt-1">{item.yearPublished}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Search Results */}
          <TabsContent value="search">
            {results.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground mt-4">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Search for a board game above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <AnimatePresence>
                  {results.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card
                        className="cursor-pointer group hover:border-primary/40 transition-all"
                        onClick={() => fetchDetail(item)}
                      >
                        <CardContent className="pt-4 pb-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">{item.yearPublished || 'Unknown year'} · {item.type}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Dice5 className="w-5 h-5 text-primary" />
                  {selected.name}
                </DialogTitle>
              </DialogHeader>
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {selected.image && (
                    <div className="rounded-lg overflow-hidden bg-muted">
                      <img src={selected.image} alt={selected.name} className="w-full max-h-64 object-contain" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selected.yearPublished && <Badge variant="outline">{selected.yearPublished}</Badge>}
                    {selected.rating && parseFloat(selected.rating) > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3" /> {parseFloat(selected.rating).toFixed(1)}
                      </Badge>
                    )}
                    {selected.rank && selected.rank !== 'Not Ranked' && (
                      <Badge variant="secondary">Rank #{selected.rank}</Badge>
                    )}
                  </div>

                  {(selected.minPlayers || selected.playingTime) && (
                    <div className="grid grid-cols-2 gap-3">
                      {selected.minPlayers && (
                        <div className="rounded-md border bg-muted/30 p-3 text-center">
                          <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                          <p className="text-xs text-muted-foreground">Players</p>
                          <p className="text-sm font-semibold text-foreground">
                            {selected.minPlayers}{selected.maxPlayers && selected.maxPlayers !== selected.minPlayers ? `–${selected.maxPlayers}` : ''}
                          </p>
                        </div>
                      )}
                      {selected.playingTime && (
                        <div className="rounded-md border bg-muted/30 p-3 text-center">
                          <RefreshCw className="w-4 h-4 mx-auto mb-1 text-primary" />
                          <p className="text-xs text-muted-foreground">Play Time</p>
                          <p className="text-sm font-semibold text-foreground">{selected.playingTime} min</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selected.description && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Description</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-[12]">{selected.description}</p>
                    </div>
                  )}

                  <Button variant="outline" className="w-full gap-2" onClick={() => window.open(`https://boardgamegeek.com/boardgame/${selected.id}`, '_blank')}>
                    <ExternalLink className="w-4 h-4" /> View on BoardGameGeek
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default XBoardGames;
