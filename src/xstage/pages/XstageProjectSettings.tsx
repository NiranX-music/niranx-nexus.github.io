import { useState } from 'react';
import { useXstage } from '../contexts/XstageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROJECT_TYPE_CONFIG, ProjectType } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const XstageProjectSettings = () => {
  const { currentProject, updateProject } = useXstage();
  const [name, setName] = useState(currentProject?.name || '');
  const [type, setType] = useState<ProjectType>(currentProject?.type || 'band');
  const [description, setDescription] = useState(currentProject?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentProject) return;
    setSaving(true);
    await updateProject(currentProject.id, { name, type, description });
    setSaving(false);
  };

  if (!currentProject) return <div className="p-8 text-center text-muted-foreground">No project selected</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Project Settings</h1>
      
      <Card>
        <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Project Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PROJECT_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.emoji} {config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
