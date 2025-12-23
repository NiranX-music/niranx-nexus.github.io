import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  Music, 
  Brain, 
  Users, 
  Timer, 
  BarChart3, 
  Gamepad2,
  MessageCircle,
  FileText,
  Video,
  Palette,
  Shield,
  Settings,
  Zap,
  GraduationCap,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import niranxLogo from '@/assets/niranx-logo.jpg';

const HelpCentre = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "Dashboard",
      description: "Your personalized study hub. View your progress, upcoming tasks, daily challenges, and quick access to all features.",
      link: "/niranx/dashboard"
    },
    {
      icon: Calendar,
      title: "Smart Scheduler",
      description: "AI-powered timetable generation. Create and manage your class schedules, set reminders, and never miss a deadline.",
      link: "/niranx/scheduler"
    },
    {
      icon: BookOpen,
      title: "Study Materials Hub",
      description: "Centralized storage for all your study resources. Upload, organize, and access notes, PDFs, and documents.",
      link: "/niranx/file-hub"
    },
    {
      icon: Timer,
      title: "Focus Engine",
      description: "Boost productivity with Pomodoro timer, focus modes, and distraction blockers. Track your study sessions.",
      link: "/niranx/focus"
    },
    {
      icon: Brain,
      title: "AI Solver",
      description: "Get instant help with homework and problems. Upload images or type questions for AI-powered solutions.",
      link: "/niranx/ai/solver"
    },
    {
      icon: MessageCircle,
      title: "AI Chat",
      description: "Your personal AI study assistant. Ask questions, get explanations, and learn interactively.",
      link: "/niranx/ai/chat"
    },
    {
      icon: Music,
      title: "XVibe Music",
      description: "Stream music while studying. Discover new artists, create playlists, and enjoy ad-free listening.",
      link: "/xvibe"
    },
    {
      icon: Video,
      title: "Video Library",
      description: "Access educational videos, lectures, and tutorials. Learn visually with curated content.",
      link: "/niranx/video-library"
    },
    {
      icon: FileText,
      title: "Note Summarizer",
      description: "Upload notes or PDFs and get AI-generated summaries. Save time with quick content digests.",
      link: "/niranx/ai/summarize"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your study patterns, focus time, and progress. Visualize your learning journey with charts.",
      link: "/niranx/analytics"
    },
    {
      icon: Gamepad2,
      title: "Gamification",
      description: "Earn XP, complete challenges, unlock achievements, and climb the leaderboard. Make learning fun!",
      link: "/niranx/leaderboard"
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Connect with classmates, join study groups, and collaborate on projects together.",
      link: "/niranx/study-groups"
    },
    {
      icon: Palette,
      title: "Theme Customization",
      description: "Personalize your experience with custom themes, colors, and appearance settings.",
      link: "/niranx/theme-customization"
    },
    {
      icon: Zap,
      title: "AI Tools",
      description: "Generate presentations, websites, topic maps, and more with AI-powered creation tools.",
      link: "/niranx/ai-corner"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Manage your account security, enable 2FA, view active sessions, and control privacy settings.",
      link: "/niranx/security/sessions"
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Configure notifications, appearance, audio, privacy, and data management preferences.",
      link: "/niranx/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img src={niranxLogo} alt="NiranX Logo" className="w-10 h-10 rounded-xl" />
              <span className="text-2xl font-bold">NiranX</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/support/contact">
                <Button variant="ghost">Contact</Button>
              </Link>
              <Link to="/niranx/auth">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Centre</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Welcome to NiranX StudyVerse! Discover all the powerful features designed to enhance your learning experience.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search for help..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to StudyVerse by NiranX</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              StudyVerse is your all-in-one digital learning platform designed to help students organize, 
              collaborate, and excel in their academic journey. Whether you're preparing for exams, 
              managing your schedule, or looking for study resources, we've got you covered.
            </p>
            <p className="mt-4">
              Our platform combines smart scheduling, AI-powered study tools, music streaming, 
              gamification, and collaboration features to create the ultimate learning experience. 
              With XVibe Music integration, you can even enjoy your favorite tunes while studying.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <h2 className="text-2xl font-bold mb-6">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Link to={feature.link} key={index}>
              <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Getting Started */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold">Create Your Account</h3>
                <p className="text-muted-foreground">Sign up with your email or continue with Google/Apple.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold">Set Up Your Profile</h3>
                <p className="text-muted-foreground">Personalize your experience with your study preferences.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold">Explore Features</h3>
                <p className="text-muted-foreground">Start using the scheduler, AI tools, and study resources.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold">Earn & Level Up</h3>
                <p className="text-muted-foreground">Complete tasks, earn XP, and unlock achievements!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Need More Help */}
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Still Need Help?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to assist you with any questions or issues.
            </p>
            <Link to="/support/contact">
              <Button size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} NiranX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HelpCentre;
