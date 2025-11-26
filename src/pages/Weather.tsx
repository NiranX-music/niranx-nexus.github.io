import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, MapPin, Wind, Droplets, Eye, Gauge, Cloud, Sun, CloudRain } from "lucide-react";

interface WeatherData {
  current: {
    location: {
      name: string;
      region: string;
      country: string;
      localtime: string;
    };
    current: {
      temp_c: number;
      temp_f: number;
      condition: {
        text: string;
        icon: string;
      };
      wind_kph: number;
      humidity: number;
      feelslike_c: number;
      uv: number;
      vis_km: number;
      pressure_mb: number;
    };
  };
  forecast: {
    forecast: {
      forecastday: Array<{
        date: string;
        day: {
          maxtemp_c: number;
          mintemp_c: number;
          condition: {
            text: string;
            icon: string;
          };
        };
      }>;
    };
  } | null;
}

const Weather = () => {
  const [query, setQuery] = useState("London");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const fetchWeather = async () => {
    if (!query.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weather-api", {
        body: { query: query.trim() },
      });

      if (error) throw error;

      setWeatherData(data);
      toast.success("Weather data loaded!");
    } catch (error: any) {
      console.error("Weather fetch error:", error);
      toast.error(error.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <Cloud className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Weather</h1>
        </div>

        <Card className="p-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              className="flex-1"
            />
            <Button onClick={fetchWeather} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>
        </Card>

        {weatherData && (
          <>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {weatherData.current.location.name}, {weatherData.current.location.region},{" "}
                      {weatherData.current.location.country}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weatherData.current.location.localtime}
                  </div>
                </div>
                <img
                  src={weatherData.current.current.condition.icon}
                  alt={weatherData.current.current.condition.text}
                  className="h-16 w-16"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-6xl font-bold">
                    {Math.round(weatherData.current.current.temp_c)}°C
                  </div>
                  <div className="text-xl text-muted-foreground mt-2">
                    {weatherData.current.current.condition.text}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Feels like {Math.round(weatherData.current.current.feelslike_c)}°C
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Wind className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Wind</div>
                    <div className="text-lg font-semibold">
                      {weatherData.current.current.wind_kph} km/h
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Humidity</div>
                    <div className="text-lg font-semibold">
                      {weatherData.current.current.humidity}%
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Visibility</div>
                    <div className="text-lg font-semibold">
                      {weatherData.current.current.vis_km} km
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Pressure</div>
                    <div className="text-lg font-semibold">
                      {weatherData.current.current.pressure_mb} mb
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">UV Index</div>
                    <div className="text-lg font-semibold">
                      {weatherData.current.current.uv}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {weatherData.forecast && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CloudRain className="h-5 w-5" />
                  3-Day Forecast
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weatherData.forecast.forecast.forecastday.map((day) => (
                    <Card key={day.date} className="p-4 bg-muted/30">
                      <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <img
                          src={day.day.condition.icon}
                          alt={day.day.condition.text}
                          className="h-12 w-12 mx-auto"
                        />
                        <div className="text-sm">{day.day.condition.text}</div>
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <span className="font-semibold">
                            {Math.round(day.day.maxtemp_c)}°
                          </span>
                          <span className="text-muted-foreground">
                            {Math.round(day.day.mintemp_c)}°
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;
