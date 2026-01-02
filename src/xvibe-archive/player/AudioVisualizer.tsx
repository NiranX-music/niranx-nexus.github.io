import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  audioElement?: HTMLAudioElement | null;
  isPlaying: boolean;
  variant?: 'bars' | 'wave' | 'circle';
  color?: string;
  className?: string;
}

export function AudioVisualizer({ 
  audioElement, 
  isPlaying, 
  variant = 'bars',
  color = '#1DB954',
  className = ''
}: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(32).fill(0));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioElement || !isPlaying) {
      // Generate fake visualization when not connected
      if (isPlaying) {
        const interval = setInterval(() => {
          setBars(prev => prev.map(() => Math.random() * 100));
        }, 100);
        return () => clearInterval(interval);
      }
      return;
    }

    // Create audio context and analyzer
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 64;
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
      }

      const bufferLength = analyzerRef.current!.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        if (analyzerRef.current) {
          analyzerRef.current.getByteFrequencyData(dataArray);
          const normalizedBars = Array.from(dataArray).map(v => (v / 255) * 100);
          setBars(normalizedBars);
        }
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } catch (error) {
      // Fallback to fake visualization
      const interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [audioElement, isPlaying]);

  // Fake visualization for demo
  useEffect(() => {
    if (isPlaying && !audioElement) {
      const interval = setInterval(() => {
        setBars(prev => prev.map((v, i) => {
          const wave = Math.sin(Date.now() / 200 + i * 0.3) * 30 + 50;
          return wave + Math.random() * 20;
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying, audioElement]);

  if (variant === 'bars') {
    return (
      <div className={`flex items-end justify-center gap-[2px] h-full ${className}`}>
        {bars.slice(0, 16).map((height, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              height: isPlaying ? `${Math.max(10, height)}%` : '10%'
            }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        {bars.slice(0, 5).map((height, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              height: isPlaying ? `${Math.max(4, height / 4)}px` : '4px'
            }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    const average = bars.reduce((a, b) => a + b, 0) / bars.length;
    return (
      <motion.div
        className={`rounded-full ${className}`}
        style={{ backgroundColor: color }}
        animate={{
          scale: isPlaying ? 1 + (average / 200) : 1,
          opacity: isPlaying ? 0.8 + (average / 500) : 0.5
        }}
        transition={{ duration: 0.1 }}
      />
    );
  }

  return null;
}
