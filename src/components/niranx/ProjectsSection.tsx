import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  tags: string[] | null;
  link_url: string | null;
}

export function ProjectsSection() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('niranx_projects')
        .select('*')
        .order('display_order');
      
      if (data) setProjects(data);
      setIsLoading(false);
    };
    fetchProjects();
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <Layers className="w-8 h-8" />;
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return IconComponent ? <IconComponent className="w-8 h-8" /> : <Layers className="w-8 h-8" />;
  };

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
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
            <Layers className="w-3 h-3 mr-1" /> Projects
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron]">
            Featured <span className="text-accent">Projects</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full group">
                <div className="p-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    {getIcon(project.icon)}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  {project.description && (
                    <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                  )}
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {project.link_url && (
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-primary hover:text-primary/80 group/btn"
                      onClick={() => {
                        if (project.link_url?.startsWith('/')) {
                          navigate(project.link_url);
                        } else {
                          window.open(project.link_url!, '_blank');
                        }
                      }}
                    >
                      View Project
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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
