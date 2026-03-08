import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ChevronRight, Map, Download, FileText, Lock, Globe, Shield, Users, GraduationCap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { allPages, pageCategories, accessLevelColors } from '@/data/allPages';
import * as LucideIcons from 'lucide-react';

const Sitemap = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPages = allPages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayPages = activeCategory === 'all'
    ? filteredPages
    : filteredPages.filter(p => p.category === activeCategory);

  const categoriesWithCount = pageCategories.map(cat => ({
    name: cat,
    count: allPages.filter(p => p.category === cat).length,
  }));

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Globe;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Map className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold font-[Orbitron]">Site Map</h1>
        </div>
        <p className="text-muted-foreground">
          Complete navigation structure — {allPages.length} pages across {pageCategories.length} categories
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{allPages.length}</p>
          <p className="text-xs text-muted-foreground">Total Pages</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{allPages.filter(p => p.accessLevel === 'Public').length}</p>
          <p className="text-xs text-muted-foreground">Public</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{allPages.filter(p => p.accessLevel === 'Admin').length}</p>
          <p className="text-xs text-muted-foreground">Admin Only</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{pageCategories.length}</p>
          <p className="text-xs text-muted-foreground">Categories</p>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-3">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search pages by name, route, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveCategory('all')}
        >
          All ({allPages.length})
        </Button>
        {categoriesWithCount.map(cat => (
          <Button
            key={cat.name}
            size="sm"
            variant={activeCategory === cat.name ? 'default' : 'outline'}
            onClick={() => setActiveCategory(cat.name)}
          >
            {cat.name} ({cat.count})
          </Button>
        ))}
      </div>

      {/* Pages List */}
      <div className="space-y-2">
        {displayPages.map(page => {
          const Icon = getIcon(page.icon);
          return (
            <Card
              key={page.route}
              className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
              onClick={() => {
                if (!page.route.includes(':')) navigate(page.route);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{page.name}</h3>
                        <Badge className={accessLevelColors[page.accessLevel] + " text-[10px] px-1.5"}>
                          {page.accessLevel}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5">{page.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{page.description}</p>
                      <code className="text-xs text-muted-foreground/60">{page.route}</code>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {displayPages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No pages found.</div>
        )}
      </div>

      {/* Export */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Export</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const text = allPages.map(r => `${r.name} | ${r.route} | ${r.category} | ${r.accessLevel}`).join('\n');
            navigator.clipboard.writeText(text);
          }}>
            <FileText className="w-4 h-4 mr-2" /> Copy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sitemap;
