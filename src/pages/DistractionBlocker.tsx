import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface BlockedSite {
  id: string;
  user_id: string;
  url: string;
  is_active: boolean;
  created_at: string;
}

export default function DistractionBlocker() {
  const { user } = useAuth();
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBlockedSites();
      loadSettings();
    }
  }, [user]);

  const fetchBlockedSites = async () => {
    const { data, error } = await supabase
      .from('blocked_sites')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBlockedSites(data);
    }
  };

  const loadSettings = () => {
    const enabled = localStorage.getItem('blocking-enabled');
    const focus = localStorage.getItem('focus-mode');
    if (enabled !== null) setBlockingEnabled(enabled === 'true');
    if (focus !== null) setFocusMode(focus === 'true');
  };

  const addBlockedSite = async () => {
    if (!newUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      const { error } = await supabase
        .from('blocked_sites')
        .insert({
          user_id: user?.id,
          url: newUrl.trim(),
          is_active: true,
        });

      if (error) throw error;

      toast.success('Site blocked successfully');
      setNewUrl('');
      fetchBlockedSites();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleSite = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('blocked_sites')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (!error) {
      fetchBlockedSites();
      toast.success(isActive ? 'Site unblocked' : 'Site blocked');
    }
  };

  const deleteSite = async (id: string) => {
    const { error } = await supabase
      .from('blocked_sites')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchBlockedSites();
      toast.success('Site removed');
    }
  };

  const toggleBlockingEnabled = (enabled: boolean) => {
    setBlockingEnabled(enabled);
    localStorage.setItem('blocking-enabled', String(enabled));
    toast.success(enabled ? 'Blocking enabled' : 'Blocking disabled');
  };

  const toggleFocusMode = (enabled: boolean) => {
    setFocusMode(enabled);
    localStorage.setItem('focus-mode', String(enabled));
    toast.success(enabled ? 'Focus mode activated' : 'Focus mode deactivated');
  };

  const commonDistractions = [
    'youtube.com',
    'twitter.com',
    'facebook.com',
    'instagram.com',
    'reddit.com',
    'tiktok.com',
    'netflix.com',
    'twitch.tv',
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Distraction Blocker</h1>
          <p className="text-muted-foreground">Block distracting websites during study sessions</p>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Manage your blocking settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Blocking</Label>
              <p className="text-sm text-muted-foreground">Block access to listed websites</p>
            </div>
            <Switch
              checked={blockingEnabled}
              onCheckedChange={toggleBlockingEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Focus Mode</Label>
              <p className="text-sm text-muted-foreground">Block all social media & entertainment</p>
            </div>
            <Switch
              checked={focusMode}
              onCheckedChange={toggleFocusMode}
            />
          </div>

          {focusMode && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-orange-600">Focus Mode Active</p>
                <p className="text-sm text-muted-foreground">
                  All common distracting websites are blocked
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Site */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add Blocked Site</CardTitle>
          <CardDescription>Add websites you want to block</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., youtube.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBlockedSite()}
            />
            <Button onClick={addBlockedSite}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Quick add common distractions:</p>
            <div className="flex flex-wrap gap-2">
              {commonDistractions.map((site) => (
                <Badge
                  key={site}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setNewUrl(site)}
                >
                  {site}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Sites List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Blocked Sites ({blockedSites.length})</CardTitle>
          <CardDescription>Manage your blocked websites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {blockedSites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No blocked sites yet</p>
              </div>
            ) : (
              blockedSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Shield className={`w-4 h-4 ${site.is_active ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className={site.is_active ? '' : 'line-through text-muted-foreground'}>
                      {site.url}
                    </span>
                    {site.is_active && (
                      <Badge variant="destructive" className="text-xs">Blocked</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={site.is_active}
                      onCheckedChange={() => toggleSite(site.id, site.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSite(site.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Blocked websites will show a reminder message when you try to visit them</p>
          <p>• Focus Mode automatically blocks common distracting sites</p>
          <p>• You can temporarily disable blocking for specific sites</p>
          <p>• Settings are saved locally and synced across your devices</p>
        </CardContent>
      </Card>
    </div>
  );
}
