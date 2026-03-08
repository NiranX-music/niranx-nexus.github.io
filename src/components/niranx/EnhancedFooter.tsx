import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import niranxLogo from '@/assets/niranx-logo.jpg';
import * as LucideIcons from 'lucide-react';
import { Mail, Heart } from 'lucide-react';

interface FooterLink {
  id: string;
  title: string;
  url: string;
  category: string;
  icon: string | null;
  display_order: number;
}

interface GroupedLinks {
  [category: string]: FooterLink[];
}

const categoryTitles: Record<string, string> = {
  legal: 'Legal',
  support: 'Support',
  company: 'Company',
  social: 'Social',
  general: 'Links',
};

const categoryOrder = ['company', 'support', 'legal', 'social'];

export function EnhancedFooter() {
  const navigate = useNavigate();
  const [footerLinks, setFooterLinks] = useState<GroupedLinks>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from('niranx_footer_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (data) {
        const grouped = data.reduce((acc: GroupedLinks, link) => {
          if (!acc[link.category]) acc[link.category] = [];
          acc[link.category].push(link);
          return acc;
        }, {});
        setFooterLinks(grouped);
      }
      setIsLoading(false);
    };
    fetchLinks();
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const renderLink = (link: FooterLink) => {
    const isExternal = link.url.startsWith('http');
    const icon = getIcon(link.icon);

    if (isExternal) {
      return (
        <motion.a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ x: 3 }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm py-1"
        >
          {icon}
          {link.title}
        </motion.a>
      );
    }

    return (
      <motion.div key={link.id} whileHover={{ x: 3 }}>
        <Link
          to={link.url}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm py-1"
        >
          {icon}
          {link.title}
        </Link>
      </motion.div>
    );
  };

  const sortedCategories = categoryOrder.filter(cat => footerLinks[cat]?.length > 0);
  const otherCategories = Object.keys(footerLinks).filter(
    cat => !categoryOrder.includes(cat) && footerLinks[cat]?.length > 0
  );

  return (
    <footer className="relative py-16 px-4 border-t border-border/30">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

      <div className="container mx-auto relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-accent p-0.5">
                <img src={niranxLogo} alt="NiranX" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="text-xl font-bold font-[Orbitron]">NiranX</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              A creative hub for innovation, music, and technology.
              Building the future, one project at a time.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs"
            >
              <Mail className="w-3 h-3 mr-1" /> Admin Login
            </Button>
          </div>

          {/* Dynamic Link Categories */}
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </>
          ) : (
            <>
              {[...sortedCategories, ...otherCategories].map(category => (
                <div key={category}>
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                    {categoryTitles[category] || category}
                  </h4>
                  <nav className="flex flex-col space-y-1">
                    {footerLinks[category].map(renderLink)}
                  </nav>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                © {new Date().getFullYear()} NiranX Universe. Built with
                <Heart className="w-4 h-4 text-red-500 fill-red-500 inline" />
                by <span className="text-foreground font-medium">NiranX Developers</span>
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Hosted at{' '}
                <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Lovable
                </a>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/support/privacy" 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Privacy
              </Link>
              <span className="text-muted-foreground/30">•</span>
              <Link 
                to="/support/terms" 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Terms
              </Link>
              <span className="text-muted-foreground/30">•</span>
              <Link 
                to="/support/contact" 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
