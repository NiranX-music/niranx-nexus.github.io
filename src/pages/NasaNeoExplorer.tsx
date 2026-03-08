import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, ExternalLink, Orbit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = 'DEMO_KEY';
const BASE = 'https://api.nasa.gov';

interface NeoObject {
  id: string;
  name: string;
  name_limited?: string;
  designation: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  orbital_data?: {
    orbit_class?: { orbit_class_type: string; orbit_class_description: string };
    orbital_period?: string;
    perihelion_distance?: string;
    aphelion_distance?: string;
    eccentricity?: string;
    inclination?: string;
    first_observation_date?: string;
    last_observation_date?: string;
  };
  close_approach_data?: {
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string; lunar: string };
    orbiting_body: string;
  }[];
}

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

const NasaNeoExplorer = () => {
  const [neos, setNeos] = useState<NeoObject[]>([]);
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNeo, setSelectedNeo] = useState<NeoObject | null>(null);
  const [filter, setFilter] = useState<'all' | 'hazardous' | 'safe'>('all');
  const { toast } = useToast();

  const fetchNeos = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/neo/rest/v1/neo/browse?page=${p}&size=20&api_key=${API_KEY}`);
      const json = await res.json();
      setNeos(json.near_earth_objects || []);
      setTotalPages(json.page?.total_pages || 0);
      setPage(json.page?.number || 0);
    } catch {
      toast({ title: 'Error', description: 'Failed to load asteroid data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchApod = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/planetary/apod?api_key=${API_KEY}`);
      const json = await res.json();
      setApod(json);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNeos(0);
    fetchApod();
  }, []);

  const filtered = neos.filter(n => {
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.designation.toLowerCase().includes(search.toLowerCase());
    if (filter === 'hazardous') return matchSearch && n.is_potentially_hazardous_asteroid;
    if (filter === 'safe') return matchSearch && !n.is_potentially_hazardous_asteroid;
    return matchSearch;
  });

  const hazCount = neos.filter(n => n.is_potentially_hazardous_asteroid).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card/50 backdrop-blur text-xs font-medium text-muted-foreground mb-2">
              <Orbit className="w-3.5 h-3.5" /> Powered by NASA Open API
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                NASA NEO
              </span>
              <br />
              <span className="text-foreground text-3xl md:text-4xl font-bold">Near-Earth Object Explorer</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              Browse thousands of asteroids tracked by NASA's Jet Propulsion Laboratory. Real data, real science.
            </p>
            <div className="flex items-center justify-center gap-6 pt-2">
              <Stat label="Loaded" value={neos.length} />
              <Stat label="Hazardous" value={hazCount} danger />
              <Stat label="Page" value={`${page + 1}/${totalPages}`} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* APOD */}
        {apod && apod.media_type === 'image' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="aspect-video md:aspect-auto overflow-hidden">
                  <img src={apod.url} alt={apod.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <Badge variant="outline" className="w-fit mb-2 text-xs">Astronomy Picture of the Day</Badge>
                  <h2 className="text-xl font-bold text-foreground mb-2">{apod.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-3">{apod.explanation}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{apod.date}</span>
                    {apod.copyright && <span>© {apod.copyright}</span>}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or designation..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {(['all', 'hazardous', 'safe'] as const).map(f => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">
                {f === 'hazardous' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                {f}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => fetchNeos(page)} className="gap-1">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-40" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((neo, i) => (
                <motion.div
                  key={neo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={`cursor-pointer group transition-all hover:shadow-lg ${
                      neo.is_potentially_hazardous_asteroid ? 'border-destructive/40 hover:border-destructive' : 'hover:border-primary/40'
                    }`}
                    onClick={() => setSelectedNeo(neo)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                          {neo.name}
                        </CardTitle>
                        {neo.is_potentially_hazardous_asteroid && (
                          <Badge variant="destructive" className="text-[10px] shrink-0">⚠ Hazardous</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">{neo.designation}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md border bg-muted/50 p-2">
                          <span className="text-muted-foreground block">Diameter</span>
                          <span className="font-semibold text-foreground">
                            {neo.estimated_diameter.meters.estimated_diameter_min.toFixed(0)}–{neo.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m
                          </span>
                        </div>
                        <div className="rounded-md border bg-muted/50 p-2">
                          <span className="text-muted-foreground block">Magnitude</span>
                          <span className="font-semibold text-foreground">{neo.absolute_magnitude_h.toFixed(2)}</span>
                        </div>
                      </div>
                      {neo.close_approach_data && neo.close_approach_data.length > 0 && (
                        <div className="text-[11px] text-muted-foreground">
                          Last approach: {neo.close_approach_data[0].close_approach_date}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <Orbit className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No asteroids found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => fetchNeos(page - 1)} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => fetchNeos(page + 1)} className="gap-1">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedNeo} onOpenChange={() => setSelectedNeo(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedNeo && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Orbit className="w-5 h-5 text-primary" />
                  {selectedNeo.name}
                  {selectedNeo.is_potentially_hazardous_asteroid && (
                    <Badge variant="destructive" className="text-[10px]">⚠ Hazardous</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Section title="Physical Properties">
                  <Row label="Designation" value={selectedNeo.designation} />
                  <Row label="Abs. Magnitude" value={selectedNeo.absolute_magnitude_h.toFixed(2)} />
                  <Row label="Diameter (m)" value={`${selectedNeo.estimated_diameter.meters.estimated_diameter_min.toFixed(0)} – ${selectedNeo.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}`} />
                  <Row label="Diameter (km)" value={`${selectedNeo.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} – ${selectedNeo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}`} />
                </Section>

                {selectedNeo.orbital_data && (
                  <Section title="Orbital Data">
                    {selectedNeo.orbital_data.orbit_class && (
                      <>
                        <Row label="Class" value={selectedNeo.orbital_data.orbit_class.orbit_class_type} />
                        <p className="text-xs text-muted-foreground">{selectedNeo.orbital_data.orbit_class.orbit_class_description}</p>
                      </>
                    )}
                    {selectedNeo.orbital_data.orbital_period && <Row label="Orbital Period" value={`${parseFloat(selectedNeo.orbital_data.orbital_period).toFixed(2)} days`} />}
                    {selectedNeo.orbital_data.eccentricity && <Row label="Eccentricity" value={parseFloat(selectedNeo.orbital_data.eccentricity).toFixed(6)} />}
                    {selectedNeo.orbital_data.inclination && <Row label="Inclination" value={`${parseFloat(selectedNeo.orbital_data.inclination).toFixed(4)}°`} />}
                    {selectedNeo.orbital_data.first_observation_date && <Row label="First Observed" value={selectedNeo.orbital_data.first_observation_date} />}
                    {selectedNeo.orbital_data.last_observation_date && <Row label="Last Observed" value={selectedNeo.orbital_data.last_observation_date} />}
                  </Section>
                )}

                {selectedNeo.close_approach_data && selectedNeo.close_approach_data.length > 0 && (
                  <Section title={`Close Approaches (${selectedNeo.close_approach_data.length})`}>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {selectedNeo.close_approach_data.slice(0, 10).map((ca, i) => (
                        <div key={i} className="rounded-md border bg-muted/30 p-2 text-xs space-y-0.5">
                          <div className="flex justify-between">
                            <span className="font-medium text-foreground">{ca.close_approach_date}</span>
                            <Badge variant="outline" className="text-[10px]">{ca.orbiting_body}</Badge>
                          </div>
                          <div className="text-muted-foreground">
                            {parseFloat(ca.relative_velocity.kilometers_per_hour).toFixed(0)} km/h · {parseFloat(ca.miss_distance.lunar).toFixed(2)} lunar dist.
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                <Button variant="outline" className="w-full gap-2" onClick={() => window.open(selectedNeo.nasa_jpl_url, '_blank')}>
                  <ExternalLink className="w-4 h-4" /> View on NASA JPL
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Stat = ({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) => (
  <div className="text-center">
    <div className={`text-2xl font-black ${danger ? 'text-destructive' : 'text-foreground'}`}>{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default NasaNeoExplorer;
