import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { AppLauncherMenu } from './AppLauncherMenu';
import { HeaderClock } from './HeaderClock';
import { ControlCenterMenu } from './ControlCenterMenu';
import niranxLogo from '@/assets/niranx-logo.jpg';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface NavDropdown {
  name: string;
  columns: { title: string; items: { name: string; href: string }[] }[];
}

const defaultDropdowns: NavDropdown[] = [
  {
    name: 'Solutions',
    columns: [
      {
        title: 'For You',
        items: [
          { name: 'Students', href: '/nexus/learn' },
          { name: 'Creators', href: '/nexus/creative' },
          { name: 'Developers', href: '/nexus/dev-tools' },
          { name: 'Musicians', href: '/nexus/xvibe-music' },
          { name: 'Gamers', href: '/nexus/gaming' },
          { name: 'Communities', href: '/nexus/community' },
        ],
      },
      {
        title: 'Use Cases',
        items: [
          { name: 'AI Study Tools', href: '/nexus/ai-hub' },
          { name: 'Focus & Productivity', href: '/focus-engine' },
          { name: 'Streaming', href: '/nexus/streaming' },
          { name: 'Project Building', href: '/nexus/projects' },
        ],
      },
    ],
  },
  {
    name: 'Resources',
    columns: [
      {
        title: 'Learn',
        items: [
          { name: 'Documentation', href: '/docs' },
          { name: 'API Reference', href: '/docs/api/overview' },
          { name: 'Quick Start', href: '/docs/quick-start' },
          { name: 'Changelog', href: '/docs/changelog' },
          { name: 'Blog', href: '/blog' },
          { name: 'Support', href: '/support/help' },
        ],
      },
      {
        title: 'Community',
        items: [
          { name: 'Forums', href: '/community' },
          { name: 'XFlow Social', href: '/xflow' },
          { name: 'Debate Arena', href: '/debate' },
          { name: 'Study Groups', href: '/study-groups' },
        ],
      },
    ],
  },
];

const defaultSimpleLinks = [
  { name: 'Pricing', href: '/pricing' },
  { name: 'Security', href: '/docs/security/overview' },
];

export function NiranXNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [navConfig, setNavConfig] = useState<{ dropdowns: NavDropdown[]; simpleLinks: { name: string; href: string }[] }>({
    dropdowns: defaultDropdowns,
    simpleLinks: defaultSimpleLinks,
  });
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load admin-configured nav if available
  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'header_config')
        .maybeSingle();
      if (data?.setting_value) {
        const val = data.setting_value as any;
        if (val.dropdowns) setNavConfig({ dropdowns: val.dropdowns, simpleLinks: val.simpleLinks || defaultSimpleLinks });
      }
    };
    loadConfig();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-xl border-b border-border/30"
    >
      <div className="container mx-auto px-4 py-3">
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
              NiranX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1" ref={dropdownRef}>
            {/* Dropdown Menus */}
            {navConfig.dropdowns.map((dropdown) => (
              <div key={dropdown.name} className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === dropdown.name ? null : dropdown.name)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/30"
                >
                  {dropdown.name}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === dropdown.name ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === dropdown.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-5 min-w-[400px] z-50"
                    >
                      <div className="flex gap-8">
                        {dropdown.columns.map((col) => (
                          <div key={col.title} className="min-w-[160px]">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{col.title}</p>
                            <div className="space-y-1">
                              {col.items.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="block px-2 py-1.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Simple Links */}
            {navConfig.simpleLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/30"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <HeaderClock />
            <ControlCenterMenu />
            <AppLauncherMenu />
            <Button variant="ghost" onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground text-sm">
              Sign In
            </Button>
            <Button onClick={() => navigate('/dashboard')} size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              Enter Nexus
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
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
              <div className="flex flex-col space-y-2 pt-4">
                {navConfig.dropdowns.map((dropdown) => (
                  <div key={dropdown.name}>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === dropdown.name ? null : dropdown.name)}
                      className="flex items-center justify-between w-full px-2 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <span>{dropdown.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === dropdown.name ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === dropdown.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 space-y-1 pb-2"
                        >
                          {dropdown.columns.map((col) => (
                            <div key={col.title}>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1">{col.title}</p>
                              {col.items.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  onClick={() => { setIsOpen(false); setActiveDropdown(null); }}
                                  className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {navConfig.simpleLinks.map((link) => (
                  <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)} className="px-2 py-2 text-muted-foreground hover:text-foreground">
                    {link.name}
                  </Link>
                ))}
                <Button onClick={() => { navigate('/auth'); setIsOpen(false); }} variant="outline" className="w-full">Sign In</Button>
                <Button onClick={() => { navigate('/dashboard'); setIsOpen(false); }} className="w-full bg-gradient-to-r from-primary to-accent">Enter Nexus</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
