import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Clock, Calendar, BookOpen, ArrowRight, Info, Brain, Timer, Search, FileMusic, Headphones, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const archivedPages = [
  {
    id: 'nexus-ai',
    title: 'NiranX Nexus AI',
    description: 'Multi-model AI chat with Bytez API integration',
    icon: Brain,
    route: '/bytez-ai',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    features: ['Multiple AI models', 'Vision capabilities', 'Code assistance'],
    reason: 'Replaced by AI Chat Hub with better model switching',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    description: 'Classic 25-minute focus sessions with break intervals',
    icon: Timer,
    route: '/pomodoro',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    features: ['25/5 minute intervals', 'Session tracking', 'Break reminders'],
    reason: 'Merged into Focus Engine with Havoc Mode',
  },
  {
    id: 'timetable',
    title: 'Smart Timetable',
    description: 'Weekly schedule planner with time slots and subjects',
    icon: Calendar,
    route: '/smart-timetable',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    features: ['Weekly view', 'Subject organization', 'Time management'],
    reason: 'Replaced by Auto Study Planner with AI scheduling',
  },
  {
    id: 'library',
    title: 'Library',
    description: 'Study materials and resource collection',
    icon: BookOpen,
    route: '/library',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    features: ['Resource storage', 'Material organization', 'Quick access'],
    reason: 'Replaced by File Hub with cloud integration',
  },
  {
    id: 'global-search',
    title: 'Global Search',
    description: 'Search across all app content',
    icon: Search,
    route: '/search',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    features: ['Cross-app search', 'Quick navigation', 'Recent searches'],
    reason: 'Integrated into sidebar search',
  },
  {
    id: 'listed-songs',
    title: 'Listed Songs',
    description: 'Old music listing system',
    icon: FileMusic,
    route: '/music/listed-songs',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    features: ['Song lists', 'Basic playback', 'Favorites'],
    reason: 'Replaced by XVibe music platform',
  },
  {
    id: 'old-music-hub',
    title: 'Old Music Hub',
    description: 'Legacy music player interface',
    icon: Headphones,
    route: '/music-hub',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    features: ['Music playback', 'Playlists', 'Queue management'],
    reason: 'Replaced by XVibe with artist features',
  },
  {
    id: 'old-music-library',
    title: 'Old Music Library',
    description: 'Legacy music collection manager',
    icon: Headphones,
    route: '/music/library',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    features: ['Library management', 'Album views', 'Artist sorting'],
    reason: 'Replaced by XVibe library',
  },
  {
    id: 'listening-library',
    title: 'Listening Library',
    description: 'Audio content collection',
    icon: Headphones,
    route: '/listening-library',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    features: ['Podcasts', 'Audiobooks', 'Audio notes'],
    reason: 'Merged into XVibe and Focus Sounds',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function OldPageArchive() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-3 rounded-2xl bg-gradient-to-br from-muted to-muted/50">
          <Archive className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Archived Features
          </h1>
          <p className="text-muted-foreground">
            Previous versions preserved for reference and legacy access
          </p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Why are these features archived?
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These features have been replaced with newer, more powerful alternatives that offer better 
                  performance, more capabilities, and improved user experience. The archived pages remain 
                  accessible for users who need to access historical data or prefer the classic interface.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-warning/20 bg-gradient-to-r from-warning/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  Limited Support
                </p>
                <p className="text-sm text-muted-foreground">
                  Archived features may not receive updates or bug fixes. For the best experience, 
                  we recommend using the modern alternatives listed below each archived feature.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Archived Pages Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {archivedPages.map((page) => (
          <motion.div key={page.id} variants={itemVariants}>
            <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${page.bgColor} ${page.color} transition-transform duration-300 group-hover:scale-110`}>
                    <page.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-muted/80">
                    Archived
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-xl">{page.title}</CardTitle>
                <CardDescription className="text-sm">{page.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
                  <ul className="space-y-1.5">
                    {page.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-muted">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Replaced by:</span> {page.reason}
                  </p>
                </div>

                <Button
                  onClick={() => navigate(page.route)}
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                >
                  Open Archived Page
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              Modern Alternatives
            </CardTitle>
            <CardDescription>
              Try these newer features with enhanced capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "Focus Engine",
                description: "Enhanced Pomodoro + Havoc Mode with better tracking and analytics",
                route: "/focus-engine",
              },
              {
                title: "Auto Study Planner",
                description: "AI-powered scheduling that adapts to your learning style",
                route: "/auto-study-planner",
              },
              {
                title: "File Hub",
                description: "Modern file management with cloud storage and organization",
                route: "/file-hub",
              },
              {
                title: "XVibe Music",
                description: "Full-featured music platform with artist profiles and streaming",
                route: "/xvibe",
              },
              {
                title: "AI Chat Hub",
                description: "Multi-model AI with provider switching and conversation history",
                route: "/groq-chat",
              },
            ].map((item, index) => (
              <motion.div
                key={item.route}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300 group"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(item.route)}
                  className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  Visit
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
