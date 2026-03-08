import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search, Loader2, Sparkles, ExternalLink, Heart, Layers, Filter,
  ChevronLeft, ChevronRight, Wand2
} from "lucide-react";
import { toast } from "sonner";

interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  set_name?: string;
  rarity?: string;
  image_uris?: { normal?: string; large?: string; art_crop?: string; png?: string };
  card_faces?: { name: string; image_uris?: { normal?: string; large?: string } }[];
  prices?: { usd?: string; usd_foil?: string; eur?: string };
  legalities?: Record<string, string>;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: string[];
  color_identity?: string[];
  scryfall_uri?: string;
  artist?: string;
  collector_number?: string;
}

const rarityColors: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-slate-400/20 text-slate-600 dark:text-slate-300",
  rare: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  mythic: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
};

const colorIcons: Record<string, string> = {
  W: "☀️", U: "💧", B: "💀", R: "🔥", G: "🌿",
};

export default function ScryfallSearch() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [sortBy, setSortBy] = useState("name");
  const [colorFilter, setColorFilter] = useState("any");

  const searchCards = useCallback(async (url?: string) => {
    if (!url && !query.trim()) {
      toast.error("Enter a card name or search query");
      return;
    }

    setLoading(true);
    try {
      let searchUrl = url;
      if (!searchUrl) {
        const params = new URLSearchParams({
          q: colorFilter !== "any" ? `${query} c:${colorFilter}` : query,
          order: sortBy,
        });
        searchUrl = `https://api.scryfall.com/cards/search?${params}`;
      }

      const res = await fetch(searchUrl);
      if (!res.ok) {
        if (res.status === 404) {
          setCards([]);
          setTotalCards(0);
          toast.error("No cards found");
          return;
        }
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      if (url) {
        setCards(prev => [...prev, ...data.data]);
      } else {
        setCards(data.data || []);
      }
      setTotalCards(data.total_cards || 0);
      setHasMore(data.has_more || false);
      setNextPage(data.next_page || null);
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, sortBy, colorFilter]);

  const getRandomCard = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.scryfall.com/cards/random");
      const data = await res.json();
      setSelectedCard(data);
    } catch {
      toast.error("Failed to get random card");
    } finally {
      setLoading(false);
    }
  };

  const getCardImage = (card: ScryfallCard) => {
    if (card.image_uris?.normal) return card.image_uris.normal;
    if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
    return null;
  };

  const getCardLargeImage = (card: ScryfallCard) => {
    if (card.image_uris?.large) return card.image_uris.large;
    if (card.card_faces?.[0]?.image_uris?.large) return card.card_faces[0].image_uris.large;
    return getCardImage(card);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
          <Wand2 className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Scryfall MTG Search</h1>
          <p className="text-muted-foreground mt-1">Search Magic: The Gathering cards using the Scryfall API</p>
        </div>
        <Button variant="outline" onClick={getRandomCard} disabled={loading} className="gap-2">
          <Sparkles className="h-4 w-4" /> Random Card
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder='Search cards... (e.g., "Lightning Bolt", "t:creature c:red")'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchCards()}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Color</SelectItem>
                  <SelectItem value="w">☀️ White</SelectItem>
                  <SelectItem value="u">💧 Blue</SelectItem>
                  <SelectItem value="b">💀 Black</SelectItem>
                  <SelectItem value="r">🔥 Red</SelectItem>
                  <SelectItem value="g">🌿 Green</SelectItem>
                  <SelectItem value="c">◇ Colorless</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="rarity">Rarity</SelectItem>
                  <SelectItem value="usd">Price</SelectItem>
                  <SelectItem value="edhrec">EDHREC</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => searchCards()} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {totalCards > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {totalCards.toLocaleString()} cards
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {cards.length === 0 && !loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium">Search for Magic: The Gathering cards</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use Scryfall syntax like <code className="bg-muted px-1 rounded">t:creature c:red pow&gt;=4</code>
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {cards.map((card, i) => {
                const img = getCardImage(card);
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    className="cursor-pointer group"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-muted aspect-[2.5/3.5]">
                      {img ? (
                        <img
                          src={img}
                          alt={card.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3 text-center">
                          <div>
                            <p className="font-medium text-sm">{card.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{card.type_line}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium mt-1.5 truncate">{card.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {card.rarity && (
                        <Badge variant="outline" className={`text-[9px] px-1 ${rarityColors[card.rarity] || ""}`}>
                          {card.rarity}
                        </Badge>
                      )}
                      {card.prices?.usd && (
                        <span className="text-[10px] text-muted-foreground">${card.prices.usd}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {hasMore && nextPage && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => searchCards(nextPage)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      {/* Card Detail Dialog */}
      <Dialog open={!!selectedCard} onOpenChange={open => !open && setSelectedCard(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedCard.name}</DialogTitle>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  {(() => {
                    const img = getCardLargeImage(selectedCard);
                    return img ? (
                      <img src={img} alt={selectedCard.name} className="w-full rounded-xl shadow-lg" />
                    ) : (
                      <div className="aspect-[2.5/3.5] bg-muted rounded-xl flex items-center justify-center">
                        <p className="text-muted-foreground">No image</p>
                      </div>
                    );
                  })()}
                  {selectedCard.card_faces && selectedCard.card_faces.length > 1 && selectedCard.card_faces[1]?.image_uris?.large && (
                    <img
                      src={selectedCard.card_faces[1].image_uris.large}
                      alt={`${selectedCard.name} (back)`}
                      className="w-full rounded-xl shadow-lg mt-3"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  {selectedCard.mana_cost && (
                    <div>
                      <p className="text-xs text-muted-foreground">Mana Cost</p>
                      <p className="font-mono">{selectedCard.mana_cost}</p>
                    </div>
                  )}
                  {selectedCard.type_line && (
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium">{selectedCard.type_line}</p>
                    </div>
                  )}
                  {selectedCard.oracle_text && (
                    <div>
                      <p className="text-xs text-muted-foreground">Oracle Text</p>
                      <p className="text-sm whitespace-pre-line">{selectedCard.oracle_text}</p>
                    </div>
                  )}
                  {(selectedCard.power || selectedCard.toughness) && (
                    <div>
                      <p className="text-xs text-muted-foreground">P/T</p>
                      <p className="font-bold">{selectedCard.power}/{selectedCard.toughness}</p>
                    </div>
                  )}
                  {selectedCard.loyalty && (
                    <div>
                      <p className="text-xs text-muted-foreground">Loyalty</p>
                      <p className="font-bold">{selectedCard.loyalty}</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {selectedCard.colors?.map(c => (
                      <Badge key={c} variant="secondary">{colorIcons[c] || c} {c}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCard.set_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">Set</p>
                        <p className="text-sm">{selectedCard.set_name}</p>
                      </div>
                    )}
                    {selectedCard.rarity && (
                      <div>
                        <p className="text-xs text-muted-foreground">Rarity</p>
                        <Badge className={rarityColors[selectedCard.rarity] || ""}>{selectedCard.rarity}</Badge>
                      </div>
                    )}
                    {selectedCard.artist && (
                      <div>
                        <p className="text-xs text-muted-foreground">Artist</p>
                        <p className="text-sm">{selectedCard.artist}</p>
                      </div>
                    )}
                    {selectedCard.collector_number && (
                      <div>
                        <p className="text-xs text-muted-foreground">Collector #</p>
                        <p className="text-sm font-mono">{selectedCard.collector_number}</p>
                      </div>
                    )}
                  </div>
                  {selectedCard.prices && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Prices</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedCard.prices.usd && <Badge variant="outline">${selectedCard.prices.usd} USD</Badge>}
                        {selectedCard.prices.usd_foil && <Badge variant="outline">${selectedCard.prices.usd_foil} Foil</Badge>}
                        {selectedCard.prices.eur && <Badge variant="outline">€{selectedCard.prices.eur} EUR</Badge>}
                      </div>
                    </div>
                  )}
                  {selectedCard.scryfall_uri && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={selectedCard.scryfall_uri} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" /> View on Scryfall
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
