import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Rocket, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Scene3D } from './Scene3D';

export function Hero3D() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <Scene3D />

      {/* Layered gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)] z-[1]" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
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

          {/* Title with staggered letter reveal */}
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
            className="text-lg md:text-2xl text-muted-foreground/80 mb-14 max-w-2xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            One platform.{' '}
            <span className="text-primary font-medium">Infinite possibilities.</span>
            <br className="hidden md:block" />
            Music · AI · Learning · Innovation
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
                Enter Nexus
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
                Explore
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

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
