import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { FileText, Search, Plus, BookOpen, Code, Beaker, Calculator, Globe, Cpu, Copy, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Cheatsheet {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const defaultSheets: Cheatsheet[] = [
  {
    id: '1', title: 'Git Commands', category: 'Programming',
    content: `git init — Initialize repo\ngit clone <url> — Clone repo\ngit add . — Stage all\ngit commit -m "msg" — Commit\ngit push origin main — Push\ngit pull — Pull changes\ngit branch <name> — Create branch\ngit checkout <branch> — Switch branch\ngit merge <branch> — Merge\ngit stash — Stash changes\ngit log --oneline — View log`,
    tags: ['git', 'dev', 'terminal'], createdAt: new Date().toISOString(),
  },
  {
    id: '2', title: 'Physics Formulas', category: 'Science',
    content: `F = ma — Newton's 2nd Law\nv = u + at — Velocity\ns = ut + ½at² — Displacement\nv² = u² + 2as — Motion\nKE = ½mv² — Kinetic Energy\nPE = mgh — Potential Energy\nW = Fd — Work\nP = W/t — Power\nρ = m/V — Density\np = F/A — Pressure`,
    tags: ['physics', 'formulas', 'mechanics'], createdAt: new Date().toISOString(),
  },
  {
    id: '3', title: 'CSS Flexbox', category: 'Programming',
    content: `display: flex — Enable\nflex-direction: row | column\njustify-content: center | space-between\nalign-items: center | stretch\nflex-wrap: wrap | nowrap\ngap: 1rem — Spacing\nflex: 1 — Grow\norder: -1 — Reorder\nalign-self: flex-end — Individual`,
    tags: ['css', 'flexbox', 'layout'], createdAt: new Date().toISOString(),
  },
];

const categories = [
  { name: 'All', icon: BookOpen },
  { name: 'Programming', icon: Code },
  { name: 'Science', icon: Beaker },
  { name: 'Math', icon: Calculator },
  { name: 'Languages', icon: Globe },
  { name: 'CS', icon: Cpu },
];

const QuickCheatsheets = () => {
  const [sheets, setSheets] = useState<Cheatsheet[]>(defaultSheets);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Programming');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const filtered = sheets.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const copyContent = (sheet: Cheatsheet) => {
    navigator.clipboard.writeText(sheet.content);
    setCopiedId(sheet.id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addSheet = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const sheet: Cheatsheet = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      content: newContent,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    setSheets(prev => [sheet, ...prev]);
    setNewTitle(''); setNewContent(''); setNewTags('');
    toast.success('Cheatsheet created');
  };

  const deleteSheet = (id: string) => {
    setSheets(prev => prev.filter(s => s.id !== id));
    toast.success('Deleted');
  };

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 cyber-grid">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text tracking-wider">
              CHEAT_SHEETS
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="font-mono text-xs gap-2">
                <Plus className="w-4 h-4" /> NEW
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-mono tracking-wider">CREATE_CHEATSHEET</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="font-mono text-sm" />
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono">
                  {categories.filter(c => c.name !== 'All').map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <Textarea placeholder="Content (one item per line)" value={newContent}
                  onChange={e => setNewContent(e.target.value)} rows={8} className="font-mono text-xs" />
                <Input placeholder="Tags (comma-separated)" value={newTags}
                  onChange={e => setNewTags(e.target.value)} className="font-mono text-sm" />
                <Button onClick={addSheet} className="w-full font-mono text-xs">CREATE</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="font-mono text-xs text-muted-foreground tracking-widest">
          {">"} QUICK_REFERENCE // INSTANT_RECALL
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search cheatsheets..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 font-mono text-sm" />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button key={cat.name} size="sm" variant={activeCategory === cat.name ? 'default' : 'outline'}
            onClick={() => setActiveCategory(cat.name)} className="font-mono text-xs gap-1.5">
            <cat.icon className="w-3.5 h-3.5" /> {cat.name.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Sheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sheet, i) => (
          <motion.div key={sheet.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            <Card className="tech-card hover-lift h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-sm tracking-wide">{sheet.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyContent(sheet)}>
                      {copiedId === sheet.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSheet(sheet.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit text-[10px] font-mono">{sheet.category}</Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-40">
                  <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {sheet.content}
                  </pre>
                </ScrollArea>
                <div className="flex flex-wrap gap-1 mt-3">
                  {sheet.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[9px] font-mono">#{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="font-mono text-sm text-muted-foreground">NO_SHEETS_FOUND</p>
        </div>
      )}
    </div>
  );
};

export default QuickCheatsheets;
