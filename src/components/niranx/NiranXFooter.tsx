import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Instagram, Youtube, Music, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import niranxLogo from '@/assets/niranx-logo.jpg';

const socialLinks = [
  { icon: Github, href: 'https://github.com/niranx', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/niranx', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/niranx', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@niranx', label: 'YouTube' },
  { icon: Music, href: 'https://open.spotify.com', label: 'Spotify' },
];

export function NiranXFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative py-16 px-4 border-t border-border/30">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-accent p-0.5">
                <img src={niranxLogo} alt="NiranX" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="text-xl font-bold font-[Orbitron]">NiranX Universe</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A creative hub for innovation, music, and technology. 
              Building the future, one project at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Home</Link>
              <Link to="/nexus" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Nexus Portal</Link>
              <Link to="/songs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Songs</Link>
              <Link to="/xvibe" className="text-muted-foreground hover:text-foreground transition-colors text-sm">XVibe Music</Link>
              <Link to="/niranx/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">StudyVerse</Link>
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/niranx/auth')}
              className="text-xs"
            >
              <Mail className="w-3 h-3 mr-1" /> Admin Login
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/30 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} NiranX Universe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
