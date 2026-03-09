import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Code, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TiltState {
  rotateX: number;
  rotateY: number;
  shadowX: number;
  shadowY: number;
}

const cards = [
  {
    icon: Brain,
    title: 'AI Builder',
    description: 'Create apps instantly with AI. 60+ models for chat, vision, code generation and more.',
    action: 'Explore AI',
    path: '/ai-corner',
    gradient: 'from-violet-500/20 to-purple-600/20',
    glow: 'violet',
  },
  {
    icon: Code,
    title: 'Code Import',
    description: 'Upload projects from GitHub or files. Collaborate in real-time with your team.',
    action: 'Start Coding',
    path: '/code-playground',
    gradient: 'from-cyan-500/20 to-blue-600/20',
    glow: 'cyan',
  },
  {
    icon: Rocket,
    title: 'Deploy Instantly',
    description: 'Launch apps with a unique URL. Zero config hosting with edge functions.',
    action: 'Deploy Now',
    path: '/nexus/projects',
    gradient: 'from-amber-500/20 to-orange-600/20',
    glow: 'amber',
  },
];

function Tilt3DCard({ card, index }: { card: typeof cards[0]; index: number }) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 20,
      rotateY: x * 20,
      shadowX: x * 30,
      shadowY: y * 30,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 0 });
    setIsHovered(false);
  }, []);

  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, rotateX: 35, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: index * 0.15, type: 'spring', stiffness: 80 }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative group cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glow effect behind card */}
        <motion.div
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          className={`absolute -inset-2 rounded-[2rem] bg-gradient-to-br ${card.gradient} blur-xl`}
          style={{ transform: 'translateZ(-20px)' }}
        />

        <div
          className="relative p-8 rounded-[1.5rem] bg-card/50 backdrop-blur-2xl border border-border/30 hover:border-primary/40 transition-all duration-500 overflow-hidden"
          style={{
            boxShadow: isHovered
              ? `${tilt.shadowX}px ${tilt.shadowY}px 40px -10px hsl(var(--primary) / 0.15)`
              : '0 10px 40px -10px hsl(var(--primary) / 0.05)',
          }}
        >
          {/* Light reflection */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: isHovered
                ? `radial-gradient(circle at ${50 + tilt.rotateY * 3}% ${50 - tilt.rotateX * 3}%, hsl(var(--primary) / 0.08), transparent 60%)`
                : 'none',
            }}
          />

          {/* Scanning line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={isHovered ? { top: ['0%', '100%'] } : { top: '0%' }}
            transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
          />

          <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 border border-primary/20`}>
              <Icon className="w-7 h-7 text-primary" />
            </div>

            <h3 className="text-2xl font-bold font-[Orbitron] mb-3 tracking-tight">{card.title}</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">{card.description}</p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(card.path)}
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-primary"
            >
              {card.action}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Cards3DScroll() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={sectionRef} className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06)_0%,transparent_50%)]" />

      <motion.div style={{ y }} className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-primary/70 mb-4 block">
            Core Platform
          </span>
          <h2 className="text-4xl md:text-6xl font-bold font-[Orbitron] tracking-tight mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Build the Future Faster
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three pillars that power every project on NiranX
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <Tilt3DCard key={card.title} card={card} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
