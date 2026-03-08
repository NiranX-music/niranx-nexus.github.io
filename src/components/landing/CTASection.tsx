import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function CTASection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className="py-32 px-4 relative overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary/15 to-accent/15 blur-3xl"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div style={{ scale, opacity }} className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            style={{ transformPerspective: 1200 }}
            className="p-16 rounded-[2rem] bg-card/30 backdrop-blur-2xl border border-primary/20 shadow-2xl shadow-primary/5"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono tracking-widest uppercase mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ready to Start?
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-bold font-[Orbitron] mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
                Join the Universe
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto font-light">
              Create, learn, and innovate with thousands of creators worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Button
                  size="lg"
                  onClick={() => navigate(user ? '/nexus' : '/auth?redirect=/nexus')}
                  className="text-lg px-14 py-8 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl shadow-2xl shadow-primary/30 group font-semibold"
                >
                  <Rocket className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                  Get Started Free
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/explore-all')}
                  className="text-lg px-10 py-8 rounded-2xl border-primary/30 hover:bg-primary/5 group font-semibold"
                >
                  <Compass className="w-6 h-6 mr-2 group-hover:rotate-45 transition-transform" />
                  Explore XNexus
                </Button>
              </motion.div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
              {['No credit card', 'Free tier', 'Cancel anytime'].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
