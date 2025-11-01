import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Music, Video, Minimize2, Maximize2 } from 'lucide-react';
import { useNowPlaying } from '@/contexts/NowPlayingContext';
import { useState } from 'react';

export function NowPlaying() {
  const { nowPlaying, isVisible, setIsVisible } = useNowPlaying();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible || !nowPlaying.type) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <Card className="shadow-2xl border-2 border-primary/20 backdrop-blur-xl bg-background/95">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {nowPlaying.type === 'music' ? (
                <Music className="w-5 h-5 text-primary" />
              ) : (
                <Video className="w-5 h-5 text-primary" />
              )}
              <h3 className="font-semibold text-sm">Now Playing</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="space-y-3">
              {nowPlaying.thumbnail && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={nowPlaying.thumbnail}
                    alt={nowPlaying.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <p className="font-medium text-sm line-clamp-2">{nowPlaying.title}</p>
                {nowPlaying.artist && (
                  <p className="text-xs text-muted-foreground">{nowPlaying.artist}</p>
                )}
              </div>

              {nowPlaying.type === 'music' && (
                <div className="space-y-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3 animate-pulse" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1:23</span>
                    <span>3:45</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {isMinimized && (
            <div className="flex items-center gap-3">
              {nowPlaying.thumbnail && (
                <img
                  src={nowPlaying.thumbnail}
                  alt={nowPlaying.title}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">{nowPlaying.title}</p>
                {nowPlaying.artist && (
                  <p className="text-xs text-muted-foreground truncate">{nowPlaying.artist}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
