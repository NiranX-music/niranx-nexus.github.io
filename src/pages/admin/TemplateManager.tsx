import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, Pencil, Trash2, BookOpen, Users, 
  Clock, Save, X
} from 'lucide-react';

interface StudyTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  template_data: Record<string, any> | null;
  is_active: boolean;
  downloads_count: number;
  created_at: string;
}

const categories = [
  { value: 'language', label: 'Language Learning' },
  { value: 'competitive', label: 'Competitive Exams' },
  { value: 'academic', label: 'Academic' },
  { value: 'habit', label: 'Habit Building' },
  { value: 'professional', label: 'Professional' }
];

export default function TemplateManager() {
  const [templates, setTemplates] = useState<StudyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<StudyTemplate | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'academic',
    weeks: 4,
    dailyHours: 3,
    subjects: '',
    phases: '',
    isActive: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('study_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []).map(t => ({
        ...t,
        template_data: (t.template_data as Record<string, any>) || {}
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const templateData = {
        weeks: formData.weeks,
        daily_hours: formData.dailyHours,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
        phases: formData.phases.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('study_templates')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            template_data: templateData,
            is_active: formData.isActive
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: 'Template Updated' });
      } else {
        const { error } = await supabase
          .from('study_templates')
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            template_data: templateData,
            is_active: formData.isActive,
            created_by: user.id
          });

        if (error) throw error;
        toast({ title: 'Template Created' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (template: StudyTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      weeks: template.template_data?.weeks || 4,
      dailyHours: template.template_data?.daily_hours || 3,
      subjects: template.template_data?.subjects?.join(', ') || '',
      phases: template.template_data?.phases?.join(', ') || '',
      isActive: template.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('study_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Template Deleted' });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('study_templates')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      category: 'academic',
      weeks: 4,
      dailyHours: 3,
      subjects: '',
      phases: '',
      isActive: true
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Template Manager</h1>
            <p className="text-muted-foreground">Create and manage study templates for users</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., IELTS Preparation"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this study plan"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (weeks)</Label>
                    <Input
                      type="number"
                      value={formData.weeks}
                      onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) || 4 })}
                    />
                  </div>
                  <div>
                    <Label>Daily Hours</Label>
                    <Input
                      type="number"
                      value={formData.dailyHours}
                      onChange={(e) => setFormData({ ...formData, dailyHours: parseInt(e.target.value) || 3 })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Subjects (comma separated)</Label>
                  <Input
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="Physics, Chemistry, Math"
                  />
                </div>
                <div>
                  <Label>Phases (comma separated)</Label>
                  <Input
                    value={formData.phases}
                    onChange={(e) => setFormData({ ...formData, phases: e.target.value })}
                    placeholder="Foundation, Practice, Revision"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {editingTemplate ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Templates Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first study template</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!template.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {!template.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {template.template_data?.weeks || 0} weeks
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {template.downloads_count || 0} downloads
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={() => toggleActive(template.id, template.is_active)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
