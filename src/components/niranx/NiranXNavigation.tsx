import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import niranxLogo from '@/assets/niranx-logo.jpg';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Nexus', href: '/nexus' },
  { name: 'Songs', href: '/songs' },
];

export function NiranXNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-xl border-b border-border/30"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-accent p-0.5"
            >
              <img src={niranxLogo} alt="NiranX" className="w-full h-full object-cover rounded-lg" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent font-[Orbitron]">
              NiranX Universe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              Enter Nexus
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-border/30"
            >
              <div className="flex flex-col space-y-4 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.name}
                  </Link>
                ))}
                <Button
                  onClick={() => { navigate('/auth'); setIsOpen(false); }}
                  variant="outline"
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  Enter Nexus
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
