import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Loader2, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  name: string | null;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

export function NiranXNewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscribers = async () => {
    const { data } = await supabase
      .from('niranx_newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
    if (data) setSubscribers(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('niranx_newsletter_subscribers').update({ is_active: !currentStatus }).eq('id', id);
    toast.success(currentStatus ? 'Subscriber deactivated' : 'Subscriber activated');
    fetchSubscribers();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Newspaper className="w-5 h-5" /> Newsletter Subscribers
        </h3>
        <Badge variant="secondary">{subscribers.filter(s => s.is_active).length} active</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subscribed</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((s) => (
            <TableRow key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
              <TableCell>
                <Badge variant={s.is_active ? 'default' : 'secondary'}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{s.name || '-'}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(s.subscribed_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => toggleActive(s.id, s.is_active)}>
                  <UserX className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {subscribers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No subscribers yet.
        </div>
      )}
    </div>
  );
}
