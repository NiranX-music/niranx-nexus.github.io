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
  Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import niranxLogo from '@/assets/niranx-logo.jpg';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    navigate(user ? '/niranx/dashboard' : '/niranx/auth');
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
  ];

  const floatingElements = Array(20).fill(null).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920"
        >
          <source src="https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Animated Particles */}
      <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
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

      {/* Cursor Glow */}
      <motion.div
        className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-white/80">Powered by AI</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Your Ultimate
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Learning Companion
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
                The all-in-one platform for students to organize, collaborate, and excel. 
                From smart scheduling to AI-powered study tools, we've got everything you need.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white border-0 rounded-full"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/xvibe')}
                    className="text-lg px-10 py-7 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Explore XVibe Music
                  </Button>
                </motion.div>
              </div>
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
