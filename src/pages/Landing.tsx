import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Users, 
  Timer, 
  BarChart3,
  Music,
  MessageCircle,
  CheckSquare,
  Gamepad2,
  Star,
  ArrowRight,
  Sparkles,
  Rocket,
  Brain,
  Zap,
  Globe,
  Cpu,
  Layers
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import niranxLogo from '@/assets/niranx-logo.jpg';
import { useBeepSound } from "@/contexts/BeepSoundContext";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { playBeep } = useBeepSound();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    playBeep();
    navigate(user ? '/niranx/dashboard' : '/niranx/auth');
  };

  const handleClick = () => {
    playBeep();
  };

  const features = [
    { icon: Calendar, title: "Smart Scheduling", description: "AI-powered timetable generation and class scheduling" },
    { icon: BookOpen, title: "Study Materials", description: "Centralized hub for all your learning resources" },
    { icon: Timer, title: "Focus Engine", description: "Boost productivity with integrated focus sessions" },
    { icon: BarChart3, title: "Analytics", description: "Track your progress and performance metrics" },
    { icon: Brain, title: "AI Assistant", description: "Solve problems and get study help instantly" },
    { icon: Music, title: "XVibe Music", description: "Stream and discover music while studying" },
    { icon: Gamepad2, title: "Gamification", description: "Earn XP, unlock achievements, level up" },
    { icon: Users, title: "Collaboration", description: "Connect and study with peers" },
    { icon: Zap, title: "AI Tools", description: "Website generator, presentations & more" },
    { icon: Globe, title: "Web Platform", description: "Access anywhere, anytime on any device" },
    { icon: Cpu, title: "Edge Functions", description: "Lightning fast serverless computing" },
    { icon: Layers, title: "Multi-Platform", description: "Integrated ecosystem for everything" },
  ];

  const floatingElements = Array(30).fill(null).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 25 + 10,
    delay: Math.random() * 8,
  }));

  // Orbit animation elements
  const orbitElements = Array(8).fill(null).map((_, i) => ({
    id: i,
    angle: (360 / 8) * i,
    radius: 180 + Math.random() * 80,
    duration: 20 + Math.random() * 15,
    size: 4 + Math.random() * 4,
  }));

  return (
    <div className="min-h-screen bg-black overflow-x-hidden overflow-y-auto relative" onClick={handleClick}>
      {/* Video Background - Space & Tech Theme */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
          poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920"
        >
          <source src="https://cdn.pixabay.com/video/2020/03/29/34373-402429404_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-purple-950/20 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      {/* Animated Particles */}
      <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute rounded-full"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
              background: `radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(236,72,153,0.4) 100%)`,
              boxShadow: '0 0 10px rgba(139,92,246,0.5)',
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Orbiting Elements - Hidden on mobile for performance */}
      <div className="fixed inset-0 z-[1] hidden md:flex items-center justify-center pointer-events-none">
        <div className="relative w-[500px] h-[500px]">
          {orbitElements.map((el) => (
            <motion.div
              key={el.id}
              className="absolute left-1/2 top-1/2"
              style={{
                width: el.size,
                height: el.size,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: el.duration,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.div
                className="rounded-full bg-gradient-to-r from-primary to-pink-500"
                style={{
                  width: el.size,
                  height: el.size,
                  transform: `translateX(${el.radius}px)`,
                  boxShadow: '0 0 15px rgba(139,92,246,0.6)',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Cursor Glow - Hidden on mobile */}
      <motion.div
        className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-[2] hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 40%, transparent 70%)',
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content - Scrollable */}
      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-2 sm:space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-purple-600 p-0.5">
                  <img src={niranxLogo} alt="NiranX Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-primary bg-clip-text text-transparent">
                  StudyVerse
                </span>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 hidden sm:inline-flex">
                  by NiranX
                </Badge>
              </motion.div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link to="/xvibe">
                  <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                    <Music className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">XVibe</span>
                  </Button>
                </Link>
                <Link to="/niranx/auth">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white border-0">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center pt-20 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                className="mb-6 sm:mb-8 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-primary/20 to-pink-500/20 border border-primary/30 backdrop-blur-xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </motion.div>
                <span className="text-xs sm:text-sm font-medium text-white/90">Powered by NiranX & AI</span>
                <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 sm:mb-8 leading-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  One Platform.
                </span>
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200%" }}
                >
                  Infinite Possibilities.
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl text-white/60 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <span className="text-white/80 font-semibold">Study. Create. Collaborate. Stream.</span>
                <br />
                The all-in-one ecosystem for students, creators, and dreamers. 
                AI-powered tools, music streaming, and everything in between.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139,92,246,0.5)" }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    className="text-base sm:text-lg px-6 sm:px-10 py-6 sm:py-7 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 rounded-full shadow-lg shadow-primary/30 w-full sm:w-auto"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Launch Your Experience
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => { playBeep(); navigate('/xvibe'); }}
                    className="text-base sm:text-lg px-6 sm:px-10 py-6 sm:py-7 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full backdrop-blur-xl w-full sm:w-auto"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Explore XVibe Music
                  </Button>
                </motion.div>
              </motion.div>

              {/* Floating badges */}
              <motion.div 
                className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-2 sm:gap-3 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {['AI-Powered', 'Music Streaming', 'Study Tools', 'Gamification', 'Real-time Sync'].map((tag, i) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + i * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Badge variant="secondary" className="bg-white/5 text-white/70 border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm backdrop-blur-xl">
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 sm:py-32 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">About NiranX StudyVerse</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Built for the Next Generation
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/60 leading-relaxed mb-8">
                NiranX StudyVerse is more than just a study platform—it's a complete digital ecosystem designed for students, 
                creators, and lifelong learners. We combine cutting-edge AI technology with intuitive design to create 
                an all-in-one solution that adapts to your unique learning style.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                  <Brain className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">AI-First Approach</h3>
                  <p className="text-white/50 text-sm">Powered by advanced AI to personalize your experience</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                  <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Accessible Anywhere</h3>
                  <p className="text-white/50 text-sm">Web-based platform works on any device, anytime</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                  <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Community Driven</h3>
                  <p className="text-white/50 text-sm">Connect and collaborate with peers worldwide</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 sm:py-32 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto px-4">
                Everything you need to stay organized, focused, and connected
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 h-full">
                    <CardHeader className="pb-2 sm:pb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 border border-primary/20">
                        <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/50 text-sm sm:text-base">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-20 px-4 relative">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
              {[
                { value: '10,000+', label: 'Active Students' },
                { value: '500+', label: 'Universities' },
                { value: '95%', label: 'Success Rate' },
                { value: '24/7', label: 'AI Support' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-4 sm:p-6"
                >
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <p className="text-white/50 text-sm sm:text-base">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="container mx-auto text-center"
          >
            <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-primary/20 to-purple-600/20 border border-white/10 backdrop-blur-xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
                Ready to Transform Your Studies?
              </h2>
              <p className="text-lg sm:text-xl text-white/60 mb-8 sm:mb-10">
                Join thousands of students already using StudyVerse to excel
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 bg-white text-black hover:bg-white/90 rounded-full font-semibold"
                >
                  Start Your Journey Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Comprehensive Footer */}
        <footer className="py-12 sm:py-16 px-4 border-t border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="container mx-auto">
            {/* Footer Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-12">
              {/* Brand Column */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-6 lg:mb-0">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <img src={niranxLogo} alt="NiranX Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xl font-bold text-white">StudyVerse</span>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  The all-in-one platform for students, creators, and dreamers. Powered by NiranX & AI.
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">AI Powered</Badge>
                </div>
              </div>

              {/* Platform Links */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Platform</h4>
                <div className="space-y-2 sm:space-y-3">
                  <Link to="/niranx/dashboard" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Dashboard</Link>
                  <Link to="/xvibe" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">XVibe Music</Link>
                  <Link to="/niranx/ai-corner" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">AI Tools</Link>
                  <Link to="/niranx/scheduler" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Smart Scheduler</Link>
                  <Link to="/niranx/focus" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Focus Engine</Link>
                  <Link to="/niranx/labs" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Virtual Labs</Link>
                </div>
              </div>

              {/* Features Links */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Features</h4>
                <div className="space-y-2 sm:space-y-3">
                  <Link to="/niranx/analytics" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Analytics</Link>
                  <Link to="/niranx/messages" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Messages</Link>
                  <Link to="/niranx/debates" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Debate Hub</Link>
                  <Link to="/niranx/leaderboard" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Leaderboard</Link>
                  <Link to="/niranx/daily-rewards" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Daily Rewards</Link>
                  <Link to="/niranx/study-groups" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Study Groups</Link>
                </div>
              </div>

              {/* Support Links */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Support</h4>
                <div className="space-y-2 sm:space-y-3">
                  <Link to="/support/help" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Help Centre</Link>
                  <Link to="/support/contact" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Contact Us</Link>
                  <Link to="/niranx/guide" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">User Guide</Link>
                  <Link to="/niranx/feedback" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Submit Feedback</Link>
                  <Link to="/niranx/suggestions" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Feature Suggestions</Link>
                </div>
              </div>

              {/* Legal Links */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Legal</h4>
                <div className="space-y-2 sm:space-y-3">
                  <Link to="/support/privacy" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Privacy Policy</Link>
                  <Link to="/support/terms" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Terms & Conditions</Link>
                  <a href="mailto:barhateniranjan725@gmail.com" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">Email Us</a>
                  <a href="https://niranx.com" target="_blank" rel="noopener noreferrer" className="block text-white/50 hover:text-white text-xs sm:text-sm transition-colors">niranx.com</a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded overflow-hidden">
                    <img src={niranxLogo} alt="NiranX Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-semibold text-white">StudyVerse</span>
                  <span className="text-white/30">|</span>
                  <span className="text-white/40 text-sm">by NiranX Developers</span>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40">
                  <Link to="/support/privacy" className="hover:text-white transition-colors">Privacy</Link>
                  <Link to="/support/terms" className="hover:text-white transition-colors">Terms</Link>
                  <Link to="/support/contact" className="hover:text-white transition-colors">Contact</Link>
                </div>
                <p className="text-white/40 text-xs sm:text-sm">
                  © {new Date().getFullYear()} StudyVerse. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
