import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Github, Twitter, Youtube, Linkedin, Instagram,
  Mail, MapPin, Phone 
} from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'AI Hub', path: '/nexus/ai-hub' },
    { name: 'XVibe Music', path: '/xvibe/welcome' },
    { name: 'Learn Zone', path: '/nexus/learn' },
    { name: 'Projects', path: '/nexus/projects' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Press', path: '/press' },
  ],
  resources: [
    { name: 'Documentation', path: '/docs' },
    { name: 'API Reference', path: '/api' },
    { name: 'Community', path: '/community' },
    { name: 'Support', path: '/support' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/support/privacy' },
    { name: 'Terms of Service', path: '/support/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'GDPR', path: '/gdpr' },
  ],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export function Footer3D() {
  return (
    <footer className="relative pt-24 pb-12 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-background to-background" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/" className="inline-block">
                <h3 className="text-3xl font-bold font-[Orbitron] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                  NiranX
                </h3>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-xs">
                One platform. Infinite possibilities. Join the universe of creators and innovators.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>hello@niranx.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Global, Remote First</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-xl bg-card/50 border border-border/50 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-foreground mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
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
            <p>Made with ❤️ by creators, for creators</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
