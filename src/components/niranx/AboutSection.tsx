import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from './GlassCard';
import { Sparkles, Target, Users, Zap, Heart, Globe } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Mission Driven',
    description: 'Empowering creators, learners, and innovators with cutting-edge tools.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Built by the community, for the community. Your feedback shapes our future.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance ensures smooth experience across all devices.',
  },
  {
    icon: Heart,
    title: 'Passion Project',
    description: 'Every feature is crafted with love and attention to detail.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Accessible worldwide, bringing innovation to every corner of the globe.',
  },
  {
    icon: Sparkles,
    title: 'AI Powered',
    description: '60+ AI models at your fingertips for creativity and productivity.',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
            <Sparkles className="w-3 h-3 mr-1" /> About Us
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron] mb-6">
            About <span className="text-primary">NiranX</span> Universe
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            NiranX Universe is a creative hub where innovation meets imagination. 
            We bring together music, technology, AI, and learning into one seamless platform 
            designed to inspire and empower the next generation of creators.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full group hover:border-primary/50 transition-all duration-300">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
