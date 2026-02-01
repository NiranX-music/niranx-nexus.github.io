import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Scene3D } from './Scene3D';

export function Hero3D() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <Scene3D />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background z-[1]" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent z-[1]" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.8, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 backdrop-blur-xl mb-8 shadow-lg shadow-primary/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to the Future
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 font-[Orbitron] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.span
              className="inline-block bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-2xl"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              NiranX
            </motion.span>
            <br />
            <motion.span 
              className="text-4xl md:text-6xl lg:text-7xl text-foreground/80 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              Universe
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            One platform. <span className="text-primary font-semibold">Infinite possibilities.</span>
            <br className="hidden md:block" />
            Music, AI, Learning, and Innovation—all in one cosmic experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => navigate(user ? '/nexus' : '/auth?redirect=/nexus')}
                className="text-lg px-10 py-7 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] text-primary-foreground rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-shadow group"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Enter Nexus
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-10 py-7 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/10 backdrop-blur-xl"
              >
                Explore More
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-8 h-14 rounded-full border-2 border-primary/40 flex justify-center pt-3 backdrop-blur-sm">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0, 20, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
