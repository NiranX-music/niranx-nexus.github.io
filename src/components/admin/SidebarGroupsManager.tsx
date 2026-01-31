import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  Edit2, 
  Eye, 
  EyeOff,
  Clock,
  Folder,
  FileText,
  Loader2,
  Save,
  Search,
  Check,
  Settings2,
  Layers
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allPages, pageCategories } from "@/data/allPages";
import * as LucideIcons from "lucide-react";

// Prebuilt navigation config from AppSidebar - editable reference
const prebuiltNavigationConfig = {
  main: { title: "Main", icon: "Compass", color: "from-blue-500 to-cyan-500" },
  ai: { title: "AI Hub", icon: "Brain", color: "from-purple-500 to-pink-500" },
  study: { title: "Study & Focus", icon: "Target", color: "from-green-500 to-emerald-500" },
  learning: { title: "Learning", icon: "GraduationCap", color: "from-orange-500 to-amber-500" },
  progress: { title: "Progress", icon: "TrendingUp", color: "from-rose-500 to-red-500" },
  tests: { title: "Tests", icon: "FileText", color: "from-indigo-500 to-violet-500" },
  xvibe: { title: "XVibe Music", icon: "Music", color: "from-fuchsia-500 to-purple-500" },
  xstage: { title: "Xstage", icon: "FileMusic", color: "from-cyan-500 to-teal-500" },
  social: { title: "Social", icon: "Users", color: "from-sky-500 to-blue-500" },
  debate: { title: "Debates", icon: "MessageCircle", color: "from-amber-500 to-yellow-500" },
  files: { title: "Files & Cloud", icon: "Cloud", color: "from-slate-500 to-gray-500" },
  tools: { title: "Tools", icon: "Workflow", color: "from-zinc-500 to-neutral-500" },
  settings: { title: "Settings", icon: "Settings", color: "from-gray-500 to-stone-500" },
  archive: { title: "Archive", icon: "Archive", color: "from-stone-500 to-neutral-600" },
};

interface SidebarGroup {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
  is_default: boolean;
}

interface SidebarPage {
  id: string;
  group_id: string | null;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
  disabled_until: string | null;
}

export function SidebarGroupsManager() {
  const [groups, setGroups] = useState<SidebarGroup[]>([]);
  const [pages, setPages] = useState<SidebarPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  // New group/page dialogs
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [editPageOpen, setEditPageOpen] = useState(false);
  
  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageUrl, setNewPageUrl] = useState("");
  const [newPageIcon, setNewPageIcon] = useState("");
  const [newPageGroupId, setNewPageGroupId] = useState<string | null>(null);
  
  // Page search states for prebuild list
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [selectedPageCategory, setSelectedPageCategory] = useState<string>("all");
  
  const [editingGroup, setEditingGroup] = useState<SidebarGroup | null>(null);
  const [editingPage, setEditingPage] = useState<SidebarPage | null>(null);

  // Filter all pages based on search and category
  const filteredAllPages = useMemo(() => {
    return allPages.filter(page => {
      const matchesSearch = 
        page.name.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
        page.route.toLowerCase().includes(pageSearchQuery.toLowerCase());
      
      const matchesCategory = selectedPageCategory === "all" || page.category === selectedPageCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [pageSearchQuery, selectedPageCategory]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsRes, pagesRes] = await Promise.all([
        supabase.from('sidebar_groups').select('*').order('order_index'),
        supabase.from('sidebar_pages').select('*').order('order_index')
      ]);

      if (groupsRes.error) throw groupsRes.error;
      if (pagesRes.error) throw pagesRes.error;

      setGroups(groupsRes.data || []);
      setPages(pagesRes.data || []);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
      toast.error('Failed to load sidebar configuration');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      setSaving(true);
      const maxOrder = Math.max(...groups.map(g => g.order_index), -1);
      
      const { error } = await supabase.from('sidebar_groups').insert({
        name: newGroupName,
        icon: newGroupIcon || null,
        order_index: maxOrder + 1,
        is_enabled: true,
        is_default: false
      });

      if (error) throw error;
      
      toast.success('Group created successfully');
      setNewGroupName("");
      setNewGroupIcon("");
      setNewGroupOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const updateGroup = async () => {
    if (!editingGroup) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('sidebar_groups')
        .update({
          name: editingGroup.name,
          icon: editingGroup.icon,
          is_enabled: editingGroup.is_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGroup.id);

      if (error) throw error;
      
      toast.success('Group updated successfully');
      setEditGroupOpen(false);
      setEditingGroup(null);
      loadData();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group and all its pages?')) return;

    try {
      const { error } = await supabase.from('sidebar_groups').delete().eq('id', groupId);
      if (error) throw error;
      
      toast.success('Group deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const toggleGroupEnabled = async (group: SidebarGroup) => {
    try {
      const { error } = await supabase
        .from('sidebar_groups')
        .update({ is_enabled: !group.is_enabled, updated_at: new Date().toISOString() })
        .eq('id', group.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling group:', error);
      toast.error('Failed to update group');
    }
  };

  const createPage = async () => {
    if (!newPageTitle.trim() || !newPageUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      setSaving(true);
      const groupPages = pages.filter(p => p.group_id === newPageGroupId);
      const maxOrder = Math.max(...groupPages.map(p => p.order_index), -1);
      
      const { error } = await supabase.from('sidebar_pages').insert({
        group_id: newPageGroupId,
        title: newPageTitle,
        url: newPageUrl,
        icon: newPageIcon || null,
        order_index: maxOrder + 1,
        is_enabled: true
      });

      if (error) throw error;
      
      toast.success('Page added successfully');
      setNewPageTitle("");
      setNewPageUrl("");
      setNewPageIcon("");
      setNewPageGroupId(null);
      setNewPageOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to add page');
    } finally {
      setSaving(false);
    }
  };

  const updatePage = async () => {
    if (!editingPage) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('sidebar_pages')
        .update({
          title: editingPage.title,
          url: editingPage.url,
          icon: editingPage.icon,
          is_enabled: editingPage.is_enabled,
          disabled_until: editingPage.disabled_until,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPage.id);

      if (error) throw error;
      
      toast.success('Page updated successfully');
      setEditPageOpen(false);
      setEditingPage(null);
      loadData();
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error('Failed to update page');
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('Delete this page?')) return;

    try {
      const { error } = await supabase.from('sidebar_pages').delete().eq('id', pageId);
      if (error) throw error;
      
      toast.success('Page deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const togglePageEnabled = async (page: SidebarPage) => {
    try {
      const { error } = await supabase
        .from('sidebar_pages')
        .update({ is_enabled: !page.is_enabled, updated_at: new Date().toISOString() })
        .eq('id', page.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling page:', error);
      toast.error('Failed to update page');
    }
  };

  const setPageDisabledUntil = async (pageId: string, until: string | null) => {
    try {
      const { error } = await supabase
        .from('sidebar_pages')
        .update({ disabled_until: until, updated_at: new Date().toISOString() })
        .eq('id', pageId);

      if (error) throw error;
      toast.success(until ? 'Page temporarily disabled' : 'Page timer cleared');
      loadData();
    } catch (error) {
      console.error('Error updating page timer:', error);
      toast.error('Failed to update page');
    }
  };

  const moveGroup = async (groupId: string, direction: 'up' | 'down') => {
    const currentIndex = groups.findIndex(g => g.id === groupId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    try {
      const updates = [
        { id: groups[currentIndex].id, order_index: targetIndex },
        { id: groups[targetIndex].id, order_index: currentIndex }
      ];

      for (const update of updates) {
        await supabase
          .from('sidebar_groups')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
      loadData();
    } catch (error) {
      console.error('Error reordering groups:', error);
      toast.error('Failed to reorder groups');
    }
  };

  const movePage = async (pageId: string, direction: 'up' | 'down') => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const groupPages = pages.filter(p => p.group_id === page.group_id).sort((a, b) => a.order_index - b.order_index);
    const currentIndex = groupPages.findIndex(p => p.id === pageId);
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= groupPages.length) return;

    try {
      const updates = [
        { id: groupPages[currentIndex].id, order_index: targetIndex },
        { id: groupPages[targetIndex].id, order_index: currentIndex }
      ];

      for (const update of updates) {
        await supabase
          .from('sidebar_pages')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
      loadData();
    } catch (error) {
      console.error('Error reordering pages:', error);
      toast.error('Failed to reorder pages');
    }
  };

  const toggleExpanded = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Manage Sidebar Groups
          </CardTitle>
          <CardDescription>
            Configure sidebar groups and pages that all users will see by default
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="custom" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Custom Groups
            </TabsTrigger>
            <TabsTrigger value="prebuilt" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Edit Prebuilt Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="flex gap-2 justify-end mb-4">
              <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Group Name</Label>
                      <Input 
                        value={newGroupName} 
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g., Tools & Utilities"
                      />
                    </div>
                    <div>
                      <Label>Icon (Lucide icon name)</Label>
                      <Input 
                        value={newGroupIcon} 
                        onChange={(e) => setNewGroupIcon(e.target.value)}
                        placeholder="e.g., Settings, Book, etc."
                      />
                    </div>
                    <Button onClick={createGroup} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={newPageOpen} onOpenChange={setNewPageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    New Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Add New Page</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Group</Label>
                      <select 
                        className="w-full p-2 border rounded-md bg-background"
                        value={newPageGroupId || ''}
                        onChange={(e) => setNewPageGroupId(e.target.value || null)}
                      >
                        <option value="">No Group (Root Level)</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Prebuild Pages List */}
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <Label className="text-sm font-medium mb-2 block">Quick Add from All Pages</Label>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search pages..."
                          value={pageSearchQuery}
                          onChange={(e) => setPageSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge 
                          variant={selectedPageCategory === "all" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedPageCategory("all")}
                        >
                          All
                        </Badge>
                        {pageCategories.map(cat => (
                          <Badge 
                            key={cat}
                            variant={selectedPageCategory === cat ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => setSelectedPageCategory(cat)}
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                      <ScrollArea className="h-48 border rounded-md">
                        <div className="p-2 space-y-1">
                          {filteredAllPages.map((page) => {
                            const IconComponent = (LucideIcons as any)[page.icon] || LucideIcons.FileText;
                            const isSelected = newPageUrl === page.route;
                            return (
                              <button
                                key={page.route}
                                onClick={() => {
                                  setNewPageTitle(page.name);
                                  setNewPageUrl(page.route);
                                  setNewPageIcon(page.icon);
                                }}
                                className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${
                                  isSelected 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-muted'
                                }`}
                              >
                                <IconComponent className="h-4 w-4 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{page.name}</div>
                                  <div className={`text-xs truncate ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {page.route}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {page.category}
                                </Badge>
                                {isSelected && <Check className="h-4 w-4 shrink-0" />}
                              </button>
                            );
                          })}
                          {filteredAllPages.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              No pages found
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="border-t pt-4">
                      <Label className="text-sm text-muted-foreground mb-2 block">Or enter custom details:</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Page Title</Label>
                          <Input 
                            value={newPageTitle} 
                            onChange={(e) => setNewPageTitle(e.target.value)}
                            placeholder="e.g., Dashboard"
                          />
                        </div>
                        <div>
                          <Label>Icon (Lucide)</Label>
                          <Input 
                            value={newPageIcon} 
                            onChange={(e) => setNewPageIcon(e.target.value)}
                            placeholder="e.g., Home"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label>URL Path</Label>
                        <Input 
                          value={newPageUrl} 
                          onChange={(e) => setNewPageUrl(e.target.value)}
                          placeholder="e.g., /dashboard"
                        />
                      </div>
                    </div>
                    
                    <Button onClick={createPage} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Add Page
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Custom Groups List */}
        {groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sidebar groups configured yet. Create your first group to get started.
          </div>
        ) : (
          groups.map((group, index) => {
            const groupPages = pages.filter(p => p.group_id === group.id).sort((a, b) => a.order_index - b.order_index);
            const isExpanded = expandedGroups.includes(group.id);

            return (
              <Collapsible key={group.id} open={isExpanded} onOpenChange={() => toggleExpanded(group.id)}>
                <div className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5"
                          onClick={() => moveGroup(group.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronDown className="h-3 w-3 rotate-180" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5"
                          onClick={() => moveGroup(group.id, 'down')}
                          disabled={index === groups.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                        <span className="font-medium">{group.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {groupPages.length} pages
                        </Badge>
                      </CollapsibleTrigger>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={group.is_enabled}
                        onCheckedChange={() => toggleGroupEnabled(group)}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => {
                          setEditingGroup(group);
                          setEditGroupOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="p-3 space-y-2 bg-background">
                      {groupPages.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No pages in this group
                        </div>
                      ) : (
                        groupPages.map((page, pageIndex) => (
                          <div 
                            key={page.id}
                            className="flex items-center justify-between p-2 rounded-md border bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-0.5">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-4 w-4"
                                  onClick={() => movePage(page.id, 'up')}
                                  disabled={pageIndex === 0}
                                >
                                  <ChevronDown className="h-2 w-2 rotate-180" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-4 w-4"
                                  onClick={() => movePage(page.id, 'down')}
                                  disabled={pageIndex === groupPages.length - 1}
                                >
                                  <ChevronDown className="h-2 w-2" />
                                </Button>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{page.title}</span>
                                  {!page.is_enabled && (
                                    <Badge variant="outline" className="text-xs">Disabled</Badge>
                                  )}
                                  {page.disabled_until && new Date(page.disabled_until) > new Date() && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Until {new Date(page.disabled_until).toLocaleDateString()}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">{page.url}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => togglePageEnabled(page)}
                              >
                                {page.is_enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingPage(page);
                                  setEditPageOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deletePage(page.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })
        )}

            {/* Edit Group Dialog */}
            <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Group</DialogTitle>
                </DialogHeader>
                {editingGroup && (
                  <div className="space-y-4">
                    <div>
                      <Label>Group Name</Label>
                      <Input 
                        value={editingGroup.name} 
                        onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <Input 
                        value={editingGroup.icon || ''} 
                        onChange={(e) => setEditingGroup({...editingGroup, icon: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enabled</Label>
                      <Switch 
                        checked={editingGroup.is_enabled}
                        onCheckedChange={(checked) => setEditingGroup({...editingGroup, is_enabled: checked})}
                      />
                    </div>
                    <Button onClick={updateGroup} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Page Dialog */}
            <Dialog open={editPageOpen} onOpenChange={setEditPageOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Page</DialogTitle>
                </DialogHeader>
                {editingPage && (
                  <div className="space-y-4">
                    <div>
                      <Label>Page Title</Label>
                      <Input 
                        value={editingPage.title} 
                        onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>URL Path</Label>
                      <Input 
                        value={editingPage.url} 
                        onChange={(e) => setEditingPage({...editingPage, url: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <Input 
                        value={editingPage.icon || ''} 
                        onChange={(e) => setEditingPage({...editingPage, icon: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enabled</Label>
                      <Switch 
                        checked={editingPage.is_enabled}
                        onCheckedChange={(checked) => setEditingPage({...editingPage, is_enabled: checked})}
                      />
                    </div>
                    <div>
                      <Label>Disable Until (Optional)</Label>
                      <Input 
                        type="datetime-local"
                        value={editingPage.disabled_until?.slice(0, 16) || ''} 
                        onChange={(e) => setEditingPage({
                          ...editingPage, 
                          disabled_until: e.target.value ? new Date(e.target.value).toISOString() : null
                        })}
                      />
                    </div>
                    <Button onClick={updatePage} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Prebuilt Groups Tab */}
          <TabsContent value="prebuilt" className="space-y-4 mt-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                View and understand the prebuilt navigation groups in the sidebar. These are hardcoded in the application but you can add custom groups above to extend them.
              </p>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {Object.entries(prebuiltNavigationConfig).map(([key, config]) => {
                  const IconComponent = (LucideIcons as any)[config.icon] || LucideIcons.Folder;
                  return (
                    <div key={key} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{config.title}</h4>
                          <p className="text-xs text-muted-foreground">Key: {key}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          <Settings2 className="w-3 h-3 mr-1" />
                          Prebuilt
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> To modify prebuilt groups, you need to edit the sidebar configuration in the codebase. 
                Custom groups you create above will appear alongside these prebuilt groups in the sidebar.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
