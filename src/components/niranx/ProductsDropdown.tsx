import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
}

const defaultProducts: Product[] = [
  { id: '1', name: 'NiranX Nexus', description: 'All-in-one student platform', href: '/dashboard', icon: '🚀' },
  { id: '2', name: 'XVibe Music', description: 'Music streaming & creation', href: '/nexus/xvibe-music', icon: '🎵' },
  { id: '3', name: 'Bytez AI', description: 'AI-powered assistant', href: '/bytez', icon: '🤖' },
  { id: '4', name: 'XFlow Social', description: 'Social networking hub', href: '/xflow', icon: '💬' },
  { id: '5', name: 'FerqX', description: 'Real-time collaboration', href: '/ferqx', icon: '⚡' },
  { id: '6', name: 'XStage', description: 'Project management', href: '/xstage', icon: '🎯' },
];

export function ProductsDropdown() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'header_products')
        .maybeSingle();
      if (data?.setting_value) {
        const val = data.setting_value as any;
        if (Array.isArray(val.products) && val.products.length > 0) setProducts(val.products);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/30"
      >
        Products
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-4 min-w-[340px] z-50"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">NiranX Products</span>
            </div>
            <div className="space-y-1">
              {products.map((product) => {
                const isExternal = product.href.startsWith('http');
                const commonClass = "flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors group";
                const content = (
                  <>
                    <span className="text-xl mt-0.5">{product.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </span>
                        {product.badge && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {product.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.description}</p>
                    </div>
                  </>
                );
                return isExternal ? (
                  <a
                    key={product.id}
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className={commonClass}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={product.id}
                    to={product.href}
                    onClick={() => setOpen(false)}
                    className={commonClass}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
