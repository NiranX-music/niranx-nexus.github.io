import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cpu } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';

interface Technology {
  name: string;
  proficiency: number;
}

interface TechCategory {
  id: string;
  category_title: string;
  icon: string | null;
  technologies: Technology[];
}

export function TechStackSection() {
  const [categories, setCategories] = useState<TechCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTechStack = async () => {
      const { data } = await supabase
        .from('niranx_tech_stack')
        .select('*')
        .order('display_order');
      
      if (data) {
        setCategories(data.map(cat => ({
          ...cat,
          technologies: Array.isArray(cat.technologies) 
            ? (cat.technologies as unknown as Technology[])
            : JSON.parse(String(cat.technologies) || '[]')
        })));
      }
      setIsLoading(false);
    };
    fetchTechStack();
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <Cpu className="w-6 h-6" />;
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <Cpu className="w-6 h-6" />;
  };

  if (isLoading) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded mx-auto" />
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Cpu className="w-3 h-3 mr-1" /> Tech Stack
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron]">
            Technologies <span className="text-primary">& Skills</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary">
                      {getIcon(category.icon)}
                    </div>
                    <h3 className="text-lg font-semibold">{category.category_title}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {category.technologies.map((tech, i) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span>{tech.name}</span>
                          <span className="text-muted-foreground">{tech.proficiency}%</span>
                        </div>
                        <Progress value={tech.proficiency} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
