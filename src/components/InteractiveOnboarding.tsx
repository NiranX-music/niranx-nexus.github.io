import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Target, Mail, Brain, MessageSquare, Music, 
  BookOpen, Trophy, Settings, ChevronRight, ChevronLeft, 
  X, Sparkles, Zap, Users, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  route?: string;
  highlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to NiranX StudyVerse! 🎉',
    description: 'Your ultimate study companion. Let me show you around the key features that will transform your learning experience.',
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    position: 'center'
  },
  {
    id: 'focus-engine',
    title: 'Focus Engine',
    description: 'Supercharge your concentration with Pomodoro timers, Havoc Mode for distraction-free study, and ambient sounds.',
    icon: <Target className="w-8 h-8 text-orange-500" />,
    position: 'center',
    route: '/focus-engine'
  },
  {
    id: 'ai-tools',
    title: 'AI-Powered Tools',
    description: 'Get homework help, generate study materials, create presentations, and chat with AI tutors across all subjects.',
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    position: 'center',
    route: '/ai-corner'
  },
  {
    id: 'xmail',
    title: 'Xmail - Your Study Inbox',
    description: 'A dedicated @niranx.com email for academic communication. Keep study discussions separate from personal mail.',
    icon: <Mail className="w-8 h-8 text-blue-500" />,
    position: 'center',
    route: '/mailbox'
  },
  {
    id: 'debates',
    title: 'Debate Hub',
    description: 'Sharpen your critical thinking! Join debates, earn XP, climb leaderboards, and develop argumentation skills.',
    icon: <MessageSquare className="w-8 h-8 text-green-500" />,
    position: 'center',
    route: '/debates'
  },
  {
    id: 'scheduler',
    title: 'Smart Scheduler',
    description: 'Manage classes, exams, and homework with AI-powered scheduling that adapts to your learning style.',
    icon: <Calendar className="w-8 h-8 text-cyan-500" />,
    position: 'center',
    route: '/scheduler'
  },
  {
    id: 'music',
    title: 'Xvibe - Study Music',
    description: 'Curated playlists and ambient sounds on Xvibe to boost your concentration. Music proven to enhance focus and retention.',
    icon: <Music className="w-8 h-8 text-pink-500" />,
    position: 'center',
    route: '/music'
  },
  {
    id: 'labs',
    title: 'Virtual Labs',
    description: 'Interactive Physics, Chemistry, Biology, and Math simulations. Learn by experimenting in a safe virtual environment.',
    icon: <BookOpen className="w-8 h-8 text-yellow-500" />,
    position: 'center',
    route: '/labs'
  },
  {
    id: 'gamification',
    title: 'Level Up & Earn Rewards',
    description: 'Earn XP for every activity, maintain streaks, unlock achievements, and compete on leaderboards!',
    icon: <Trophy className="w-8 h-8 text-amber-500" />,
    position: 'center',
    route: '/leaderboard'
  },
  {
    id: 'community',
    title: 'Study Community',
    description: 'Connect with study buddies, join guilds, share resources, and learn together in a supportive environment.',
    icon: <Users className="w-8 h-8 text-indigo-500" />,
    position: 'center',
    route: '/community'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'Explore at your own pace. Customize your dashboard, set up your study persona, and start your learning journey!',
    icon: <Zap className="w-8 h-8 text-primary" />,
    position: 'center'
  }
];

interface InteractiveOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function InteractiveOnboarding({ onComplete, onSkip }: InteractiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  }, [onSkip]);

  const handleTryFeature = useCallback(() => {
    if (step.route) {
      navigate(step.route);
      handleComplete();
    }
  }, [step, navigate, handleComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleSkip]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/20"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0
                }}
                animate={{ 
                  y: [null, Math.random() * -200],
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-lg mx-4"
          >
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Skip button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                onClick={handleSkip}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="p-8 pt-10">
                {/* Step indicator */}
                <div className="flex justify-center gap-1.5 mb-6">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-primary w-6' 
                          : index < currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Icon with glow effect */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full scale-150" />
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      {step.icon}
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>

                  {step.route && currentStep !== tourSteps.length - 1 && (
                    <Button
                      variant="secondary"
                      onClick={handleTryFeature}
                      className="flex-1"
                    >
                      Try Now
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        Get Started
                        <Sparkles className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Keyboard hints */}
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Use ← → arrows to navigate, Esc to skip
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
