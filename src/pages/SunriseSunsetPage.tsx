import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Sunrise, Sunset, Clock, MapPin, RefreshCw, Calendar, Sun, Moon, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface SunData {
  sunrise: string;
  sunset: string;
  dawn: string;
  dusk: string;
  first_light: string;
  last_light: string;
  solar_noon: string;
  golden_hour: string;
  day_length: string;
  timezone: string;
  utc_offset: number;
}

const PRESETS = [
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
];

const SunriseSunsetPage = () => {
  const [lat, setLat] = useState('28.6139');
  const [lng, setLng] = useState('77.2090');
  const [date, setDate] = useState('');
  const [data, setData] = useState<SunData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('Delhi');
  const { toast } = useToast();

  const fetchSunData = useCallback(async (latitude: string, longitude: string, selectedDate?: string) => {
    setLoading(true);
    try {
      let url = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}`;
      if (selectedDate) url += `&date=${selectedDate}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.status === 'OK') {
        setData(json.results);
        toast({ title: 'Data loaded', description: `Sun data for ${locationName}` });
      } else {
        toast({ title: 'Error', description: 'Failed to fetch sun data', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network Error', description: 'Could not reach the API', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [locationName, toast]);

  useEffect(() => {
    fetchSunData(lat, lng);
  }, []);

  const handleSearch = () => fetchSunData(lat, lng, date || undefined);

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setLat(String(preset.lat));
    setLng(String(preset.lng));
    setLocationName(preset.name);
    fetchSunData(String(preset.lat), String(preset.lng), date || undefined);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Not supported', description: 'Geolocation is not available', variant: 'destructive' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = String(pos.coords.latitude);
        const ln = String(pos.coords.longitude);
        setLat(la);
        setLng(ln);
        setLocationName('Your Location');
        fetchSunData(la, ln, date || undefined);
      },
      () => toast({ title: 'Permission denied', variant: 'destructive' })
    );
  };

  const timeCards = data ? [
    { label: 'First Light', value: data.first_light, icon: Eye, color: 'text-indigo-400' },
    { label: 'Dawn', value: data.dawn, icon: Moon, color: 'text-blue-400' },
    { label: 'Sunrise', value: data.sunrise, icon: Sunrise, color: 'text-amber-500' },
    { label: 'Solar Noon', value: data.solar_noon, icon: Sun, color: 'text-yellow-400' },
    { label: 'Golden Hour', value: data.golden_hour, icon: Sunset, color: 'text-orange-400' },
    { label: 'Sunset', value: data.sunset, icon: Sunset, color: 'text-red-500' },
    { label: 'Dusk', value: data.dusk, icon: Moon, color: 'text-purple-400' },
    { label: 'Last Light', value: data.last_light, icon: Eye, color: 'text-slate-400' },
  ] : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center justify-center gap-3">
            <Sun className="w-10 h-10 text-primary" />
            Sunrise & Sunset
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Real-time sunrise, sunset, dawn, dusk & golden hour data — powered by SunriseSunset.io
          </p>
        </motion.div>

        {/* Search Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Location
            </CardTitle>
            <CardDescription>Enter coordinates, pick a city, or use your location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" value={lat} onChange={e => setLat(e.target.value)} placeholder="28.6139" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" value={lng} onChange={e => setLng(e.target.value)} placeholder="77.2090" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date">Date (optional)</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sun className="w-4 h-4" />}
                {loading ? 'Loading...' : 'Get Sun Data'}
              </Button>
              <Button variant="outline" onClick={handleUseMyLocation} className="gap-2">
                <MapPin className="w-4 h-4" /> Use My Location
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <Button key={p.name} variant="outline" size="sm" onClick={() => handlePreset(p)}>
                  {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-primary/30">
                <CardContent className="pt-6 text-center">
                  <Sunrise className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-sm text-muted-foreground">Sunrise</p>
                  <p className="text-2xl font-bold text-foreground">{data.sunrise}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="pt-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Day Length</p>
                  <p className="text-2xl font-bold text-foreground">{data.day_length}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="pt-6 text-center">
                  <Sunset className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-sm text-muted-foreground">Sunset</p>
                  <p className="text-2xl font-bold text-foreground">{data.sunset}</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {locationName} — Detailed Sun Times
                </CardTitle>
                <CardDescription>
                  Timezone: {data.timezone} (UTC {data.utc_offset >= 0 ? '+' : ''}{data.utc_offset})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeCards.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-lg border bg-card p-3 text-center"
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Visual Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Day Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-10 rounded-full overflow-hidden bg-gradient-to-r from-indigo-900 via-blue-500 via-amber-400 via-yellow-300 via-orange-400 via-red-500 to-indigo-900">
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-[10px] font-semibold">
                    <span className="text-foreground/90 drop-shadow">🌙 Night</span>
                    <span className="text-foreground/90 drop-shadow">🌅 Dawn</span>
                    <span className="text-foreground/90 drop-shadow">☀️ Day</span>
                    <span className="text-foreground/90 drop-shadow">🌇 Dusk</span>
                    <span className="text-foreground/90 drop-shadow">🌙 Night</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SunriseSunsetPage;
