import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowLeft, BookOpen, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface NexusLink {
  id: string;
  name: string;
  url: string;
  description: string | null;
  image_url: string | null;
  tile_color: string | null;
  special_comment: string | null;
  comment_color: string | null;
}

interface CategoryInfo {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export default function NexusCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [links, setLinks] = useState<NexusLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Find category by slug (name lowercased + dashes)
      const { data: cats } = await supabase.from('nexus_categories').select('*').order('display_order');
      if (!cats) return setLoading(false);

      const matched = cats.find(c => 
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === categorySlug
      );
      
      if (!matched) return setLoading(false);
      setCategory(matched);

      const { data: linksData } = await supabase
        .from('nexus_links')
        .select('*')
        .eq('category_id', matched.id)
        .order('display_order');
      
      setLinks(linksData || []);
      setLoading(false);
    };
    fetchData();
  }, [categorySlug]);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-foreground mb-2">Category not found</h2>
        <Link to="/nexus"><Button variant="outline">Back to Nexus</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to="/nexus" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Nexus
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white">
            {getIcon(category.icon) || <Globe className="w-7 h-7" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-[Orbitron]">{category.name}</h1>
            {category.description && <p className="text-muted-foreground mt-1">{category.description}</p>}
          </div>
        </div>
      </div>

      {/* Guide Section */}
      <div className="bg-muted/30 border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">About {category.name}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {category.description || `Explore curated links and resources in the ${category.name} category. Each link has been reviewed and approved by our team to ensure quality and relevance.`}
        </p>
        <div className="mt-3 flex gap-2">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{links.length} links</span>
          <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">Curated by admins</span>
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {links.map((link, i) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', damping: 20 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              {link.image_url ? (
                <img src={link.image_url} alt={link.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center" style={{ background: link.tile_color || undefined }}>
                  <Icons.Link className="w-10 h-10 text-primary/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{link.name}</h3>
              {link.description && <p className="text-sm text-muted-foreground line-clamp-2">{link.description}</p>}
              {link.special_comment && (
                <p className="text-xs mt-2 font-medium" style={{ color: link.comment_color || 'hsl(var(--primary))' }}>{link.special_comment}</p>
              )}
            </div>
          </motion.a>
        ))}
      </div>

      {links.length === 0 && (
        <div className="text-center py-20">
          <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No links yet</h3>
          <p className="text-muted-foreground">This category doesn't have any links yet.</p>
        </div>
      )}
    </div>
  );
}
