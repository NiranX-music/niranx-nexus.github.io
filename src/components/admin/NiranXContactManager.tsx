import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NiranXContactManager() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('niranx_contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubmissions(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const toggleRead = async (id: string, currentStatus: boolean) => {
    await supabase.from('niranx_contact_submissions').update({ is_read: !currentStatus }).eq('id', id);
    fetchSubmissions();
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5" /> Contact Submissions
        </h3>
        <Badge variant="secondary">{submissions.filter(s => !s.is_read).length} unread</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((s) => (
            <TableRow key={s.id} className={!s.is_read ? 'bg-primary/5' : ''}>
              <TableCell>
                <Badge variant={s.is_read ? 'secondary' : 'default'}>
                  {s.is_read ? 'Read' : 'New'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.email}</TableCell>
              <TableCell className="truncate max-w-48">{s.subject}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(s.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => toggleRead(s.id, s.is_read)}>
                  {s.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {submissions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No contact submissions yet.
        </div>
      )}
    </div>
  );
}
