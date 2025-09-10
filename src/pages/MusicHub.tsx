import MusicPlayer from "@/components/widgets/MusicPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Music } from "lucide-react";

export default function MusicHub() {
  const openSpotify = () => {
    window.open('https://open.spotify.com/', '_blank');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Music Hub</h1>
        <p className="text-muted-foreground">
          Access your favorite music streaming platform for the best experience.
        </p>
      </div>

      {/* Spotify Redirect Card */}
      <Card className="mb-8 p-8 text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <Music className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Listen on Spotify</h2>
            <p className="text-muted-foreground mb-6">
              Get access to millions of songs, podcasts, and playlists. Perfect for studying, focus, and relaxation.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={openSpotify}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 text-lg"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open Spotify
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://open.spotify.com/genre/0JQ5DAqbMKFHOzuVTgTizF', '_blank')}
              className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            >
              Study Playlists
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Recommended: Create study playlists for better focus and productivity
          </p>
        </div>
      </Card>
      
      <div className="max-w-4xl mx-auto">
        <MusicPlayer />
      </div>
    </div>
  );
}