import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Brain, Plug, Globe, Users, Database, Zap 
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Coding', desc: 'Generate code, fix bugs, and build features with AI assistance' },
  { icon: Plug, title: 'API Integrations', desc: 'Connect to hundreds of services and APIs seamlessly' },
  { icon: Globe, title: 'Project Hosting', desc: 'Deploy to edge with instant CDN and custom domains' },
  { icon: Users, title: 'Team Collaboration', desc: 'Real-time editing, chat, and project management' },
  { icon: Database, title: 'Database', desc: 'Managed Postgres with row-level security and realtime' },
  { icon: Zap, title: 'Edge Functions', desc: 'Serverless compute that scales automatically worldwide' },
];

function GlowCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, type: 'spring', stiffness: 100 }}
      onMouseMove={handleMouseMove}
      className="group relative"
    >
      {/* Hover glow */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, hsl(var(--primary) / 0.3), transparent 60%)`,
        }}
      />

      <div className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/30 group-hover:border-primary/30 transition-all duration-300 h-full">
        {/* Inner glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, hsl(var(--primary) / 0.05), transparent 50%)`,
          }}
        />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold font-[Orbitron] mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeatureGridGlow() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.05)_0%,transparent_60%)]" />

      <motion.div style={{ y }} className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-primary/70 mb-4 block">
            Everything You Need
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron] tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <GlowCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
