import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Send, Star, Edit2, X, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PersonalLink {
  id: string;
  name: string;
  url: string;
  description: string | null;
  image_url: string | null;
  category: string;
  icon: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface PersonalLinksSectionProps {
  nexusCategories: Category[];
}

export function PersonalLinksSection({ nexusCategories }: PersonalLinksSectionProps) {
  const { user } = useAuth();
  const [links, setLinks] = useState<PersonalLink[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState<PersonalLink | null>(null);
  const [shareCategoryId, setShareCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', url: '', description: '', category: 'General', image_url: '' });

  useEffect(() => {
    if (user) loadLinks();
  }, [user]);

  const loadLinks = async () => {
    const { data } = await supabase
      .from('user_nexus_links')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setLinks(data || []);
    setLoading(false);
  };

  const addLink = async () => {
    if (!form.name || !form.url) return toast.error('Name and URL are required');
    const { error } = await supabase.from('user_nexus_links').insert({
      user_id: user!.id,
      name: form.name,
      url: form.url.startsWith('http') ? form.url : `https://${form.url}`,
      description: form.description || null,
      category: form.category,
      image_url: form.image_url || null,
    });
    if (error) return toast.error('Failed to add link');
    toast.success('Link added!');
    setForm({ name: '', url: '', description: '', category: 'General', image_url: '' });
    setAddOpen(false);
    loadLinks();
  };

  const deleteLink = async (id: string) => {
    await supabase.from('user_nexus_links').delete().eq('id', id);
    toast.success('Link removed');
    loadLinks();
  };

  const submitToMain = async () => {
    if (!shareLink || !shareCategoryId) return toast.error('Select a category');
    const { error } = await supabase.from('nexus_link_submissions').insert({
      user_id: user!.id,
      name: shareLink.name,
      url: shareLink.url,
      description: shareLink.description,
      image_url: shareLink.image_url,
      category_id: shareCategoryId,
    });
    if (error) return toast.error('Submission failed');
    toast.success('Submitted for review! An admin will approve it shortly.');
    setShareOpen(false);
    setShareLink(null);
  };

  if (!user) return null;

  const grouped = links.reduce((acc, link) => {
    const cat = link.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {} as Record<string, PersonalLink[]>);

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-[Orbitron]">My Links</h2>
            <p className="text-sm text-gray-400">Your personal bookmarks & portals</p>
          </div>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121a] border-cyan-900/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 font-[Orbitron]">Add Personal Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Link Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-[#0d0d14] border-cyan-900/30 text-white" />
              <Input placeholder="URL *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="bg-[#0d0d14] border-cyan-900/30 text-white" />
              <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-[#0d0d14] border-cyan-900/30 text-white" />
              <Input placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="bg-[#0d0d14] border-cyan-900/30 text-white" />
              <Input placeholder="Category (e.g. Work, Study)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-[#0d0d14] border-cyan-900/30 text-white" />
              <Button onClick={addLink} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">Save Link</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Personal Links Grid */}
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading your links...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-cyan-900/30 rounded-xl">
          <Globe className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 mb-2">No personal links yet</p>
          <p className="text-gray-500 text-sm">Add your favorite websites and tools</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catLinks]) => (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">{cat}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {catLinks.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-xl overflow-hidden bg-[#12121a] border border-emerald-900/20 hover:border-emerald-500/40 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {link.image_url ? (
                      <img src={link.image_url} alt={link.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <Globe className="w-8 h-8 text-emerald-400/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 bg-black/60 hover:bg-emerald-500/30 text-white"
                        onClick={(e) => { e.preventDefault(); setShareLink(link); setShareOpen(true); }}
                        title="Share to Main Nexus"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 bg-black/60 hover:bg-red-500/30 text-white"
                        onClick={(e) => { e.preventDefault(); deleteLink(link.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="block p-3">
                    <h4 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors truncate">{link.name}</h4>
                    {link.description && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{link.description}</p>}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Share to Main Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="bg-[#12121a] border-cyan-900/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 font-[Orbitron]">Share to Main Nexus</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm">Submit "{shareLink?.name}" for admin review. Once approved, it'll appear in the main Nexus portal for everyone!</p>
          <Select value={shareCategoryId} onValueChange={setShareCategoryId}>
            <SelectTrigger className="bg-[#0d0d14] border-cyan-900/30 text-white">
              <SelectValue placeholder="Select Nexus category" />
            </SelectTrigger>
            <SelectContent className="bg-[#12121a] border-cyan-900/30">
              {nexusCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="text-white">{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={submitToMain} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600">
            <Send className="w-4 h-4 mr-2" /> Submit for Review
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
