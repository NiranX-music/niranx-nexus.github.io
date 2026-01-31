import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  FolderOpen,
  Users,
  Zap,
  Shield,
  Disc3,
  ArrowRight,
  Smartphone,
  Sparkles,
  Repeat,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Smart Calendar',
    description: 'Drag-and-drop events, RSVP tracking, conflict detection for your band schedule.',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    description: 'Threaded conversations, voice notes, reactions, and typing indicators.',
  },
  {
    icon: FolderOpen,
    title: 'File Hub',
    description: 'Cloud storage with version history, audio waveforms, and timestamp comments.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Invite members, assign roles, manage permissions for your entire crew.',
  },
  {
    icon: Zap,
    title: 'Real-Time Sync',
    description: 'Everything updates instantly across all devices. No refresh needed.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Role-based access control. Your music stays your music.',
  },
];

const benefits = [
  { icon: Smartphone, text: 'Mobile-first PWA that works offline' },
  { icon: Sparkles, text: 'AI assists creativity without replacing it' },
  { icon: Repeat, text: 'One account for unlimited artists/bands/projects' },
];

export const XstageLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/xstage/app');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-background to-fuchsia-500/10" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500">
              <Disc3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              Xstage
            </span>
          </div>
          <Button onClick={handleGetStarted} variant="outline" className="border-cyan-500/50 hover:bg-cyan-500/10">
            {user ? 'Go to App' : 'Sign In'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Your band's{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse">
              command center
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Replace WhatsApp groups, Google Drive chaos, and scattered notes with one unified platform
            built for musicians, bands, and creative teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-white"
            >
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-cyan-400">∞</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-fuchsia-400">100%</div>
              <div className="text-sm text-muted-foreground">Real-time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">$0</div>
              <div className="text-sm text-muted-foreground">To Start</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground">One platform to run your entire music operation</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-cyan-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for musicians</h2>
          </motion.div>

          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30"
              >
                <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center shrink-0">
                  <benefit.icon className="h-5 w-5 text-fuchsia-400" />
                </div>
                <span className="text-foreground">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border border-border/50"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to upgrade your workflow?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join bands and artists who've ditched the chaos for a unified command center.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 text-white"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Xstage. Part of NiranX Platform.</p>
        </div>
      </footer>
    </div>
  );
};
