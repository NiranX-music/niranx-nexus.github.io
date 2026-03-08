import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, Twitter, Youtube, Linkedin, Instagram, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FooterColumn {
  title: string;
  links: { name: string; path: string }[];
}

const defaultColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { name: 'AI Hub', path: '/nexus/ai-hub' },
      { name: 'XVibe Music', path: '/xvibe/welcome' },
      { name: 'Learn Zone', path: '/nexus/learn' },
      { name: 'Focus Engine', path: '/focus-engine' },
      { name: 'Projects', path: '/nexus/projects' },
      { name: 'Pricing', path: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', path: '/docs' },
      { name: 'API Reference', path: '/docs/api/overview' },
      { name: 'Quick Start', path: '/docs/quick-start' },
      { name: 'Changelog', path: '/docs/changelog' },
      { name: 'Blog', path: '/blog' },
      { name: 'Support', path: '/support/help' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', path: '/support/privacy' },
      { name: 'Terms of Service', path: '/support/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'GDPR', path: '/gdpr' },
      { name: 'Security', path: '/docs/security/overview' },
    ],
  },
  {
    title: 'Community',
    links: [
      { name: 'Forums', path: '/community' },
      { name: 'XFlow Social', path: '/xflow' },
      { name: 'Debate Arena', path: '/debate' },
      { name: 'Study Groups', path: '/study-groups' },
      { name: 'Nexus Portal', path: '/nexus' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Contact', path: '/support/contact' },
    ],
  },
];

const defaultSocials = [
  { icon: 'github', href: '#', label: 'GitHub' },
  { icon: 'twitter', href: '#', label: 'Twitter' },
  { icon: 'youtube', href: '#', label: 'YouTube' },
  { icon: 'linkedin', href: '#', label: 'LinkedIn' },
  { icon: 'instagram', href: '#', label: 'Instagram' },
];

const iconMap: Record<string, any> = { github: Github, twitter: Twitter, youtube: Youtube, linkedin: Linkedin, instagram: Instagram };

export function Footer3D() {
  const [columns, setColumns] = useState<FooterColumn[]>(defaultColumns);
  const [socials, setSocials] = useState(defaultSocials);
  const [bgStyle, setBgStyle] = useState('from-primary/10 via-background to-background');

  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'footer_config')
        .maybeSingle();
      if (data?.setting_value) {
        const val = data.setting_value as any;
        if (val.columns) setColumns(val.columns);
        if (val.socials) setSocials(val.socials);
        if (val.bgStyle) setBgStyle(val.bgStyle);
      }
    };
    loadConfig();
  }, []);

  return (
    <footer className="relative pt-24 pb-12 px-4 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-t ${bgStyle}`} />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Link to="/" className="inline-block">
                <h3 className="text-3xl font-bold font-[Orbitron] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                  NiranX
                </h3>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                One platform. Infinite possibilities. Join the universe of creators and innovators.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>hello@niranx.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Global, Remote First</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {socials.map((social) => {
                  const Icon = iconMap[social.icon] || Github;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-9 h-9 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Link Columns */}
          {columns.map((col, index) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <h4 className="font-semibold text-foreground mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} NiranX Universe. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs">
              <Link to="/support/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/support/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
              <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
