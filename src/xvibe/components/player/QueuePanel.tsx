import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXVibePlayer } from '../../contexts/XVibePlayerContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function QueuePanel() {
  const {
    currentTrack,
    queue,
    isPlaying,
    isQueueOpen,
    toggleQueue,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = useXVibePlayer();

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-[90px] w-80 bg-[#121212] border-l border-[#282828] z-40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#282828]">
            <h2 className="text-lg font-bold text-white">Queue</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#B3B3B3] hover:text-white"
              onClick={toggleQueue}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {/* Now Playing */}
            {currentTrack && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider mb-3">
                  Now Playing
                </h3>
                <div className="flex items-center gap-3 p-2 rounded-md bg-[#282828]">
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    {currentTrack.cover_url ? (
                      <img
                        src={currentTrack.cover_url}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#3e3e3e] flex items-center justify-center">
                        <span className="text-xl">🎵</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1DB954] truncate">
                      {currentTrack.title}
                    </p>
                    <p className="text-sm text-[#B3B3B3] truncate">
                      {currentTrack.artist?.name}
                    </p>
                  </div>
                  {isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-[#1DB954] rounded-full"
                          animate={{
                            height: ['40%', '100%', '40%'],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Pause className="h-4 w-4 text-[#1DB954]" />
                  )}
                </div>
              </div>
            )}

            {/* Queue */}
            <div className="p-4 pt-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
                  Next in Queue
                </h3>
                {queue.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#B3B3B3] hover:text-white h-6 px-2"
                    onClick={clearQueue}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {queue.length === 0 ? (
                <p className="text-sm text-[#B3B3B3] text-center py-8">
                  No tracks in queue
                </p>
              ) : (
                <div className="space-y-1">
                  {queue.map((track, index) => (
                    <div
                      key={`${track.id}-${index}`}
                      className="group flex items-center gap-2 p-2 rounded-md hover:bg-[#282828] transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-[#B3B3B3] opacity-0 group-hover:opacity-100 cursor-grab" />
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        {track.cover_url ? (
                          <img
                            src={track.cover_url}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#3e3e3e] flex items-center justify-center">
                            <span className="text-sm">🎵</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-[#B3B3B3] truncate">
                          {track.artist?.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-[#B3B3B3] hover:text-white"
                        onClick={() => removeFromQueue(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
