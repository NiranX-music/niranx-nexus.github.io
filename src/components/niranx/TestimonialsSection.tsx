import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from './GlassCard';
import { Star, Quote, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  author_avatar: string | null;
  content: string;
  rating: number;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from('niranx_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) setTestimonials(data);
      setIsLoading(false);
    };
    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded mx-auto" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <MessageSquare className="w-3 h-3 mr-1" /> Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-[Orbitron]">
            What People <span className="text-primary">Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <div className="p-6 flex flex-col h-full">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  
                  <p className="text-muted-foreground text-sm flex-1 mb-4">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.author_avatar ? (
                        <img 
                          src={testimonial.author_avatar} 
                          alt={testimonial.author_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        testimonial.author_name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author_name}</p>
                      {testimonial.author_title && (
                        <p className="text-xs text-muted-foreground">{testimonial.author_title}</p>
                      )}
                    </div>
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
