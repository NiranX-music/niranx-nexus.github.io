import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BarChart3, Bell, CheckSquare, Brain, Users, Zap } from 'lucide-react';

export function ProductPreview() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04)_0%,transparent_50%)]" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-primary/70 mb-4 block">
              Dashboard Preview
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron] tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Your Command Center
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A unified dashboard that brings together AI tools, study analytics, task management, 
              and real-time collaboration — all in one beautiful interface.
            </p>

            <div className="space-y-4">
              {[
                { icon: BarChart3, text: 'Real-time study analytics and progress tracking' },
                { icon: Brain, text: 'AI-powered recommendations for optimal learning' },
                { icon: Users, text: 'Collaborate with study groups worldwide' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating Mockup */}
          <motion.div
            ref={mockupRef}
            onMouseMove={handleMouseMove}
            style={{ y, rotateX, scale, perspective: 1200 }}
          >
            <motion.div
              animate={{
                rotateY: (mousePos.x - 0.5) * 6,
                rotateX: -(mousePos.y - 0.5) * 6,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative"
            >
              {/* Glow behind mockup */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-[2rem] blur-2xl" />

              {/* Mockup frame */}
              <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-card/80 backdrop-blur-2xl shadow-2xl shadow-primary/10">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/60">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-mono text-muted-foreground">NiranX Dashboard</span>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-4 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Study Hours', value: '24.5h', change: '+12%' },
                      { label: 'Tasks Done', value: '47', change: '+8' },
                      { label: 'AI Credits', value: '850', change: '∞' },
                    ].map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="p-3 rounded-xl bg-muted/30 border border-border/20"
                      >
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-lg font-bold font-[Orbitron]">{s.value}</p>
                        <p className="text-xs text-primary">{s.change}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="h-32 rounded-xl bg-muted/20 border border-border/20 flex items-end p-3 gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/40 to-primary/80"
                      />
                    ))}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {['Complete AI Course Module 3', 'Review flashcards', 'Study group meeting'].map((task, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.0 + i * 0.1 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/10"
                      >
                        <CheckSquare className="w-4 h-4 text-primary/60" />
                        <span className="text-xs text-muted-foreground">{task}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 p-3 rounded-xl bg-card/90 backdrop-blur-xl border border-primary/30 shadow-lg shadow-primary/10"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">+50 XP earned!</span>
                </div>
              </motion.div>

              {/* Floating AI badge */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-3 -left-3 p-2.5 rounded-lg bg-card/90 backdrop-blur-xl border border-accent/30 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-mono text-accent">AI Active</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
