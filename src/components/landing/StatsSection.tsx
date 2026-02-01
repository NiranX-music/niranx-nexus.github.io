import { motion, useInView } from 'framer-motion';
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
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, inView]);

  return (
    <span>
      {value % 1 === 0 ? Math.floor(count).toLocaleString() : count.toFixed(1)}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="w-8 h-8 text-white" />
              </motion.div>
              <div className="text-4xl md:text-5xl font-bold font-[Orbitron] mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
