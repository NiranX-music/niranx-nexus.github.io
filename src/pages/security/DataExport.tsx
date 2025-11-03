import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export default function DataExport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const exportData = async (format: 'json' | 'csv') => {
    setLoading(true);
    try {
      // Fetch all user data
      const [
        { data: studyMaterials },
        { data: studyStreaks },
        { data: tasks },
        { data: messages },
        { data: playlists },
      ] = await Promise.all([
        supabase.from('study_materials').select('*').eq('user_id', user?.id),
        supabase.from('study_streaks').select('*').eq('user_id', user?.id),
        supabase.from('schedule_tasks').select('*').eq('user_id', user?.id),
        supabase.from('messages').select('*').eq('sender_id', user?.id),
        supabase.from('music_playlists').select('*').eq('user_id', user?.id),
      ]);

      const userData = {
        user_id: user?.id,
        email: user?.email,
        exported_at: new Date().toISOString(),
        study_materials: studyMaterials || [],
        study_streaks: studyStreaks || [],
        tasks: tasks || [],
        messages: messages || [],
        playlists: playlists || [],
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `niranx-data-${Date.now()}.json`;
        a.click();
      } else {
        // Simple CSV export
        let csv = 'Type,Count\n';
        csv += `Study Materials,${studyMaterials?.length || 0}\n`;
        csv += `Study Streaks,${studyStreaks?.length || 0}\n`;
        csv += `Tasks,${tasks?.length || 0}\n`;
        csv += `Messages,${messages?.length || 0}\n`;
        csv += `Playlists,${playlists?.length || 0}\n`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `niranx-data-${Date.now()}.csv`;
        a.click();
      }

      toast.success('Data exported successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Download className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Export Your Data</h1>
          <p className="text-muted-foreground">Download a copy of your data in various formats</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Export Options</CardTitle>
          <CardDescription>
            GDPR-compliant data export. Download your data in JSON or CSV format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">JSON Format</CardTitle>
                </div>
                <CardDescription>
                  Complete data export with all fields and relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => exportData('json')}
                  disabled={loading}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">CSV Format</CardTitle>
                </div>
                <CardDescription>
                  Summary export compatible with spreadsheet applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => exportData('csv')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What's included in your export:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Study materials and notes</li>
              <li>Study streaks and progress</li>
              <li>Tasks and schedules</li>
              <li>Messages and conversations</li>
              <li>Music playlists</li>
              <li>Account settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}