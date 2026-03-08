import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, RotateCcw, Layout, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

interface NavDropdownItem { name: string; href: string }
interface NavDropdownColumn { title: string; items: NavDropdownItem[] }
interface NavDropdown { name: string; columns: NavDropdownColumn[] }
interface FooterColumn { title: string; links: { name: string; path: string }[] }
interface SocialLink { icon: string; href: string; label: string }

export default function AdminLayoutEditor() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading } = useAdminCheck();

  // Header state
  const [headerDropdowns, setHeaderDropdowns] = useState<NavDropdown[]>([]);
  const [headerSimpleLinks, setHeaderSimpleLinks] = useState<{ name: string; href: string }[]>([]);

  // Footer state
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([]);
  const [footerSocials, setFooterSocials] = useState<SocialLink[]>([]);
  const [footerBgStyle, setFooterBgStyle] = useState('from-primary/10 via-background to-background');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const [headerRes, footerRes] = await Promise.all([
      supabase.from('admin_settings').select('setting_value').eq('setting_key', 'header_config').maybeSingle(),
      supabase.from('admin_settings').select('setting_value').eq('setting_key', 'footer_config').maybeSingle(),
    ]);

    if (headerRes.data?.setting_value) {
      const val = headerRes.data.setting_value as any;
      if (val.dropdowns) setHeaderDropdowns(val.dropdowns);
      if (val.simpleLinks) setHeaderSimpleLinks(val.simpleLinks);
    }
    if (footerRes.data?.setting_value) {
      const val = footerRes.data.setting_value as any;
      if (val.columns) setFooterColumns(val.columns);
      if (val.socials) setFooterSocials(val.socials);
      if (val.bgStyle) setFooterBgStyle(val.bgStyle);
    }
  };

  const saveConfig = async (key: string, value: Json) => {
    setSaving(true);
    const { data: existing } = await supabase.from('admin_settings').select('id').eq('setting_key', key).maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from('admin_settings').update({ setting_value: value, updated_at: new Date().toISOString(), updated_by: user?.id }).eq('setting_key', key));
    } else {
      ({ error } = await supabase.from('admin_settings').insert({ setting_key: key, setting_value: value, updated_by: user?.id }));
    }
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `${key.replace('_', ' ')} updated successfully.` });
    }
  };

  const saveHeader = () => saveConfig('header_config', { dropdowns: headerDropdowns, simpleLinks: headerSimpleLinks } as unknown as Json);
  const saveFooter = () => saveConfig('footer_config', { columns: footerColumns, socials: footerSocials, bgStyle: footerBgStyle } as unknown as Json);

  if (authLoading || isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!user || !isAdmin) return <Navigate to="/dashboard" replace />;

  // --- Header Dropdown Editors ---
  const addDropdown = () => setHeaderDropdowns([...headerDropdowns, { name: 'New Menu', columns: [{ title: 'Column', items: [{ name: 'Link', href: '/' }] }] }]);
  const removeDropdown = (i: number) => setHeaderDropdowns(headerDropdowns.filter((_, idx) => idx !== i));
  const updateDropdownName = (i: number, name: string) => { const c = [...headerDropdowns]; c[i].name = name; setHeaderDropdowns(c); };
  const addColumn = (di: number) => { const c = [...headerDropdowns]; c[di].columns.push({ title: 'Column', items: [{ name: 'Link', href: '/' }] }); setHeaderDropdowns(c); };
  const removeColumn = (di: number, ci: number) => { const c = [...headerDropdowns]; c[di].columns.splice(ci, 1); setHeaderDropdowns(c); };
  const updateColumnTitle = (di: number, ci: number, title: string) => { const c = [...headerDropdowns]; c[di].columns[ci].title = title; setHeaderDropdowns(c); };
  const addColumnItem = (di: number, ci: number) => { const c = [...headerDropdowns]; c[di].columns[ci].items.push({ name: 'New Link', href: '/' }); setHeaderDropdowns(c); };
  const removeColumnItem = (di: number, ci: number, ii: number) => { const c = [...headerDropdowns]; c[di].columns[ci].items.splice(ii, 1); setHeaderDropdowns(c); };
  const updateColumnItem = (di: number, ci: number, ii: number, field: 'name' | 'href', val: string) => { const c = [...headerDropdowns]; c[di].columns[ci].items[ii][field] = val; setHeaderDropdowns(c); };

  // --- Simple links ---
  const addSimpleLink = () => setHeaderSimpleLinks([...headerSimpleLinks, { name: 'Link', href: '/' }]);
  const removeSimpleLink = (i: number) => setHeaderSimpleLinks(headerSimpleLinks.filter((_, idx) => idx !== i));
  const updateSimpleLink = (i: number, field: 'name' | 'href', val: string) => { const c = [...headerSimpleLinks]; c[i][field] = val; setHeaderSimpleLinks(c); };

  // --- Footer Column Editors ---
  const addFooterColumn = () => setFooterColumns([...footerColumns, { title: 'Column', links: [{ name: 'Link', path: '/' }] }]);
  const removeFooterColumn = (i: number) => setFooterColumns(footerColumns.filter((_, idx) => idx !== i));
  const updateFooterColumnTitle = (i: number, title: string) => { const c = [...footerColumns]; c[i].title = title; setFooterColumns(c); };
  const addFooterLink = (ci: number) => { const c = [...footerColumns]; c[ci].links.push({ name: 'New Link', path: '/' }); setFooterColumns(c); };
  const removeFooterLink = (ci: number, li: number) => { const c = [...footerColumns]; c[ci].links.splice(li, 1); setFooterColumns(c); };
  const updateFooterLink = (ci: number, li: number, field: 'name' | 'path', val: string) => { const c = [...footerColumns]; c[ci].links[li][field] = val; setFooterColumns(c); };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Layout className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Layout Editor</h1>
          <p className="text-sm text-muted-foreground">Customize header navigation and footer links</p>
        </div>
      </div>

      <Tabs defaultValue="header">
        <TabsList>
          <TabsTrigger value="header" className="gap-1.5"><Globe className="h-3.5 w-3.5" />Header</TabsTrigger>
          <TabsTrigger value="footer" className="gap-1.5"><Layout className="h-3.5 w-3.5" />Footer</TabsTrigger>
        </TabsList>

        {/* HEADER TAB */}
        <TabsContent value="header" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dropdown Menus</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={addDropdown}><Plus className="h-3.5 w-3.5 mr-1" />Add Dropdown</Button>
              <Button size="sm" onClick={saveHeader} disabled={saving}><Save className="h-3.5 w-3.5 mr-1" />{saving ? 'Saving...' : 'Save Header'}</Button>
            </div>
          </div>

          {headerDropdowns.map((dropdown, di) => (
            <Card key={di} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Menu Name</Label>
                    <Input value={dropdown.name} onChange={(e) => updateDropdownName(di, e.target.value)} className="w-40 h-8 text-sm" />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => addColumn(di)}><Plus className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeDropdown(di)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dropdown.columns.map((col, ci) => (
                  <div key={ci} className="border border-border/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input value={col.title} onChange={(e) => updateColumnTitle(di, ci, e.target.value)} className="w-32 h-7 text-xs" placeholder="Column title" />
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => addColumnItem(di, ci)}><Plus className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-destructive" onClick={() => removeColumn(di, ci)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    {col.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <Input value={item.name} onChange={(e) => updateColumnItem(di, ci, ii, 'name', e.target.value)} className="h-7 text-xs" placeholder="Label" />
                        <Input value={item.href} onChange={(e) => updateColumnItem(di, ci, ii, 'href', e.target.value)} className="h-7 text-xs" placeholder="/path" />
                        <Button size="sm" variant="ghost" className="h-6 px-1 text-destructive shrink-0" onClick={() => removeColumnItem(di, ci, ii)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Simple Links</h2>
            <Button size="sm" variant="outline" onClick={addSimpleLink}><Plus className="h-3.5 w-3.5 mr-1" />Add Link</Button>
          </div>
          {headerSimpleLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={link.name} onChange={(e) => updateSimpleLink(i, 'name', e.target.value)} className="h-8 text-sm" placeholder="Label" />
              <Input value={link.href} onChange={(e) => updateSimpleLink(i, 'href', e.target.value)} className="h-8 text-sm" placeholder="/path" />
              <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => removeSimpleLink(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </TabsContent>

        {/* FOOTER TAB */}
        <TabsContent value="footer" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Footer Columns</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={addFooterColumn}><Plus className="h-3.5 w-3.5 mr-1" />Add Column</Button>
              <Button size="sm" onClick={saveFooter} disabled={saving}><Save className="h-3.5 w-3.5 mr-1" />{saving ? 'Saving...' : 'Save Footer'}</Button>
            </div>
          </div>

          {/* Background Style */}
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <Label className="text-xs text-muted-foreground mb-1 block">Footer Background Gradient</Label>
              <Input value={footerBgStyle} onChange={(e) => setFooterBgStyle(e.target.value)} className="h-8 text-sm font-mono" placeholder="from-primary/10 via-background to-background" />
              <p className="text-xs text-muted-foreground mt-1">Tailwind gradient classes (e.g. from-primary/10 via-background to-background)</p>
            </CardContent>
          </Card>

          {footerColumns.map((col, ci) => (
            <Card key={ci} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Input value={col.title} onChange={(e) => updateFooterColumnTitle(ci, e.target.value)} className="w-40 h-8 text-sm" placeholder="Column title" />
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => addFooterLink(ci)}><Plus className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeFooterColumn(ci)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {col.links.map((link, li) => (
                  <div key={li} className="flex items-center gap-2">
                    <Input value={link.name} onChange={(e) => updateFooterLink(ci, li, 'name', e.target.value)} className="h-7 text-xs" placeholder="Label" />
                    <Input value={link.path} onChange={(e) => updateFooterLink(ci, li, 'path', e.target.value)} className="h-7 text-xs" placeholder="/path" />
                    <Button size="sm" variant="ghost" className="h-6 px-1 text-destructive shrink-0" onClick={() => removeFooterLink(ci, li)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
