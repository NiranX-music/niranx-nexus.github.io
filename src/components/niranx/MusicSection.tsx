import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, ExternalLink } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { supabase } from '@/integrations/supabase/client';

interface MusicRelease {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  link_url: string | null;
}

export function MusicSection() {
  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      const { data } = await supabase
        .from('niranx_music_releases')
        .select('*')
        .order('display_order');
      
      if (data) setReleases(data);
      setIsLoading(false);
    };
    fetchReleases();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded mx-auto" />
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Music className="w-3 h-3 mr-1" /> Music Releases
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron]">
            Latest <span className="text-primary">Tracks</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {releases.map((release, index) => (
            <motion.div
              key={release.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <div className="p-6">
                  <div className="aspect-square rounded-xl overflow-hidden mb-6 bg-muted/30">
                    {release.cover_url ? (
                      <img
                        src={release.cover_url}
                        alt={release.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-16 h-16 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                  {release.description && (
                    <p className="text-muted-foreground text-sm mb-4">{release.description}</p>
                  )}
                  
                  {release.link_url && (
                    <Button
                      variant="outline"
                      className="w-full group"
                      onClick={() => window.open(release.link_url!, '_blank')}
                    >
                      Listen Now
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
