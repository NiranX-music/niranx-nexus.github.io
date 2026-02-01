import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Music, BookOpen, Rocket, Gamepad2, Video, 
  MessageSquare, Code, Palette, Globe, Zap, Shield 
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Hub', desc: '60+ AI models at your fingertips', color: 'from-violet-500 to-purple-600', path: '/nexus/ai-hub' },
  { icon: Music, title: 'XVibe Music', desc: 'Stream unlimited tracks', color: 'from-emerald-500 to-teal-600', path: '/xvibe/welcome' },
  { icon: BookOpen, title: 'Learn Zone', desc: 'Interactive courses & quizzes', color: 'from-blue-500 to-cyan-600', path: '/nexus/learn' },
  { icon: Rocket, title: 'Projects', desc: 'Build and showcase your work', color: 'from-orange-500 to-amber-600', path: '/nexus/projects' },
  { icon: Gamepad2, title: 'Gaming', desc: 'Play and compete online', color: 'from-pink-500 to-rose-600', path: '/nexus/games' },
  { icon: Video, title: 'Streaming', desc: 'Watch and create content', color: 'from-red-500 to-orange-600', path: '/nexus/streaming' },
  { icon: MessageSquare, title: 'Community', desc: 'Connect with creators', color: 'from-indigo-500 to-violet-600', path: '/nexus/community' },
  { icon: Code, title: 'Dev Tools', desc: 'Code editors & APIs', color: 'from-slate-500 to-zinc-600', path: '/nexus/dev-tools' },
  { icon: Palette, title: 'Creative', desc: 'Design & art tools', color: 'from-fuchsia-500 to-pink-600', path: '/nexus/creative' },
  { icon: Globe, title: 'Web Apps', desc: 'Explore mini applications', color: 'from-cyan-500 to-blue-600', path: '/nexus/apps' },
  { icon: Zap, title: 'Automation', desc: 'Workflows & integrations', color: 'from-yellow-500 to-orange-600', path: '/nexus/automation' },
  { icon: Shield, title: 'Security', desc: 'Privacy & protection', color: 'from-green-500 to-emerald-600', path: '/nexus/security' },
];

export function FeaturesGrid3D() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            Explore Features
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold font-[Orbitron] mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete ecosystem designed for creators, learners, and innovators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.2 } 
              }}
              onClick={() => navigate(feature.path)}
              className="group cursor-pointer"
            >
              <div className="relative h-full p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.desc}
                </p>
                
                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <Rocket className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
