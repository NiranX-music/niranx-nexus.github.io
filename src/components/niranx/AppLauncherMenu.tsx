import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { icons } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LauncherApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string | null;
  color: string | null;
  category: string | null;
}

export function AppLauncherMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [apps, setApps] = useState<LauncherApp[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('niranx_launcher_apps')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (data) setApps(data as LauncherApp[]);
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getIcon = (iconName: string) => {
    const Icon = (icons as Record<string, any>)[iconName];
    return Icon || icons.Globe;
  };

  // Group apps by category
  const grouped = apps.reduce<Record<string, LauncherApp[]>>((acc, app) => {
    const cat = app.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(app);
    return acc;
  }, {});

  const categoryOrder = ['tools', 'general', 'social', 'entertainment', 'education', 'productivity'];
  const sortedCategories = [
    ...categoryOrder.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !categoryOrder.includes(c)),
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        title="More from NiranX"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-[340px] max-h-[70vh] overflow-y-auto bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50"
          >
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                More from NiranX
              </p>
            </div>

            {sortedCategories.length > 0 ? (
              sortedCategories.map(category => (
                <div key={category}>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                      {category}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-3 pb-2">
                    {grouped[category].map((app, i) => {
                      const Icon = getIcon(app.icon);
                      return (
                        <motion.button
                          key={app.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => {
                            setIsOpen(false);
                            if (app.url.startsWith('http')) {
                              window.open(app.url, '_blank');
                            } else {
                              navigate(app.url);
                            }
                          }}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted/40 transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color || 'from-primary/20 to-accent/20'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-foreground" />
                          </div>
                          <span className="text-[11px] text-muted-foreground group-hover:text-foreground text-center leading-tight line-clamp-1">
                            {app.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-6">No apps configured</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
