import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  Music, 
  Timer, 
  Play, 
  FileText,
  Save,
  Volume2,
  Pause,
  SkipForward,
  SkipBack
} from "lucide-react";


export function RightSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'music' | 'pomodoro' | 'video' | 'pdf' | 'save'>('music');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes
  const [pomodoroActive, setPomodoroActive] = useState(false);
  

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'music', label: 'Music', icon: Music },
    { id: 'pomodoro', label: 'Focus', icon: Timer },
    { id: 'video', label: 'Video', icon: Play },
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'save', label: 'Save', icon: Save },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        className={`fixed top-1/2 right-4 z-50 transition-all duration-300 ${
          isOpen ? 'translate-x-[-320px]' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-background border-l transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 h-full flex flex-col">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon className="w-3 h-3" />
                <span className="text-xs">{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            {activeTab === 'music' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Music Player
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Music className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Study Mix</h3>
                    <p className="text-sm text-muted-foreground">Lofi Hip Hop</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="ghost" size="sm">
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setMusicPlaying(!musicPlaying)}
                    >
                      {musicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <div className="flex-1 h-2 bg-muted rounded-full">
                      <div className="h-full w-1/2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'pomodoro' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Pomodoro Timer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold mb-4">
                      {formatTime(pomodoroTime)}
                    </div>
                    <Button 
                      onClick={() => setPomodoroActive(!pomodoroActive)}
                      className="w-full"
                    >
                      {pomodoroActive ? 'Pause' : 'Start'}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setPomodoroTime(25 * 60)}
                    >
                      25 min Focus
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setPomodoroTime(5 * 60)}
                    >
                      5 min Break
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setPomodoroTime(15 * 60)}
                    >
                      15 min Long Break
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'video' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Video Player
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                    <Play className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Drop a video URL or upload a file to play
                  </p>
                  <Button variant="outline" className="w-full">
                    Upload Video
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'pdf' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    PDF Viewer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-60 bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Upload a PDF to view it here
                  </p>
                  <Button variant="outline" className="w-full">
                    Upload PDF
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'save' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Quick Save
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Save your progress and notes locally
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full">
                        Save Current Session
                      </Button>
                      <Button variant="outline" className="w-full">
                        View Saved Sessions
                      </Button>
                      <Button variant="outline" className="w-full">
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}