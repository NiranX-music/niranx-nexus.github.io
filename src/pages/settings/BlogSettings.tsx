import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Bell, Eye, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const BlogSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    showEditHistory: true,
    allowComments: false,
    autoSave: true,
    defaultPublic: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('blogSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('blogSettings', JSON.stringify(newSettings));
    
    toast({
      title: "Settings Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Blog Settings</h1>
            <p className="text-muted-foreground">Manage your blog preferences</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when someone edits your blog</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Display Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showEditHistory">Show Edit History</Label>
                <p className="text-sm text-muted-foreground">Display edit history on blog posts</p>
              </div>
              <Switch
                id="showEditHistory"
                checked={settings.showEditHistory}
                onCheckedChange={(checked) => updateSetting('showEditHistory', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="defaultPublic">Publish by Default</Label>
                <p className="text-sm text-muted-foreground">New blogs are published automatically</p>
              </div>
              <Switch
                id="defaultPublic"
                checked={settings.defaultPublic}
                onCheckedChange={(checked) => updateSetting('defaultPublic', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy & Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSave">Auto Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save drafts while editing</p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowComments">Allow Comments</Label>
                <p className="text-sm text-muted-foreground">Enable comments on your blog posts (coming soon)</p>
              </div>
              <Switch
                id="allowComments"
                checked={settings.allowComments}
                onCheckedChange={(checked) => updateSetting('allowComments', checked)}
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogSettings;
