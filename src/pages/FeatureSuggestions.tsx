import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Brain, 
  Users, 
  Zap, 
  Calendar,
  BookOpen,
  Trophy,
  MessageCircle,
  Video,
  FileText,
  Target,
  Share2,
  Clock,
  Award,
  Mic,
  Palette,
  Bot,
  Bell
} from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: any;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const FeatureSuggestions = () => {
  const suggestions: Feature[] = [
    {
      title: 'AI Study Assistant Chat',
      description: 'Real-time AI tutor that answers questions, explains concepts, and provides study guidance',
      icon: Bot,
      category: 'AI Features',
      priority: 'high'
    },
    {
      title: 'Collaborative Study Rooms',
      description: 'Virtual study rooms with video/audio, shared whiteboard, and screen sharing',
      icon: Video,
      category: 'Collaboration',
      priority: 'high'
    },
    {
      title: 'Smart Note Taking',
      description: 'AI-powered notes with automatic organization, tagging, and cross-linking',
      icon: FileText,
      category: 'Productivity',
      priority: 'high'
    },
    {
      title: 'Spaced Repetition Flashcards',
      description: 'Intelligent flashcard system using spaced repetition algorithm for optimal memorization',
      icon: Brain,
      category: 'Learning',
      priority: 'high'
    },
    {
      title: 'Voice Command Control',
      description: 'Hands-free control using voice commands for timer, tasks, and navigation',
      icon: Mic,
      category: 'Accessibility',
      priority: 'medium'
    },
    {
      title: 'Study Buddy Matching',
      description: 'AI-powered matching system to find study partners based on subjects and learning style',
      icon: Users,
      category: 'Social',
      priority: 'medium'
    },
    {
      title: 'Real-time Notifications',
      description: 'Push notifications for tasks, study reminders, and group activities',
      icon: Bell,
      category: 'Productivity',
      priority: 'medium'
    },
    {
      title: 'Study Streak Challenges',
      description: 'Daily/weekly challenges with team competitions and rewards',
      icon: Trophy,
      category: 'Gamification',
      priority: 'medium'
    },
    {
      title: 'AI Quiz Generator',
      description: 'Automatically generate quizzes from study materials and notes',
      icon: Target,
      category: 'AI Features',
      priority: 'high'
    },
    {
      title: 'Mind Map Creator',
      description: 'Visual mind mapping tool for brainstorming and concept connections',
      icon: Share2,
      category: 'Learning',
      priority: 'medium'
    },
    {
      title: 'Focus Music Generator',
      description: 'AI-generated study music based on your mood and focus level',
      icon: Zap,
      category: 'Focus',
      priority: 'low'
    },
    {
      title: 'Progress Dashboard',
      description: 'Advanced analytics showing study patterns, weak areas, and improvement trends',
      icon: Award,
      category: 'Analytics',
      priority: 'high'
    },
    {
      title: 'Calendar Integration',
      description: 'Sync with Google Calendar, Outlook, and other calendar services',
      icon: Calendar,
      category: 'Integration',
      priority: 'medium'
    },
    {
      title: 'Resource Library Sharing',
      description: 'Share and discover study materials from other students and teachers',
      icon: BookOpen,
      category: 'Collaboration',
      priority: 'medium'
    },
    {
      title: 'Custom Themes & Skins',
      description: 'Personalize your workspace with custom themes, colors, and layouts',
      icon: Palette,
      category: 'Customization',
      priority: 'low'
    },
    {
      title: 'Distraction Blocker',
      description: 'Block distracting websites and apps during study sessions',
      icon: Clock,
      category: 'Focus',
      priority: 'high'
    }
  ];

  const categories = Array.from(new Set(suggestions.map(s => s.category)));
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Feature Suggestions</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Potential features to enhance NiranX StudyVerse and take your learning experience to the next level
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {categories.map(category => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-2xl">{category}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {suggestions
                .filter(s => s.category === category)
                .map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Have More Ideas?</h3>
          <p className="text-muted-foreground mb-4">
            Submit your own feature requests and vote on ideas from the community!
          </p>
          <a href="/feature-requests" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            <Sparkles className="w-4 h-4" />
            Request a Feature
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureSuggestions;
