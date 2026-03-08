import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Users, Sparkles, Globe, Zap } from 'lucide-react';

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: 'Active Users', color: 'from-violet-500 to-purple-600' },
  { icon: Sparkles, value: 60, suffix: '+', label: 'AI Models', color: 'from-cyan-500 to-blue-600' },
  { icon: Globe, value: 100, suffix: '+', label: 'Countries', color: 'from-emerald-500 to-teal-600' },
  { icon: Zap, value: 99.9, suffix: '%', label: 'Uptime', color: 'from-amber-500 to-orange-600' },
];

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else { setCount(Math.floor(current * 10) / 10); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, inView]);
  return <span>{value % 1 === 0 ? Math.floor(count).toLocaleString() : count.toFixed(1)}{suffix}</span>;
}

export function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={ref} className="py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04)_0%,transparent_60%)]" />
      
      <motion.div style={{ y }} className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 60, scale: 0.8, rotateX: 30 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.7, type: 'spring' }}
              className="text-center"
              style={{ transformPerspective: 800 }}
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 8 }}
                className="relative mx-auto mb-5"
              >
                <div className={`w-18 h-18 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl w-[72px] h-[72px]`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className={`absolute inset-0 mx-auto w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${stat.color} opacity-30 blur-2xl`} />
              </motion.div>
              <div className="text-4xl md:text-5xl font-bold font-[Orbitron] mb-2 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
              </div>
              <p className="text-muted-foreground font-medium text-sm tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
