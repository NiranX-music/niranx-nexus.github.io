import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Youtube } from "lucide-react";

export default function StreamSphere() {
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery) {
      // Extract video ID from YouTube URL or use as-is
      const match = searchQuery.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      const id = match ? match[1] : searchQuery;
      setVideoId(id);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
          <Youtube className="w-8 h-8" />
          StreamSphere
        </h1>
        <p className="text-muted-foreground">
          Enjoy YouTube videos in a focused viewing experience
        </p>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube URL or Video ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Load
          </Button>
        </div>
      </Card>

      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Study Music</h3>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setVideoId("jfKfPfyJRdk")}
          >
            Load Playlist
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Educational</h3>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setVideoId("YQHsXMglC9A")}
          >
            Load Content
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Focus Sessions</h3>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setVideoId("5qap5aO4i9A")}
          >
            Load Session
          </Button>
        </Card>
      </div>
    </div>
  );
}
