import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface NotebookEntry {
  id: string;
  experiment_name: string;
  observations: string;
  results: string;
  data: any;
  created_at: string;
  updated_at: string;
}

interface LabNotebookProps {
  labType: 'chemistry' | 'physics' | 'biology';
}

export function LabNotebook({ labType }: LabNotebookProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NotebookEntry | null>(null);
  const [formData, setFormData] = useState({
    experiment_name: '',
    observations: '',
    results: '',
  });

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user, labType]);

  const loadEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('lab_notebook_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('lab_type', labType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading notebook entries:', error);
      toast.error('Failed to load notebook entries');
    } else {
      setEntries(data || []);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save entries');
      return;
    }

    if (!formData.experiment_name.trim()) {
      toast.error('Please enter an experiment name');
      return;
    }

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('lab_notebook_entries')
          .update({
            experiment_name: formData.experiment_name,
            observations: formData.observations,
            results: formData.results,
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast.success('Entry updated!');
      } else {
        const { error } = await supabase.from('lab_notebook_entries').insert({
          user_id: user.id,
          lab_type: labType,
          experiment_name: formData.experiment_name,
          observations: formData.observations,
          results: formData.results,
        });

        if (error) throw error;
        toast.success('Entry saved!');
      }

      setFormData({ experiment_name: '', observations: '', results: '' });
      setEditingEntry(null);
      setIsDialogOpen(false);
      loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase.from('lab_notebook_entries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    } else {
      toast.success('Entry deleted');
      loadEntries();
    }
  };

  const handleEdit = (entry: NotebookEntry) => {
    setEditingEntry(entry);
    setFormData({
      experiment_name: entry.experiment_name,
      observations: entry.observations || '',
      results: entry.results || '',
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
    setFormData({ experiment_name: '', observations: '', results: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          <h3 className="text-2xl font-bold">Lab Notebook</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEntry(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'New Lab Entry'}</DialogTitle>
              <DialogDescription>
                Record your experiment observations and results
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Experiment Name</label>
                <Input
                  placeholder="Enter experiment name..."
                  value={formData.experiment_name}
                  onChange={(e) =>
                    setFormData({ ...formData, experiment_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Observations</label>
                <Textarea
                  placeholder="What did you observe during the experiment?"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Results & Conclusions</label>
                <Textarea
                  placeholder="What were the results and what did you conclude?"
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleDialogClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  {editingEntry ? 'Update' : 'Save'} Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No entries yet. Start recording your experiments!</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{entry.experiment_name}</CardTitle>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline">{labType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {entry.observations && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Observations:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {entry.observations}
                    </p>
                  </div>
                )}
                {entry.results && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Results & Conclusions:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {entry.results}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
