import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Rocket, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Scene3D } from './Scene3D';
import { useEffect } from 'react';

export function Hero3D() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const bgX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], [-15, 15]);
  const gridX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const gridY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const contentX = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const contentY = useTransform(smoothY, [-0.5, 0.5], [-4, 4]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <Scene3D />

      {/* Parallax gradient overlays */}
      <motion.div 
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background z-[1]" 
      />
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)] z-[1]" 
      />

      {/* Parallax grid */}
      <motion.div 
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          x: gridX,
          y: gridY,
          backgroundImage: 'linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40 - Math.random() * 60, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div 
        style={{ x: contentX, y: contentY }}
        className="relative z-10 container mx-auto px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Floating pill */}
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 150 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-2xl mb-10"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-xs font-mono tracking-widest uppercase text-primary/80">
              The Future Is Here
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-7xl md:text-9xl lg:text-[11rem] font-bold leading-[0.85] font-[Orbitron] tracking-tighter mb-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.span
              className="inline-block bg-gradient-to-br from-primary via-accent to-primary bg-[length:300%_300%] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              NiranX
            </motion.span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-primary/60 to-transparent mb-6"
          />

          <motion.p
            className="text-lg md:text-2xl text-muted-foreground/80 mb-6 max-w-2xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Build the Future Faster.{' '}
            <span className="text-primary font-medium">One platform, infinite possibilities.</span>
          </motion.p>

          <motion.p
            className="text-sm text-muted-foreground/60 mb-14 font-mono tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            Music · AI · Learning · Code · Collaboration
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
              <Button
                size="lg"
                onClick={() => navigate(user ? '/nexus' : '/auth?redirect=/nexus')}
                className="text-lg px-12 py-8 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-shadow group font-semibold"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-12 py-8 rounded-2xl border-2 border-primary/30 hover:border-primary hover:bg-primary/5 backdrop-blur-xl font-semibold"
              >
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-8 h-8 text-primary/40" />
      </motion.div>
    </section>
  );
}
