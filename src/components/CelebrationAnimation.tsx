import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CelebrationAnimationProps {
  type: 'xp' | 'level-up' | 'achievement' | 'task-complete';
  value?: number;
  message?: string;
  onComplete?: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  type,
  value,
  message,
  onComplete,
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Trigger confetti based on type
    if (type === 'level-up' || type === 'achievement') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#06b6d4', '#10b981'],
      });
    } else if (type === 'xp') {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#a855f7', '#ec4899'],
        startVelocity: 20,
      });
    }

    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [type, onComplete]);

  const getAnimationConfig = () => {
    switch (type) {
      case 'level-up':
        return {
          icon: '🎉',
          title: 'LEVEL UP!',
          color: 'from-purple-500 to-pink-500',
          scale: 1.5,
        };
      case 'achievement':
        return {
          icon: '🏆',
          title: 'Achievement Unlocked!',
          color: 'from-yellow-500 to-orange-500',
          scale: 1.3,
        };
      case 'xp':
        return {
          icon: '✨',
          title: `+${value} XP`,
          color: 'from-blue-500 to-purple-500',
          scale: 1.2,
        };
      case 'task-complete':
        return {
          icon: '✓',
          title: 'Task Complete!',
          color: 'from-green-500 to-emerald-500',
          scale: 1.2,
        };
    }
  };

  const config = getAnimationConfig();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-gradient-to-r ${config.color} text-white rounded-2xl px-8 py-6 shadow-2xl`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ 
              scale: config.scale, 
              rotate: 0,
              transition: { 
                type: 'spring', 
                stiffness: 200, 
                damping: 10 
              }
            }}
            exit={{ scale: 0, rotate: 10 }}
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="text-6xl"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1.2, 1]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                {config.icon}
              </motion.div>
              <motion.h2
                className="text-2xl font-bold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {config.title}
              </motion.h2>
              {message && (
                <motion.p
                  className="text-sm opacity-90"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {message}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Floating particles */}
          {type === 'xp' && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: window.innerHeight,
                    opacity: 1
                  }}
                  animate={{ 
                    y: -100,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to trigger celebrations
export const useCelebration = () => {
  const [celebration, setCelebration] = useState<CelebrationAnimationProps | null>(null);

  const celebrate = (config: CelebrationAnimationProps) => {
    setCelebration({ ...config, onComplete: () => setCelebration(null) });
  };

  const CelebrationComponent = celebration ? (
    <CelebrationAnimation {...celebration} />
  ) : null;

  return { celebrate, CelebrationComponent };
};
