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
    <div className="min-h-screen bg-black overflow-hidden relative" onClick={handleClick}>
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

      {/* Orbiting Elements */}
      <div className="fixed inset-0 z-[1] flex items-center justify-center pointer-events-none">
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

      {/* Cursor Glow */}
      <motion.div
        className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-[2]"
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

      {/* Content */}
      <div className="relative z-10 min-h-screen overflow-y-auto">
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
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-purple-600 p-0.5">
                  <img src={niranxLogo} alt="NiranX Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-primary bg-clip-text text-transparent">
                  StudyVerse
                </span>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  by NiranX
                </Badge>
              </motion.div>
              <div className="flex items-center space-x-4">
                <Link to="/xvibe">
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                    <Music className="w-4 h-4 mr-2" />
                    XVibe Music
                  </Button>
                </Link>
                <Link to="/niranx/auth">
                  <Button className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white border-0">
                    Get Started
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
                className="mb-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-pink-500/20 border border-primary/30 backdrop-blur-xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-white/90">Powered by NiranX & AI</span>
                <Cpu className="w-4 h-4 text-pink-400" />
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
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
                className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
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
                className="flex flex-col sm:flex-row justify-center gap-4"
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
                    className="text-lg px-10 py-7 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 rounded-full shadow-lg shadow-primary/30"
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
                    className="text-lg px-10 py-7 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full backdrop-blur-xl"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Explore XVibe Music
                  </Button>
                </motion.div>
              </motion.div>

              {/* Floating badges */}
              <motion.div 
                className="mt-16 flex flex-wrap justify-center gap-3"
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
                    <Badge variant="secondary" className="bg-white/5 text-white/70 border-white/10 px-4 py-2 text-sm backdrop-blur-xl">
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-xl text-white/50 max-w-2xl mx-auto">
                Everything you need to stay organized, focused, and connected
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                        <feature.icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/50">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 relative">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
                  className="p-6"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <p className="text-white/50">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="container mx-auto text-center"
          >
            <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-to-r from-primary/20 to-purple-600/20 border border-white/10 backdrop-blur-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Studies?
              </h2>
              <p className="text-xl text-white/60 mb-10">
                Join thousands of students already using StudyVerse to excel
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="text-lg px-12 py-7 bg-white text-black hover:bg-white/90 rounded-full font-semibold"
                >
                  Start Your Journey Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-white mb-4">Platform</h4>
                <div className="space-y-2">
                  <Link to="/niranx/dashboard" className="block text-white/50 hover:text-white text-sm">Dashboard</Link>
                  <Link to="/xvibe" className="block text-white/50 hover:text-white text-sm">XVibe Music</Link>
                  <Link to="/niranx/ai-corner" className="block text-white/50 hover:text-white text-sm">AI Tools</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Support</h4>
                <div className="space-y-2">
                  <Link to="/support/help" className="block text-white/50 hover:text-white text-sm">Help Centre</Link>
                  <Link to="/support/contact" className="block text-white/50 hover:text-white text-sm">Contact Us</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <div className="space-y-2">
                  <Link to="/support/privacy" className="block text-white/50 hover:text-white text-sm">Privacy Policy</Link>
                  <Link to="/support/terms" className="block text-white/50 hover:text-white text-sm">Terms & Conditions</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Connect</h4>
                <div className="space-y-2">
                  <a href="mailto:barhateniranjan725@gmail.com" className="block text-white/50 hover:text-white text-sm">Email Us</a>
                  <a href="https://niranx.com" className="block text-white/50 hover:text-white text-sm">niranx.com</a>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img src={niranxLogo} alt="NiranX Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-bold text-white">StudyVerse</span>
              </div>
              <p className="text-white/40">
                By <span className="text-primary font-semibold">NiranX Developers</span>
              </p>
              <p className="text-white/40">
                © {new Date().getFullYear()} StudyVerse. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
