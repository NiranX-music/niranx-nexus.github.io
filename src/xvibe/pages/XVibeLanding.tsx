import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Music, Headphones, Radio, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function XVibeLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { icon: Music, title: 'Unlimited Music', desc: 'Stream millions of tracks' },
    { icon: Headphones, title: 'Premium Quality', desc: 'Crystal clear audio' },
    { icon: Radio, title: 'AI DJ Mode', desc: 'Personalized radio experience' },
    { icon: Mic2, title: 'Artist Studio', desc: 'Upload and share your music' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-[#1DB954]/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-[#5038a0]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
              <Music className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">XVibe</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button
                onClick={() => navigate('/xvibe')}
                className="bg-white text-black hover:bg-white/90 font-semibold"
              >
                Open App
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/xvibe/login')}
                  className="text-white hover:text-white hover:bg-white/10 font-semibold"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate('/xvibe/signup')}
                  className="bg-white text-black hover:bg-white/90 font-semibold"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              Feel the <span className="text-[#1DB954]">Vibe</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-2xl mx-auto">
              Play the sound. Stream unlimited music, discover new artists, and create your perfect playlist.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/xvibe' : '/xvibe/signup')}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-lg px-8 py-6 rounded-full"
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/xvibe/search')}
                className="border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 rounded-full"
              >
                Browse Music
              </Button>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-1/4 left-10 w-20 h-20 bg-[#1DB954]/30 rounded-full blur-xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-10 w-32 h-32 bg-[#5038a0]/30 rounded-full blur-xl"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Why XVibe?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-[#1DB954]/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1DB954]/20 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#1DB954]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-[#1DB954] to-[#1ed760] rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Ready to vibe?
            </h2>
            <p className="text-black/70 text-lg mb-8">
              Join millions of music lovers. Start your journey today.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(user ? '/xvibe' : '/xvibe/signup')}
              className="bg-black text-white hover:bg-black/90 font-bold text-lg px-8 py-6 rounded-full"
            >
              Start Listening Now
            </Button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-[#1DB954]" />
              <span className="text-white/60">© 2024 XVibe</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
