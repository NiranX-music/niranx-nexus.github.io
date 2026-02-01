import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function CTASection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Ready to Start?
          </motion.div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[Orbitron] mb-8">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
              Join the Universe
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Start your journey today. Create, learn, and innovate with thousands of creators worldwide.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => navigate(user ? '/nexus' : '/auth?redirect=/nexus')}
                className="text-lg px-12 py-8 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full shadow-2xl shadow-primary/40 group"
              >
                <Rocket className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                Get Started Free
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Free tier available
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Cancel anytime
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
