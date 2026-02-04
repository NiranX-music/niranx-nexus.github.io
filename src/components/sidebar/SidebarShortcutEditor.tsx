import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, ChevronUp, ChevronDown, Eye, EyeOff, ExternalLink, FileText, Save, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  visible: boolean;
  order: number;
}

interface SidebarShortcutEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupKey: string;
  groupTitle: string;
  items: { title: string; url: string; icon: any }[];
  groupColor: string;
  onSave?: (hiddenItems: string[]) => void;
}

const STORAGE_KEY = 'sidebar_hidden_items';

export function SidebarShortcutEditor({
  open,
  onOpenChange,
  groupKey,
  groupTitle,
  items,
  groupColor,
  onSave,
}: SidebarShortcutEditorProps) {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // Load hidden items from localStorage
      const hiddenItemsJson = localStorage.getItem(STORAGE_KEY);
      const hiddenItems: string[] = hiddenItemsJson ? JSON.parse(hiddenItemsJson) : [];
      
      // Initialize nav items with visibility status
      const initialItems = items.map((item, index) => ({
        title: item.title,
        url: item.url,
        icon: item.icon,
        visible: !hiddenItems.includes(item.url),
        order: index,
      }));
      
      setNavItems(initialItems);
    }
  }, [open, items]);

  const toggleVisibility = (url: string) => {
    setNavItems(prev => 
      prev.map(item => 
        item.url === url ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= navItems.length) return;

    setNavItems(prev => {
      const newItems = [...prev];
      const temp = newItems[index].order;
      newItems[index].order = newItems[newIndex].order;
      newItems[newIndex].order = temp;
      return newItems.sort((a, b) => a.order - b.order);
    });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      // Get all hidden item URLs
      const hiddenItems = navItems.filter(item => !item.visible).map(item => item.url);
      
      // Merge with existing hidden items from other groups
      const existingHiddenJson = localStorage.getItem(STORAGE_KEY);
      const existingHidden: string[] = existingHiddenJson ? JSON.parse(existingHiddenJson) : [];
      
      // Remove current group's items from existing hidden
      const otherGroupHidden = existingHidden.filter(
        url => !items.some(item => item.url === url)
      );
      
      // Combine with current group's hidden items
      const allHidden = [...otherGroupHidden, ...hiddenItems];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allHidden));
      
      toast.success('Sidebar preferences saved!', {
        description: 'Reload the page to see changes.',
      });
      
      onSave?.(allHidden);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = navItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleCount = navItems.filter(item => item.visible).length;
  const hiddenCount = navItems.length - visibleCount;

  const getIcon = (iconComponent: any) => {
    if (!iconComponent) return FileText;
    return iconComponent;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br text-white",
              groupColor
            )}>
              <LucideIcons.Settings className="h-4 w-4" />
            </div>
            <div>
              <span>Edit {groupTitle} Shortcuts</span>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {visibleCount} visible
                </Badge>
                {hiddenCount > 0 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {hiddenCount} hidden
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Items List */}
          <ScrollArea className="h-64 border rounded-lg">
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {filteredItems.map((item, index) => {
                  const Icon = getIcon(item.icon);
                  return (
                    <motion.div
                      key={item.url}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border transition-all",
                        item.visible 
                          ? "bg-card hover:bg-muted/50" 
                          : "bg-muted/30 opacity-60"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => moveItem(navItems.findIndex(n => n.url === item.url), 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => moveItem(navItems.findIndex(n => n.url === item.url), 'down')}
                          disabled={index === filteredItems.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                        item.visible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-medium text-sm truncate",
                          !item.visible && "text-muted-foreground"
                        )}>
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {item.url}
                          {(item.url.startsWith('http://') || item.url.startsWith('https://')) && (
                            <ExternalLink className="h-2.5 w-2.5" />
                          )}
                        </div>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 transition-colors",
                          item.visible 
                            ? "text-primary hover:text-primary/80" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => toggleVisibility(item.url)}
                      >
                        {item.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No shortcuts match your search
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Changes are saved to your browser
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
