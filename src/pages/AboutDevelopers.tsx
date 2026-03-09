import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Users, Github, Linkedin, Globe, Mail, Code, Heart } from 'lucide-react';

interface Developer {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  email: string | null;
  sort_order: number;
}

export default function AboutDevelopers() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [pageContent, setPageContent] = useState({
    title: 'Meet the Developers',
    subtitle: 'The creative minds building the NiranX ecosystem',
    footer_text: 'Built with passion, powered by innovation.',
  });

  useEffect(() => {
    const load = async () => {
      // Load developers
      const { data: devs } = await supabase
        .from('niranx_developers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (devs) setDevelopers(devs);

      // Load editable content
      const { data: content } = await supabase
        .from('admin_editable_content')
        .select('content_key, content_value')
        .eq('page_path', '/about-developers');
      if (content) {
        const map: Record<string, string> = {};
        content.forEach(c => { map[c.content_key] = c.content_value; });
        setPageContent(prev => ({
          title: map.title || prev.title,
          subtitle: map.subtitle || prev.subtitle,
          footer_text: map.footer_text || prev.footer_text,
        }));
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto text-center relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono tracking-widest uppercase mb-6">
              <Users className="w-3.5 h-3.5" />
              Our Team
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-[Orbitron] mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
              {pageContent.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {pageContent.subtitle}
            </p>
          </motion.div>
        </section>

        {/* Developers Grid */}
        <section className="container mx-auto px-4 pb-24">
          {developers.length === 0 ? (
            <div className="text-center py-16">
              <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No developer profiles added yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Admins can add developers from the dashboard.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {developers.map((dev, i) => (
                <motion.div
                  key={dev.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/30 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
                    {dev.avatar_url ? (
                      <img src={dev.avatar_url} alt={dev.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary font-[Orbitron]">
                        {dev.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold text-foreground font-[Orbitron]">{dev.name}</h3>
                    <p className="text-sm text-primary font-mono">{dev.role}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{dev.bio}</p>
                  </div>

                  {/* Social links */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    {dev.github_url && (
                      <a href={dev.github_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {dev.linkedin_url && (
                      <a href={dev.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {dev.website_url && (
                      <a href={dev.website_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {dev.email && (
                      <a href={`mailto:${dev.email}`} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <section className="border-t border-border/30 py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              {pageContent.footer_text}
              <Heart className="w-4 h-4 text-primary" />
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
