import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ThumbsUp, Plus, Sparkles, TrendingUp, Clock, CheckCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  upvotes: number;
  created_at: string;
}

const categories = ['AI Features', 'Learning', 'Productivity', 'Social', 'Gamification', 'Accessibility', 'Integration', 'UI/UX', 'Other'];

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/20 text-primary',
  in_progress: 'bg-accent/20 text-accent-foreground',
  completed: 'bg-success/20 text-success',
  declined: 'bg-destructive/20 text-destructive',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  approved: Sparkles,
  in_progress: TrendingUp,
  completed: CheckCircle,
};

const FeatureRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'upvotes' | 'newest'>('upvotes');

  useEffect(() => {
    fetchRequests();
    if (user) fetchUserVotes();
  }, [user]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('feature_requests')
      .select('*')
      .order('upvotes', { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('feature_request_votes')
      .select('request_id')
      .eq('user_id', user.id);
    if (data) setUserVotes(new Set(data.map(v => v.request_id)));
  };

  const handleSubmit = async () => {
    if (!user) return toast.error('Please sign in to submit a feature request');
    if (!title.trim() || !description.trim()) return toast.error('Please fill in all fields');

    const { error } = await supabase.from('feature_requests').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
    });

    if (error) return toast.error('Failed to submit request');
    toast.success('Feature request submitted!');
    setTitle('');
    setDescription('');
    setCategory('Other');
    setDialogOpen(false);
    fetchRequests();
  };

  const handleVote = async (requestId: string) => {
    if (!user) return toast.error('Please sign in to vote');

    if (userVotes.has(requestId)) {
      await supabase.from('feature_request_votes').delete().eq('user_id', user.id).eq('request_id', requestId);
      setUserVotes(prev => { const n = new Set(prev); n.delete(requestId); return n; });
    } else {
      await supabase.from('feature_request_votes').insert({ user_id: user.id, request_id: requestId });
      setUserVotes(prev => new Set(prev).add(requestId));
    }
    fetchRequests();
  };

  const filtered = requests
    .filter(r => filterCategory === 'all' || r.category === filterCategory)
    .sort((a, b) => sortBy === 'upvotes' ? b.upvotes - a.upvotes : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Feature Requests
          </h1>
          <p className="text-muted-foreground mt-1">Vote on features or suggest your own ideas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Request Feature
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Feature Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Feature title" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} />
              <Textarea placeholder="Describe what you'd like to see..." value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={4} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleSubmit} className="w-full">Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="upvotes">Most Voted</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No feature requests yet. Be the first to suggest one!</p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((req, i) => {
              const voted = userVotes.has(req.id);
              const StatusIcon = statusIcons[req.status] || Clock;
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-start gap-4 p-4">
                      <button
                        onClick={() => handleVote(req.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[56px] ${
                          voted ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${voted ? 'fill-primary' : ''}`} />
                        <span className="text-sm font-bold">{req.upvotes}</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold">{req.title}</h3>
                          <Badge variant="outline" className="text-xs">{req.category}</Badge>
                          <Badge className={`text-xs ${statusColors[req.status] || ''}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FeatureRequests;
