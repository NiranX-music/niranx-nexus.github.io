import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Sparkles, Target, Users, Zap, Heart, Globe } from 'lucide-react';

const features = [
  { icon: Target, title: 'Mission Driven', description: 'Empowering creators, learners, and innovators with cutting-edge tools.' },
  { icon: Users, title: 'Community First', description: 'Built by the community, for the community. Your feedback shapes our future.' },
  { icon: Zap, title: 'Lightning Fast', description: 'Optimized performance ensures smooth experience across all devices.' },
  { icon: Heart, title: 'Passion Project', description: 'Every feature is crafted with love and attention to detail.' },
  { icon: Globe, title: 'Global Reach', description: 'Accessible worldwide, bringing innovation to every corner of the globe.' },
  { icon: Sparkles, title: 'AI Powered', description: '60+ AI models at your fingertips for creativity and productivity.' },
];

function AboutCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [20, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, rotateX, transformPerspective: 1000 }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="group"
    >
      <div className="h-full p-7 rounded-3xl bg-card/30 backdrop-blur-2xl border border-border/30 hover:border-primary/40 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-primary/5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:from-primary/25 group-hover:to-accent/25 transition-all duration-500">
          <feature.icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2 font-[Orbitron] group-hover:text-primary transition-colors">{feature.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="py-32 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.05)_0%,transparent_50%)]" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-5 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono tracking-widest uppercase mb-6">
            About Us
          </span>
          <h2 className="text-5xl md:text-7xl font-bold font-[Orbitron] mb-6 tracking-tight">
            About <span className="text-primary">NiranX</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            NiranX Universe is a creative hub where innovation meets imagination. 
            We bring together music, technology, AI, and learning into one platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AboutCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
