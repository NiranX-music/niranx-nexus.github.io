import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Download,
  List,
  Clock
} from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoFile {
  name: string;
  url: string;
  duration?: number;
  uploadedAt: Date;
  type: string;
}

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [videoHistory, setVideoHistory] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();

  // Load saved videos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('video-history');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setVideoHistory(history.map((item: any) => ({
          ...item,
          uploadedAt: new Date(item.uploadedAt)
        })));
      } catch (error) {
        console.error('Failed to load video history:', error);
      }
    }
  }, []);

  // Initialize Video.js player
  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      plugins: {},
      html5: {
        vhs: {
          overrideNative: true
        }
      }
    });

    playerRef.current = player;

    // Event listeners
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('timeupdate', () => {
      setCurrentTime(player.currentTime());
    });
    player.on('loadedmetadata', () => {
      setDuration(player.duration());
    });
    player.on('volumechange', () => {
      setVolume(Math.round(player.volume() * 100));
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  // Save video history to localStorage
  const saveVideoHistory = (history: VideoFile[]) => {
    try {
      localStorage.setItem('video-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save video history:', error);
    }
  };

  const loadVideo = async (file: File | string) => {
    setLoading(true);
    try {
      let videoUrl: string;
      let fileName: string;
      let fileType: string;

      if (typeof file === 'string') {
        // URL
        videoUrl = file;
        fileName = file.split('/').pop()?.split('?')[0] || 'Remote Video';
        fileType = 'remote';
      } else {
        // File
        videoUrl = URL.createObjectURL(file);
        fileName = file.name;
        fileType = file.type;
      }

      const newVideo: VideoFile = {
        name: fileName,
        url: videoUrl,
        uploadedAt: new Date(),
        type: fileType
      };

      setCurrentVideo(newVideo);

      // Load video in player
      if (playerRef.current) {
        playerRef.current.src({
          src: videoUrl,
          type: fileType === 'remote' ? 'video/mp4' : fileType
        });
      }

      // Add to history if it's a new file
      if (typeof file !== 'string') {
        const updatedHistory = [newVideo, ...videoHistory.filter(video => video.name !== fileName)].slice(0, 10);
        setVideoHistory(updatedHistory);
        saveVideoHistory(updatedHistory);
      }

      toast({
        title: "Video Loaded Successfully",
        description: `${fileName}`,
      });
    } catch (error) {
      console.error('Error loading video:', error);
      toast({
        title: "Error Loading Video",
        description: "Please check if the file is a valid video format",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      loadVideo(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      });
    }
  };

  const handleUrlLoad = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = formData.get('videoUrl') as string;
    
    if (url.trim()) {
      loadVideo(url.trim());
      (event.target as HTMLFormElement).reset();
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted(!playerRef.current.muted());
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    if (currentVideo && currentVideo.type !== 'remote') {
      const link = document.createElement('a');
      link.href = currentVideo.url;
      link.download = currentVideo.name;
      link.click();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Video Player</h1>
        <p className="text-muted-foreground">
          Upload video files or load from URL to play various video formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Video Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Video</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>

              {/* URL Input */}
              <form onSubmit={handleUrlLoad}>
                <label className="text-sm font-medium mb-2 block">Load from URL</label>
                <div className="flex gap-2">
                  <Input
                    name="videoUrl"
                    placeholder="https://example.com/video.mp4"
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">Load</Button>
                </div>
              </form>

              {/* Current Video Info */}
              {currentVideo && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Current Video</span>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-sm font-medium truncate" title={currentVideo.name}>
                        {currentVideo.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {duration > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              {currentVideo && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Playback</span>
                  <div className="flex gap-2">
                    <Button onClick={togglePlayPause} size="sm" variant="outline">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button onClick={toggleMute} size="sm" variant="outline">
                      {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {duration > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground text-center">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-100"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {currentVideo && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => playerRef.current?.requestFullscreen()} 
                    className="w-full" 
                    variant="outline"
                  >
                    <Maximize className="h-4 w-4 mr-2" />
                    Fullscreen
                  </Button>
                  {currentVideo.type !== 'remote' && (
                    <Button onClick={downloadVideo} className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Videos */}
          {videoHistory.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Recent Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {videoHistory.slice(0, 5).map((video, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => loadVideo(video.url)}
                    >
                      <div className="text-sm font-medium truncate">{video.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {video.uploadedAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Video Player */}
        <div className="lg:col-span-3">
          <Card className="h-[80vh]">
            <CardContent className="p-0 h-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading video...</p>
                  </div>
                </div>
              ) : currentVideo ? (
                <div className="h-full">
                  <div data-vjs-player className="h-full">
                    <video
                      ref={videoRef}
                      className="video-js vjs-default-skin h-full w-full"
                      controls
                      preload="auto"
                      data-setup="{}"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Video Loaded</h3>
                    <p className="text-muted-foreground mb-4">Upload a video file or load from URL to get started</p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}