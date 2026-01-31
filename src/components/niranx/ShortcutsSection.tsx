import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from './GlassCard';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Music, 
  BookOpen, 
  Brain, 
  Palette, 
  MessageCircle,
  Rocket,
  ArrowRight
} from 'lucide-react';

const shortcuts = [
  {
    icon: Brain,
    title: 'XNexus AI',
    description: '60+ AI models for text, vision, audio & more',
    path: '/xnexus-ai',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Music,
    title: 'XVibe Music',
    description: 'Stream and discover amazing music',
    path: '/xvibe',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: BookOpen,
    title: 'StudyVerse',
    description: 'AI-powered study tools and resources',
    path: '/dashboard',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: MessageCircle,
    title: 'Bytez Chat',
    description: 'Advanced AI conversations',
    path: '/bytez',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Palette,
    title: 'Creative Tools',
    description: 'Generate images, presentations & more',
    path: '/ai-hub',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Rocket,
    title: 'Nexus Portal',
    description: 'Your gateway to all tools',
    path: '/nexus',
    gradient: 'from-amber-500 to-orange-500',
  },
];

export function ShortcutsSection() {
  const navigate = useNavigate();

  return (
    <section id="shortcuts" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
            <Sparkles className="w-3 h-3 mr-1" /> Quick Access
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron]">
            Explore <span className="text-primary">Features</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Jump straight into any of our powerful tools and features
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortcuts.map((shortcut, index) => (
            <motion.div
              key={shortcut.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full group cursor-pointer hover:border-primary/50 transition-all duration-300">
                <div 
                  className="p-6"
                  onClick={() => navigate(shortcut.path)}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${shortcut.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <shortcut.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{shortcut.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{shortcut.description}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group/btn p-0 h-auto hover:bg-transparent"
                  >
                    Explore 
                    <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
