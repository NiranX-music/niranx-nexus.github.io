import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Volume2, VolumeX, SkipForward, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useXVibePlayer } from '../../contexts/XVibePlayerContext';

interface XDJModeProps {
  onClose?: () => void;
}

export function XDJMode({ onClose }: XDJModeProps) {
  const { currentTrack, isDJMode, toggleDJMode } = useXVibePlayer();
  const [djMessage, setDjMessage] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [djVolume, setDjVolume] = useState(80);
  const [frequency, setFrequency] = useState<'low' | 'medium' | 'high'>('medium');
  const lastTrackRef = useRef<string | null>(null);

  const djPhrases = [
    "And now, something I think you'll love...",
    "Let's keep the energy flowing with this next one.",
    "Based on your taste, you're gonna dig this.",
    "Here's a track that matches your vibe perfectly."
  ];

  useEffect(() => {
    if (isDJMode && currentTrack && currentTrack.id !== lastTrackRef.current) {
      lastTrackRef.current = currentTrack.id;
      generateDJMessage();
    }
  }, [currentTrack, isDJMode]);

  const generateDJMessage = () => {
    if (!currentTrack) return;
    const shouldSpeak = frequency === 'high' || (frequency === 'medium' && Math.random() > 0.5) || (frequency === 'low' && Math.random() > 0.8);
    if (!shouldSpeak) return;

    const phrase = djPhrases[Math.floor(Math.random() * djPhrases.length)];
    const message = `${phrase} "${currentTrack.title}" by ${currentTrack.artist}.`;
    setDjMessage(message);
    speakMessage(message);
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.volume = djVolume / 100;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const skipDJMessage = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  if (!isDJMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
      >
        <div className="bg-gradient-to-r from-[#1DB954]/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1DB954] to-purple-500 flex items-center justify-center"
            >
              <Radio className="w-6 h-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold">XDJ</h3>
                <Sparkles className="w-4 h-4 text-[#1DB954]" />
              </div>
              <p className="text-[#B3B3B3] text-sm">Your AI DJ</p>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleDJMode} className="text-[#B3B3B3]">Turn Off</Button>
          </div>

          {djMessage && (
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-white/80 text-sm italic">"{djMessage}"</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#B3B3B3]" onClick={() => setDjVolume(v => v > 0 ? 0 : 80)}>
                {djVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider value={[djVolume]} max={100} onValueChange={([v]) => setDjVolume(v)} className="flex-1" />
            </div>
            <div className="flex gap-1">
              {(['low', 'medium', 'high'] as const).map((f) => (
                <Button key={f} variant={frequency === f ? 'default' : 'ghost'} size="sm" onClick={() => setFrequency(f)}
                  className={`text-xs h-7 ${frequency === f ? 'bg-[#1DB954] text-black' : 'text-[#B3B3B3]'}`}>{f}</Button>
              ))}
            </div>
            {isSpeaking && <Button variant="ghost" size="icon" onClick={skipDJMessage} className="h-8 w-8 text-[#B3B3B3]"><SkipForward className="w-4 h-4" /></Button>}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
