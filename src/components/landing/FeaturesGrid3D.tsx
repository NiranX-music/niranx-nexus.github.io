import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Music, BookOpen, Rocket, Gamepad2, Video, 
  MessageSquare, Code, Palette, Globe, Zap, Shield 
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Hub', desc: '60+ AI models at your fingertips for chat, image gen, and more', color: 'from-violet-500 to-purple-600', path: '/nexus/ai-hub' },
  { icon: Music, title: 'XVibe Music', desc: 'Stream unlimited tracks, create playlists, discover artists', color: 'from-emerald-500 to-teal-600', path: '/xvibe/welcome' },
  { icon: BookOpen, title: 'Learn Zone', desc: 'Interactive courses, flashcards, and virtual labs', color: 'from-blue-500 to-cyan-600', path: '/nexus/learn' },
  { icon: Rocket, title: 'Projects', desc: 'Build and showcase your creative work', color: 'from-orange-500 to-amber-600', path: '/nexus/projects' },
  { icon: Gamepad2, title: 'Gaming', desc: 'Play and compete with friends online', color: 'from-pink-500 to-rose-600', path: '/nexus/games' },
  { icon: Video, title: 'Streaming', desc: 'Watch and create live content', color: 'from-red-500 to-orange-600', path: '/nexus/streaming' },
  { icon: MessageSquare, title: 'Community', desc: 'Connect, debate, and collaborate', color: 'from-indigo-500 to-violet-600', path: '/nexus/community' },
  { icon: Code, title: 'Dev Tools', desc: 'Code playground, APIs & deployment', color: 'from-slate-500 to-zinc-600', path: '/nexus/dev-tools' },
  { icon: Palette, title: 'Creative', desc: 'Design, art, and content creation', color: 'from-fuchsia-500 to-pink-600', path: '/nexus/creative' },
  { icon: Globe, title: 'Web Apps', desc: 'Mini apps and integrations', color: 'from-cyan-500 to-blue-600', path: '/nexus/apps' },
  { icon: Zap, title: 'Automation', desc: 'Smart workflows and scheduling', color: 'from-yellow-500 to-orange-600', path: '/nexus/automation' },
  { icon: Shield, title: 'Security', desc: 'Privacy, 2FA, and data protection', color: 'from-green-500 to-emerald-600', path: '/nexus/security' },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 0.3], [120, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [25, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale, rotateX, transformPerspective: 1200 }}
      whileHover={{ 
        y: -12, 
        scale: 1.04,
        rotateY: 3,
        transition: { duration: 0.3 } 
      }}
      onClick={() => navigate(feature.path)}
      className="group cursor-pointer"
    >
      <div className="relative h-full p-7 rounded-3xl bg-card/40 backdrop-blur-2xl border border-border/30 hover:border-primary/40 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10">
        {/* Animated glow */}
        <div className={`absolute -inset-1 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.07] blur-xl transition-opacity duration-700`} />
        
        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100"
          initial={false}
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ height: '50%' }}
        />
        
        {/* Icon */}
        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <feature.icon className="w-8 h-8 text-white" />
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-40 blur-xl group-hover:blur-2xl transition-all`} />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-[Orbitron]">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.desc}
        </p>
        
        {/* Corner accent */}
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary/80 transition-colors" />
        <div className="absolute bottom-3 left-3 w-8 h-px bg-primary/20 group-hover:w-16 group-hover:bg-primary/50 transition-all duration-500" />
      </div>
    </motion.div>
  );
}

export function FeaturesGrid3D() {
  return (
    <section id="features" className="py-32 px-4 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.06)_0%,transparent_50%)]" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-block px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono tracking-widest uppercase mb-6"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            Explore Features
          </motion.span>
          <h2 className="text-5xl md:text-7xl font-bold font-[Orbitron] mb-6 tracking-tight">
            <span className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
              Everything
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              You Need
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            A complete ecosystem for creators, learners, and innovators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
