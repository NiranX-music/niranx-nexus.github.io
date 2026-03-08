import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Rocket, Search, Loader2, RefreshCw, ExternalLink, Calendar, MapPin,
  CheckCircle, XCircle, Clock, Globe, Satellite, ArrowUp, ArrowDown,
  ChevronRight, Info, Play, Flame, Target, Navigation
} from "lucide-react";

const API_BASE = "https://api.spacexdata.com/v4";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Launch {
  id: string;
  name: string;
  date_utc: string;
  date_local: string;
  success: boolean | null;
  upcoming: boolean;
  details: string | null;
  flight_number: number;
  rocket: string;
  links: {
    patch: { small: string | null; large: string | null };
    webcast: string | null;
    article: string | null;
    wikipedia: string | null;
    flickr: { original: string[] };
  };
  failures: { time: number; altitude: number | null; reason: string }[];
  cores: { core: string; flight: number; reused: boolean; landing_success: boolean | null; landing_type: string | null }[];
}

interface RocketInfo {
  id: string;
  name: string;
  type: string;
  active: boolean;
  stages: number;
  boosters: number;
  cost_per_launch: number;
  success_rate_pct: number;
  first_flight: string;
  country: string;
  company: string;
  height: { meters: number };
  diameter: { meters: number };
  mass: { kg: number };
  description: string;
  flickr_images: string[];
  wikipedia: string;
  engines: { number: number; type: string; version: string; propellant_1: string; propellant_2: string; thrust_sea_level: { kN: number } };
}

interface Capsule {
  id: string;
  serial: string;
  status: string;
  type: string;
  reuse_count: number;
  water_landings: number;
  land_landings: number;
  last_update: string | null;
  launches: string[];
}

interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  status: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
  launch_attempts: number;
  launch_successes: number;
  details: string;
  images: { large: string[] };
}

interface StarlinkSat {
  id: string;
  version: string;
  launch: string;
  longitude: number | null;
  latitude: number | null;
  height_km: number | null;
  velocity_kms: number | null;
  spaceTrack: {
    OBJECT_NAME: string;
    CREATION_DATE: string;
    DECAY_DATE: string | null;
  };
}

interface CompanyInfo {
  name: string;
  founder: string;
  founded: number;
  employees: number;
  vehicles: number;
  launch_sites: number;
  test_sites: number;
  ceo: string;
  cto: string;
  coo: string;
  valuation: number;
  summary: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpaceXDashboard() {
  const [activeTab, setActiveTab] = useState("launches");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Data
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [rockets, setRockets] = useState<RocketInfo[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [launchpads, setLaunchpads] = useState<Launchpad[]>([]);
  const [starlink, setStarlink] = useState<StarlinkSat[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [nextLaunch, setNextLaunch] = useState<Launch | null>(null);
  const [latestLaunch, setLatestLaunch] = useState<Launch | null>(null);

  // Detail dialogs
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [selectedRocket, setSelectedRocket] = useState<RocketInfo | null>(null);

  // Auto-refresh
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (endpoint: string) => {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [launchData, rocketData, capsuleData, padData, companyData, nextData, latestData] = await Promise.all([
        fetchData("launches"),
        fetchData("rockets"),
        fetchData("capsules"),
        fetchData("launchpads"),
        fetchData("company"),
        fetchData("launches/next"),
        fetchData("launches/latest"),
      ]);

      setLaunches(launchData.sort((a: Launch, b: Launch) => new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime()));
      setRockets(rocketData);
      setCapsules(capsuleData);
      setLaunchpads(padData);
      setCompany(companyData);
      setNextLaunch(nextData);
      setLatestLaunch(latestData);
      setLastUpdated(new Date());
    } catch (err: any) {
      toast.error("Failed to load SpaceX data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const loadStarlink = useCallback(async () => {
    try {
      const data = await fetchData("starlink");
      setStarlink(data.slice(0, 200)); // Limit for performance
    } catch {
      toast.error("Failed to load Starlink data");
    }
  }, [fetchData]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (activeTab === "starlink" && starlink.length === 0) {
      loadStarlink();
    }
  }, [activeTab, starlink.length, loadStarlink]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboard]);

  const successCount = launches.filter(l => l.success === true).length;
  const failCount = launches.filter(l => l.success === false).length;
  const upcomingCount = launches.filter(l => l.upcoming).length;

  const filteredLaunches = launches.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.details?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800">
            <Rocket className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SpaceX Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Real-time data from the open SpaceX API
              {lastUpdated && (
                <span className="ml-2 text-xs">
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? "animate-spin" : ""}`} style={autoRefresh ? { animationDuration: "3s" } : {}} />
            {autoRefresh ? "Live" : "Paused"}
          </Button>
          <Button variant="outline" size="sm" onClick={loadDashboard} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Launches", value: launches.length, icon: Rocket, color: "text-blue-500" },
          { label: "Successes", value: successCount, icon: CheckCircle, color: "text-green-500" },
          { label: "Failures", value: failCount, icon: XCircle, color: "text-red-500" },
          { label: "Upcoming", value: upcomingCount, icon: Clock, color: "text-amber-500" },
          { label: "Rockets", value: rockets.length, icon: Flame, color: "text-orange-500" },
          { label: "Launchpads", value: launchpads.length, icon: Target, color: "text-purple-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} flex-shrink-0`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next & Latest Launch */}
      <div className="grid md:grid-cols-2 gap-4">
        {nextLaunch && (
          <Card className="border-2 border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" /> Next Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {nextLaunch.links.patch.small && (
                <img src={nextLaunch.links.patch.small} alt="" className="h-16 w-16 object-contain" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{nextLaunch.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(nextLaunch.date_utc).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
                <Badge variant="outline" className="mt-1">#{nextLaunch.flight_number}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
        {latestLaunch && (
          <Card className="border-2 border-green-500/30 bg-green-500/5 cursor-pointer" onClick={() => setSelectedLaunch(latestLaunch)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Latest Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {latestLaunch.links.patch.small && (
                <img src={latestLaunch.links.patch.small} alt="" className="h-16 w-16 object-contain" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{latestLaunch.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(latestLaunch.date_utc).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
                <div className="flex gap-1.5 mt-1">
                  {latestLaunch.success !== null && (
                    <Badge variant={latestLaunch.success ? "default" : "destructive"}>
                      {latestLaunch.success ? "Success" : "Failed"}
                    </Badge>
                  )}
                  <Badge variant="outline">#{latestLaunch.flight_number}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Company Info */}
      {company && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span><strong>Founded:</strong> {company.founded}</span>
              <span><strong>Founder:</strong> {company.founder}</span>
              <span><strong>CEO:</strong> {company.ceo}</span>
              <span><strong>Employees:</strong> {company.employees.toLocaleString()}</span>
              <span><strong>Vehicles:</strong> {company.vehicles}</span>
              <span><strong>Launch Sites:</strong> {company.launch_sites}</span>
              <span><strong>Valuation:</strong> ${(company.valuation / 1e9).toFixed(1)}B</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="launches">Launches ({launches.length})</TabsTrigger>
          <TabsTrigger value="rockets">Rockets ({rockets.length})</TabsTrigger>
          <TabsTrigger value="capsules">Capsules ({capsules.length})</TabsTrigger>
          <TabsTrigger value="launchpads">Launchpads ({launchpads.length})</TabsTrigger>
          <TabsTrigger value="starlink">Starlink</TabsTrigger>
        </TabsList>

        {/* ─── Launches ─────────────────── */}
        <TabsContent value="launches" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search launches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredLaunches.map((launch, i) => (
                <motion.div
                  key={launch.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedLaunch(launch)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      {launch.links.patch.small ? (
                        <img src={launch.links.patch.small} alt="" className="h-12 w-12 object-contain flex-shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Rocket className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{launch.name}</p>
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">#{launch.flight_number}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(launch.date_utc).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {launch.upcoming ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">Upcoming</Badge>
                        ) : launch.success !== null ? (
                          <Badge variant={launch.success ? "default" : "destructive"} className="text-[10px]">
                            {launch.success ? "Success" : "Failed"}
                          </Badge>
                        ) : null}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── Rockets ─────────────────── */}
        <TabsContent value="rockets">
          <div className="grid sm:grid-cols-2 gap-4">
            {rockets.map(rocket => (
              <Card
                key={rocket.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => setSelectedRocket(rocket)}
              >
                {rocket.flickr_images[0] && (
                  <div className="h-48 overflow-hidden">
                    <img src={rocket.flickr_images[0]} alt={rocket.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">{rocket.name}</h3>
                    <Badge variant={rocket.active ? "default" : "secondary"}>
                      {rocket.active ? "Active" : "Retired"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{rocket.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="font-bold text-sm">{rocket.height.meters}m</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Mass</p>
                      <p className="font-bold text-sm">{(rocket.mass.kg / 1000).toFixed(0)}t</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Success</p>
                      <p className="font-bold text-sm">{rocket.success_rate_pct}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Capsules ─────────────────── */}
        <TabsContent value="capsules">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {capsules.map(cap => (
              <Card key={cap.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="font-bold">{cap.serial}</code>
                    <Badge variant={cap.status === "active" ? "default" : cap.status === "retired" ? "secondary" : "outline"}>
                      {cap.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Type: {cap.type}</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-muted rounded p-1.5">
                      <p className="text-muted-foreground">Reuses</p>
                      <p className="font-bold">{cap.reuse_count}</p>
                    </div>
                    <div className="bg-muted rounded p-1.5">
                      <p className="text-muted-foreground">Water</p>
                      <p className="font-bold">{cap.water_landings}</p>
                    </div>
                    <div className="bg-muted rounded p-1.5">
                      <p className="text-muted-foreground">Land</p>
                      <p className="font-bold">{cap.land_landings}</p>
                    </div>
                  </div>
                  {cap.last_update && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{cap.last_update}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Launchpads ─────────────────── */}
        <TabsContent value="launchpads">
          <div className="grid sm:grid-cols-2 gap-4">
            {launchpads.map(pad => (
              <Card key={pad.id} className="overflow-hidden">
                {pad.images.large[0] && (
                  <div className="h-40 overflow-hidden">
                    <img src={pad.images.large[0]} alt={pad.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold">{pad.name}</h3>
                    <Badge variant={pad.status === "active" ? "default" : "secondary"}>{pad.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" /> {pad.locality}, {pad.region}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{pad.details}</p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Attempts</p>
                      <p className="font-bold">{pad.launch_attempts}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Successes</p>
                      <p className="font-bold">{pad.launch_successes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Starlink ─────────────────── */}
        <TabsContent value="starlink">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <Satellite className="inline h-4 w-4 mr-1" />
                Showing {starlink.length} satellites (latest batch)
              </p>
              <Button variant="outline" size="sm" onClick={loadStarlink}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
              </Button>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {starlink.map(sat => (
                  <Card key={sat.id} className="text-xs">
                    <CardContent className="p-3">
                      <p className="font-bold text-sm truncate">{sat.spaceTrack.OBJECT_NAME}</p>
                      <div className="grid grid-cols-2 gap-1 mt-2 text-muted-foreground">
                        <span>Version: {sat.version || "N/A"}</span>
                        <span>Height: {sat.height_km?.toFixed(1) || "N/A"} km</span>
                        <span>Velocity: {sat.velocity_kms?.toFixed(1) || "N/A"} km/s</span>
                        <span>
                          {sat.spaceTrack.DECAY_DATE ? (
                            <Badge variant="destructive" className="text-[9px]">Decayed</Badge>
                          ) : (
                            <Badge variant="default" className="text-[9px]">Active</Badge>
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Launch Detail Dialog ─────────────────── */}
      <Dialog open={!!selectedLaunch} onOpenChange={open => !open && setSelectedLaunch(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLaunch && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedLaunch.links.patch.small && (
                    <img src={selectedLaunch.links.patch.small} alt="" className="h-12 w-12 object-contain" />
                  )}
                  <div>
                    <p>{selectedLaunch.name}</p>
                    <p className="text-sm font-normal text-muted-foreground">Flight #{selectedLaunch.flight_number}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {selectedLaunch.upcoming ? (
                    <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Upcoming</Badge>
                  ) : selectedLaunch.success !== null ? (
                    <Badge variant={selectedLaunch.success ? "default" : "destructive"}>
                      {selectedLaunch.success ? "Success" : "Failed"}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(selectedLaunch.date_utc).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </Badge>
                </div>

                {selectedLaunch.details && (
                  <p className="text-sm text-muted-foreground">{selectedLaunch.details}</p>
                )}

                {selectedLaunch.failures.length > 0 && (
                  <div className="border border-destructive/30 rounded-lg p-3">
                    <p className="text-sm font-semibold text-destructive mb-1">Failure Details</p>
                    {selectedLaunch.failures.map((f, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        T+{f.time}s{f.altitude ? ` at ${f.altitude}km` : ""}: {f.reason}
                      </p>
                    ))}
                  </div>
                )}

                {selectedLaunch.cores.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Cores</p>
                    <div className="space-y-1">
                      {selectedLaunch.cores.map((core, i) => (
                        <div key={i} className="flex gap-2 items-center text-sm">
                          <Badge variant="outline" className="text-[10px]">Flight {core.flight}</Badge>
                          {core.reused && <Badge variant="secondary" className="text-[10px]">Reused</Badge>}
                          {core.landing_success !== null && (
                            <Badge variant={core.landing_success ? "default" : "destructive"} className="text-[10px]">
                              Landing: {core.landing_success ? "✓" : "✗"} {core.landing_type}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLaunch.links.flickr.original.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedLaunch.links.flickr.original.slice(0, 4).map((url, i) => (
                        <img key={i} src={url} alt="" className="rounded-lg w-full h-32 object-cover" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {selectedLaunch.links.webcast && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedLaunch.links.webcast} target="_blank" rel="noopener noreferrer">
                        <Play className="h-3.5 w-3.5 mr-1" /> Webcast
                      </a>
                    </Button>
                  )}
                  {selectedLaunch.links.article && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedLaunch.links.article} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Article
                      </a>
                    </Button>
                  )}
                  {selectedLaunch.links.wikipedia && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedLaunch.links.wikipedia} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3.5 w-3.5 mr-1" /> Wikipedia
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Rocket Detail Dialog ─────────────────── */}
      <Dialog open={!!selectedRocket} onOpenChange={open => !open && setSelectedRocket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRocket && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRocket.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {selectedRocket.flickr_images[0] && (
                  <img src={selectedRocket.flickr_images[0]} alt={selectedRocket.name} className="w-full rounded-xl h-64 object-cover" />
                )}

                <div className="flex gap-2 flex-wrap">
                  <Badge variant={selectedRocket.active ? "default" : "secondary"}>
                    {selectedRocket.active ? "Active" : "Retired"}
                  </Badge>
                  <Badge variant="outline">{selectedRocket.type}</Badge>
                  <Badge variant="outline">{selectedRocket.country}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">{selectedRocket.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Height", value: `${selectedRocket.height.meters}m` },
                    { label: "Diameter", value: `${selectedRocket.diameter.meters}m` },
                    { label: "Mass", value: `${(selectedRocket.mass.kg / 1000).toFixed(0)}t` },
                    { label: "Stages", value: selectedRocket.stages },
                    { label: "Boosters", value: selectedRocket.boosters },
                    { label: "Cost/Launch", value: `$${(selectedRocket.cost_per_launch / 1e6).toFixed(0)}M` },
                    { label: "Success Rate", value: `${selectedRocket.success_rate_pct}%` },
                    { label: "First Flight", value: selectedRocket.first_flight },
                  ].map(item => (
                    <div key={item.label} className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-bold text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Engines</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Count:</span> {selectedRocket.engines.number}</div>
                    <div><span className="text-muted-foreground">Type:</span> {selectedRocket.engines.type}</div>
                    <div><span className="text-muted-foreground">Propellant 1:</span> {selectedRocket.engines.propellant_1}</div>
                    <div><span className="text-muted-foreground">Propellant 2:</span> {selectedRocket.engines.propellant_2}</div>
                    <div><span className="text-muted-foreground">Thrust (SL):</span> {selectedRocket.engines.thrust_sea_level.kN} kN</div>
                  </div>
                </div>

                {selectedRocket.wikipedia && (
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={selectedRocket.wikipedia} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" /> Wikipedia
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
