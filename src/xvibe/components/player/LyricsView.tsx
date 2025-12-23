import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useXVibePlayer } from '../../contexts/XVibePlayerContext';

interface LyricsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LyricsView({ isOpen, onClose }: LyricsViewProps) {
  const { currentTrack } = useXVibePlayer();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
      >
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {currentTrack?.cover_url && (
              <img src={currentTrack.cover_url} alt="" className="w-12 h-12 rounded-lg shadow-lg" />
            )}
            <div>
              <h3 className="text-white font-semibold">{currentTrack?.title}</h3>
              <p className="text-[#B3B3B3] text-sm">{currentTrack?.artist}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pt-24 pb-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Music2 className="w-16 h-16 text-[#B3B3B3]" />
            <h3 className="text-xl font-semibold text-white">No Lyrics Available</h3>
            <p className="text-[#B3B3B3] max-w-md">Lyrics for this track haven't been added yet.</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
