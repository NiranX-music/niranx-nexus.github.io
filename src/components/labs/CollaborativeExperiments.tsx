import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, Plus, Share2, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Experiment {
  id: string;
  lab_type: string;
  experiment_name: string;
  description: string;
  owner_id: string;
  is_public: boolean;
  data: any;
  created_at: string;
}

interface CollaborativeExperimentsProps {
  labType: string;
}

export function CollaborativeExperiments({ labType }: CollaborativeExperimentsProps) {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadExperiments();
      subscribeToExperiments();
    }
  }, [labType, user]);

  const loadExperiments = async () => {
    const { data, error } = await supabase
      .from('collaborative_experiments')
      .select('*')
      .eq('lab_type', labType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading experiments:', error);
    } else {
      setExperiments(data || []);
    }
  };

  const subscribeToExperiments = () => {
    const channel = supabase
      .channel(`experiments-${labType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborative_experiments',
          filter: `lab_type=eq.${labType}`,
        },
        () => {
          loadExperiments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreateExperiment = async () => {
    if (!newExperiment.name.trim() || !user) return;

    const { error } = await supabase.from('collaborative_experiments').insert({
      lab_type: labType,
      experiment_name: newExperiment.name,
      description: newExperiment.description,
      owner_id: user.id,
      is_public: newExperiment.isPublic,
      data: {},
    });

    if (error) {
      console.error('Error creating experiment:', error);
      toast.error('Failed to create experiment');
    } else {
      toast.success('Experiment created!');
      setNewExperiment({ name: '', description: '', isPublic: false });
      setDialogOpen(false);
    }
  };

  const handleDeleteExperiment = async (id: string) => {
    const { error } = await supabase
      .from('collaborative_experiments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting experiment:', error);
      toast.error('Failed to delete experiment');
    } else {
      toast.success('Experiment deleted');
    }
  };

  const handleTogglePublic = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('collaborative_experiments')
      .update({ is_public: !currentState })
      .eq('id', id);

    if (error) {
      console.error('Error updating experiment:', error);
      toast.error('Failed to update experiment');
    } else {
      toast.success(!currentState ? 'Experiment is now public' : 'Experiment is now private');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Collaborative Experiments</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Experiment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Experiment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Experiment Name</Label>
                <Input
                  id="name"
                  placeholder="Enter experiment name..."
                  value={newExperiment.name}
                  onChange={(e) =>
                    setNewExperiment({ ...newExperiment, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your experiment..."
                  value={newExperiment.description}
                  onChange={(e) =>
                    setNewExperiment({ ...newExperiment, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="public"
                  checked={newExperiment.isPublic}
                  onCheckedChange={(checked) =>
                    setNewExperiment({ ...newExperiment, isPublic: checked })
                  }
                />
                <Label htmlFor="public">Make public</Label>
              </div>
              <Button onClick={handleCreateExperiment} className="w-full">
                Create Experiment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiments.map((experiment) => (
          <Card key={experiment.id} className="bg-muted/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{experiment.experiment_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {experiment.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  {experiment.is_public && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>
                    {experiment.owner_id === user?.id ? 'Your experiment' : 'Shared with you'}
                  </span>
                </div>
                {experiment.owner_id === user?.id && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublic(experiment.id, experiment.is_public)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExperiment(experiment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {experiments.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No collaborative experiments yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
