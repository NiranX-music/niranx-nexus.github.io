import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  RotateCcw
} from "lucide-react";

interface SidebarGroup {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
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

interface UserPreference {
  id: string;
  group_id: string | null;
  page_id: string | null;
  is_enabled: boolean;
  order_index: number | null;
  disabled_until: string | null;
}

interface CustomGroup {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
}

interface CustomPage {
  id: string;
  group_id: string | null;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
  is_enabled: boolean;
  disabled_until: string | null;
}

export function UserSidebarManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Default groups/pages from admin
  const [defaultGroups, setDefaultGroups] = useState<SidebarGroup[]>([]);
  const [defaultPages, setDefaultPages] = useState<SidebarPage[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  
  // User's custom groups/pages
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  // Dialogs
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
  
  const [editingGroup, setEditingGroup] = useState<CustomGroup | null>(null);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [groupsRes, pagesRes, prefsRes, customGroupsRes, customPagesRes] = await Promise.all([
        supabase.from('sidebar_groups').select('*').order('order_index'),
        supabase.from('sidebar_pages').select('*').order('order_index'),
        supabase.from('user_sidebar_preferences').select('*').eq('user_id', user.id),
        supabase.from('user_custom_sidebar_groups').select('*').eq('user_id', user.id).order('order_index'),
        supabase.from('user_custom_sidebar_pages').select('*').eq('user_id', user.id).order('order_index')
      ]);

      setDefaultGroups(groupsRes.data || []);
      setDefaultPages(pagesRes.data || []);
      setPreferences(prefsRes.data || []);
      setCustomGroups(customGroupsRes.data || []);
      setCustomPages(customPagesRes.data || []);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
      toast.error('Failed to load sidebar configuration');
    } finally {
      setLoading(false);
    }
  };

  const isGroupEnabled = (groupId: string) => {
    const pref = preferences.find(p => p.group_id === groupId && !p.page_id);
    return pref?.is_enabled ?? true;
  };

  const isPageEnabled = (pageId: string) => {
    const pref = preferences.find(p => p.page_id === pageId);
    return pref?.is_enabled ?? true;
  };

  const getPageDisabledUntil = (pageId: string) => {
    const pref = preferences.find(p => p.page_id === pageId);
    return pref?.disabled_until || null;
  };

  const toggleGroupPreference = async (groupId: string) => {
    if (!user) return;
    
    const currentEnabled = isGroupEnabled(groupId);
    const existingPref = preferences.find(p => p.group_id === groupId && !p.page_id);

    try {
      if (existingPref) {
        await supabase
          .from('user_sidebar_preferences')
          .update({ is_enabled: !currentEnabled })
          .eq('id', existingPref.id);
      } else {
        await supabase.from('user_sidebar_preferences').insert({
          user_id: user.id,
          group_id: groupId,
          page_id: null,
          is_enabled: !currentEnabled
        });
      }
      loadData();
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
    }
  };

  const togglePagePreference = async (pageId: string) => {
    if (!user) return;
    
    const currentEnabled = isPageEnabled(pageId);
    const existingPref = preferences.find(p => p.page_id === pageId);

    try {
      if (existingPref) {
        await supabase
          .from('user_sidebar_preferences')
          .update({ is_enabled: !currentEnabled })
          .eq('id', existingPref.id);
      } else {
        await supabase.from('user_sidebar_preferences').insert({
          user_id: user.id,
          group_id: null,
          page_id: pageId,
          is_enabled: !currentEnabled
        });
      }
      loadData();
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
    }
  };

  const setPageDisabledUntil = async (pageId: string, until: string | null) => {
    if (!user) return;
    
    const existingPref = preferences.find(p => p.page_id === pageId);

    try {
      if (existingPref) {
        await supabase
          .from('user_sidebar_preferences')
          .update({ disabled_until: until })
          .eq('id', existingPref.id);
      } else {
        await supabase.from('user_sidebar_preferences').insert({
          user_id: user.id,
          group_id: null,
          page_id: pageId,
          is_enabled: true,
          disabled_until: until
        });
      }
      toast.success(until ? 'Page temporarily hidden' : 'Timer cleared');
      loadData();
    } catch (error) {
      console.error('Error updating timer:', error);
      toast.error('Failed to update timer');
    }
  };

  const resetPreferences = async () => {
    if (!user) return;
    if (!confirm('Reset all sidebar preferences to defaults?')) return;

    try {
      await supabase.from('user_sidebar_preferences').delete().eq('user_id', user.id);
      toast.success('Preferences reset to defaults');
      loadData();
    } catch (error) {
      console.error('Error resetting preferences:', error);
      toast.error('Failed to reset preferences');
    }
  };

  // Custom group/page management
  const createCustomGroup = async () => {
    if (!user || !newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      setSaving(true);
      const maxOrder = Math.max(...customGroups.map(g => g.order_index), -1);
      
      await supabase.from('user_custom_sidebar_groups').insert({
        user_id: user.id,
        name: newGroupName,
        icon: newGroupIcon || null,
        order_index: maxOrder + 1,
        is_enabled: true
      });

      toast.success('Custom group created');
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

  const updateCustomGroup = async () => {
    if (!editingGroup) return;

    try {
      setSaving(true);
      await supabase
        .from('user_custom_sidebar_groups')
        .update({
          name: editingGroup.name,
          icon: editingGroup.icon,
          is_enabled: editingGroup.is_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGroup.id);

      toast.success('Group updated');
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

  const deleteCustomGroup = async (groupId: string) => {
    if (!confirm('Delete this custom group?')) return;

    try {
      await supabase.from('user_custom_sidebar_groups').delete().eq('id', groupId);
      toast.success('Group deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const createCustomPage = async () => {
    if (!user || !newPageTitle.trim() || !newPageUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      setSaving(true);
      const groupPages = customPages.filter(p => p.group_id === newPageGroupId);
      const maxOrder = Math.max(...groupPages.map(p => p.order_index), -1);
      
      await supabase.from('user_custom_sidebar_pages').insert({
        user_id: user.id,
        group_id: newPageGroupId,
        title: newPageTitle,
        url: newPageUrl,
        icon: newPageIcon || null,
        order_index: maxOrder + 1,
        is_enabled: true
      });

      toast.success('Custom page added');
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

  const updateCustomPage = async () => {
    if (!editingPage) return;

    try {
      setSaving(true);
      await supabase
        .from('user_custom_sidebar_pages')
        .update({
          title: editingPage.title,
          url: editingPage.url,
          icon: editingPage.icon,
          is_enabled: editingPage.is_enabled,
          disabled_until: editingPage.disabled_until,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPage.id);

      toast.success('Page updated');
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

  const deleteCustomPage = async (pageId: string) => {
    if (!confirm('Delete this custom page?')) return;

    try {
      await supabase.from('user_custom_sidebar_pages').delete().eq('id', pageId);
      toast.success('Page deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
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
        <CardTitle className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-primary" />
          Manage Your Sidebar
        </CardTitle>
        <CardDescription>
          Customize which groups and pages appear in your sidebar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="defaults">
          <TabsList className="w-full">
            <TabsTrigger value="defaults" className="flex-1">Default Pages</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">Custom Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="defaults" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={resetPreferences}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>

            {defaultGroups.map((group) => {
              const groupPages = defaultPages.filter(p => p.group_id === group.id);
              const isExpanded = expandedGroups.includes(group.id);
              const groupEnabled = isGroupEnabled(group.id);

              return (
                <Collapsible key={group.id} open={isExpanded} onOpenChange={() => toggleExpanded(group.id)}>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted/30">
                      <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                        <span className="font-medium">{group.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {groupPages.length} pages
                        </Badge>
                      </CollapsibleTrigger>
                      <Switch 
                        checked={groupEnabled}
                        onCheckedChange={() => toggleGroupPreference(group.id)}
                      />
                    </div>
                    
                    <CollapsibleContent>
                      <div className="p-3 space-y-2 bg-background">
                        {groupPages.map((page) => {
                          const pageEnabled = isPageEnabled(page.id);
                          const disabledUntil = getPageDisabledUntil(page.id);

                          return (
                            <div 
                              key={page.id}
                              className="flex items-center justify-between p-2 rounded-md border bg-card"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{page.title}</span>
                                  {!pageEnabled && (
                                    <Badge variant="outline" className="text-xs">Hidden</Badge>
                                  )}
                                  {disabledUntil && new Date(disabledUntil) > new Date() && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Until {new Date(disabledUntil).toLocaleDateString()}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">{page.url}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => togglePagePreference(page.id)}
                                >
                                  {pageEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="flex gap-2 justify-end">
              <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Group Name</Label>
                      <Input 
                        value={newGroupName} 
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g., My Tools"
                      />
                    </div>
                    <div>
                      <Label>Icon (Lucide icon name)</Label>
                      <Input 
                        value={newGroupIcon} 
                        onChange={(e) => setNewGroupIcon(e.target.value)}
                        placeholder="e.g., Star"
                      />
                    </div>
                    <Button onClick={createCustomGroup} disabled={saving} className="w-full">
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Page</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Group</Label>
                      <select 
                        className="w-full p-2 border rounded-md bg-background"
                        value={newPageGroupId || ''}
                        onChange={(e) => setNewPageGroupId(e.target.value || null)}
                      >
                        <option value="">No Group</option>
                        {customGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Page Title</Label>
                      <Input 
                        value={newPageTitle} 
                        onChange={(e) => setNewPageTitle(e.target.value)}
                        placeholder="e.g., My Page"
                      />
                    </div>
                    <div>
                      <Label>URL Path</Label>
                      <Input 
                        value={newPageUrl} 
                        onChange={(e) => setNewPageUrl(e.target.value)}
                        placeholder="e.g., /my-page or https://..."
                      />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <Input 
                        value={newPageIcon} 
                        onChange={(e) => setNewPageIcon(e.target.value)}
                        placeholder="e.g., Link"
                      />
                    </div>
                    <Button onClick={createCustomPage} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Add Page
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {customGroups.length === 0 && customPages.filter(p => !p.group_id).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No custom groups or pages yet. Create your first one!
              </div>
            ) : (
              <>
                {customGroups.map((group) => {
                  const groupPages = customPages.filter(p => p.group_id === group.id);
                  const isExpanded = expandedGroups.includes(`custom-${group.id}`);

                  return (
                    <Collapsible key={group.id} open={isExpanded} onOpenChange={() => toggleExpanded(`custom-${group.id}`)}>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-muted/30">
                          <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary">
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                            <span className="font-medium">{group.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {groupPages.length} pages
                            </Badge>
                          </CollapsibleTrigger>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={group.is_enabled}
                              onCheckedChange={async () => {
                                await supabase
                                  .from('user_custom_sidebar_groups')
                                  .update({ is_enabled: !group.is_enabled })
                                  .eq('id', group.id);
                                loadData();
                              }}
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
                              className="text-destructive"
                              onClick={() => deleteCustomGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="p-3 space-y-2 bg-background">
                            {groupPages.map((page) => (
                              <div 
                                key={page.id}
                                className="flex items-center justify-between p-2 rounded-md border bg-card"
                              >
                                <div>
                                  <span className="font-medium text-sm">{page.title}</span>
                                  <br />
                                  <span className="text-xs text-muted-foreground">{page.url}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Switch 
                                    checked={page.is_enabled}
                                    onCheckedChange={async () => {
                                      await supabase
                                        .from('user_custom_sidebar_pages')
                                        .update({ is_enabled: !page.is_enabled })
                                        .eq('id', page.id);
                                      loadData();
                                    }}
                                  />
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
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
                                    className="text-destructive"
                                    onClick={() => deleteCustomPage(page.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Custom Group Dialog */}
        <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Custom Group</DialogTitle>
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
                <Button onClick={updateCustomGroup} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Custom Page Dialog */}
        <Dialog open={editPageOpen} onOpenChange={setEditPageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Custom Page</DialogTitle>
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
                <Button onClick={updateCustomPage} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
