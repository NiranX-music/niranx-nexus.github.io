import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Volume2, VolumeX, Play, Pause, Timer, Maximize2, Minimize2, Eye, Droplets, Wind, Cloud, Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmbientScene {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
  particles: string;
  description: string;
}

const scenes: AmbientScene[] = [
  { id: 'rain', name: 'RAIN_MODE', icon: Droplets, gradient: 'from-blue-900/40 via-slate-900/60 to-indigo-950/40', particles: 'bg-primary/30', description: 'Calming rainfall' },
  { id: 'forest', name: 'FOREST_MODE', icon: Wind, gradient: 'from-emerald-950/40 via-green-900/50 to-teal-950/40', particles: 'bg-success/30', description: 'Gentle breeze' },
  { id: 'night', name: 'NIGHT_MODE', icon: Moon, gradient: 'from-indigo-950/50 via-purple-950/40 to-slate-950/50', particles: 'bg-accent/20', description: 'Starlit sky' },
  { id: 'fire', name: 'EMBER_MODE', icon: Flame, gradient: 'from-orange-950/40 via-red-950/40 to-amber-950/30', particles: 'bg-warning/30', description: 'Warm campfire' },
  { id: 'space', name: 'VOID_MODE', icon: Zap, gradient: 'from-violet-950/50 via-black to-blue-950/30', particles: 'bg-primary/10', description: 'Deep space' },
  { id: 'cloud', name: 'CLOUD_MODE', icon: Cloud, gradient: 'from-sky-900/30 via-slate-800/40 to-cyan-950/30', particles: 'bg-foreground/10', description: 'Above the clouds' },
];

const FocusModeAmbient = () => {
  const [activeScene, setActiveScene] = useState<AmbientScene>(scenes[0]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState([70]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTimerRunning || seconds <= 0) return;
    const interval = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;

  return (
    <div ref={containerRef} className={cn("min-h-full relative overflow-hidden transition-all duration-1000")}>
      {/* Ambient Background */}
      <div className={cn("fixed inset-0 -z-10 bg-gradient-to-br transition-all duration-1000", activeScene.gradient)} />
      
      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={cn("absolute rounded-full", activeScene.particles)}
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100 - Math.random() * 200],
              x: [0, (Math.random() - 0.5) * 60],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8 flex flex-col items-center justify-center min-h-screen gap-8">
        {/* Timer Display */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-flex items-center justify-center">
            {/* Circular Progress */}
            <svg className="w-56 h-56 md:w-72 md:h-72 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" strokeWidth="3" className="stroke-muted/20" />
              <motion.circle
                cx="100" cy="100" r="90" fill="none" strokeWidth="4"
                className="stroke-primary"
                strokeLinecap="round"
                strokeDasharray={565}
                animate={{ strokeDashoffset: 565 - (565 * progress) / 100 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl md:text-7xl font-display font-bold tabular-nums text-foreground">
                {formatTime(seconds)}
              </span>
              <span className="font-mono text-xs text-muted-foreground tracking-widest mt-2">
                {isTimerRunning ? 'FOCUSING' : 'READY'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button size="lg" onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="font-mono text-sm tracking-wide gap-2 px-8">
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isTimerRunning ? 'PAUSE' : 'START'}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSeconds(25 * 60)} className="glass-button">
            <Timer className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)} className="glass-button">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen} className="glass-button">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Volume Slider */}
        {!isMuted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-48">
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
            <p className="text-center font-mono text-[10px] text-muted-foreground mt-1">VOL: {volume[0]}%</p>
          </motion.div>
        )}

        {/* Scene Selector */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-xl">
          {scenes.map(scene => (
            <motion.button
              key={scene.id}
              onClick={() => setActiveScene(scene)}
              className={cn(
                "p-3 rounded-lg border text-center transition-all",
                activeScene.id === scene.id
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  : "border-border/30 bg-background/20 hover:bg-background/40"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <scene.icon className={cn("w-5 h-5 mx-auto mb-1", activeScene.id === scene.id ? "text-primary" : "text-muted-foreground")} />
              <span className="font-mono text-[9px] tracking-widest text-muted-foreground">{scene.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Current Scene Badge */}
        <Badge variant="outline" className="font-mono text-xs tracking-wider glass-button">
          <Eye className="w-3 h-3 mr-1" /> {activeScene.description}
        </Badge>
      </div>
    </div>
  );
};

export default FocusModeAmbient;
