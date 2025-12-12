import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Settings, Users, Folder } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarGroupsManager } from "@/components/admin/SidebarGroupsManager";

export default function ManageUserControls() {
  const [allowUnauthorizedAI, setAllowUnauthorizedAI] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAdminSettings();
  }, []);

  const loadAdminSettings = async () => {
    try {
      setSettingsLoading(true);
      
      const { data: unauthorizedData } = await supabase.rpc('get_admin_setting', {
        p_setting_key: 'allow_unauthorized_ai'
      });
      
      if (unauthorizedData && typeof unauthorizedData === 'object' && 'setting_value' in unauthorizedData) {
        const settingValue = (unauthorizedData as any).setting_value;
        const value = typeof settingValue === 'object' && 
                     settingValue !== null && 
                     'enabled' in settingValue 
                     ? settingValue.enabled 
                     : settingValue;
        setAllowUnauthorizedAI(value === true);
      }
    } catch (error) {
      console.error('Error loading admin settings:', error);
      toast.error('Failed to load admin settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateAdminSetting = async (key: string, enabled: boolean) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: { enabled },
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) throw error;
      
      toast.success(`Setting updated successfully`);
    } catch (error) {
      console.error('Error updating admin setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setUpdating(false);
    }
  };

  const handleUnauthorizedAIToggle = async () => {
    const newValue = !allowUnauthorizedAI;
    setAllowUnauthorizedAI(newValue);
    await updateAdminSetting('allow_unauthorized_ai', newValue);
  };

  if (settingsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manage User Controls</h1>
          <p className="text-muted-foreground">Control platform-wide user access and features</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            General Settings
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Sidebar Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Unauthorized AI Access Control */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Unauthorized AI Access</CardTitle>
              </div>
              <CardDescription>
                Allow users who are not logged in to use AI tools. This enables guest access to AI features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="allow-unauthorized-ai"
                  checked={allowUnauthorizedAI}
                  onCheckedChange={handleUnauthorizedAIToggle}
                  disabled={updating}
                />
                <label
                  htmlFor="allow-unauthorized-ai"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow unauthorized and not logged in users to use AI tools
                </label>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Status:</strong> {allowUnauthorizedAI ? (
                    <span className="text-green-600 font-semibold">Enabled - Guest users can access AI tools</span>
                  ) : (
                    <span className="text-orange-600 font-semibold">Disabled - Only logged in users can access AI tools</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Changes to these settings take effect immediately across the platform</p>
              <p>• Allowing unauthorized access may increase AI usage costs</p>
              <p>• Monitor usage patterns regularly when this feature is enabled</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sidebar">
          <SidebarGroupsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}