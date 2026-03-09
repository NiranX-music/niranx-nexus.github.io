import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, Save, ExternalLink } from 'lucide-react';

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

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'header_products')
      .maybeSingle();
    if (data?.setting_value) {
      const val = data.setting_value as any;
      if (Array.isArray(val.products)) setProducts(val.products);
    }
  };

  const saveProducts = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'header_products')
        .maybeSingle();

      const payload = { setting_key: 'header_products', setting_value: { products } as any, updated_at: new Date().toISOString() };

      if (existing) {
        await supabase.from('admin_settings').update(payload).eq('setting_key', 'header_products');
      } else {
        await supabase.from('admin_settings').insert(payload);
      }
      toast({ title: 'Products saved successfully' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addProduct = () => {
    setProducts([...products, { id: crypto.randomUUID(), name: '', description: '', href: '/', icon: '📦' }]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" /> Header Products Menu
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addProduct}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
          <Button size="sm" onClick={saveProducts} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Manage the products shown in the "Products" dropdown in the site header. Changes appear instantly after saving.
        </p>
        {products.map((product, index) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                <span className="text-xs font-mono">#{index + 1}</span>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Icon (emoji)</label>
                  <Input
                    value={product.icon}
                    onChange={e => updateProduct(product.id, 'icon', e.target.value)}
                    placeholder="🚀"
                    className="w-20"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <Input
                    value={product.name}
                    onChange={e => updateProduct(product.id, 'name', e.target.value)}
                    placeholder="Product Name"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Link</label>
                  <Input
                    value={product.href}
                    onChange={e => updateProduct(product.id, 'href', e.target.value)}
                    placeholder="/path or https://..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Badge (optional)</label>
                  <Input
                    value={product.badge || ''}
                    onChange={e => updateProduct(product.id, 'badge', e.target.value)}
                    placeholder="New, Beta, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <Textarea
                    value={product.description}
                    onChange={e => updateProduct(product.id, 'description', e.target.value)}
                    placeholder="Short description"
                    rows={2}
                  />
                </div>
              </div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeProduct(product.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No products added yet. Click "Add Product" to get started.</p>
        )}
      </CardContent>
    </Card>
  );
}
