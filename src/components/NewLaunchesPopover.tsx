import { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface WhatsNew {
  id: string;
  title: string;
  description: string;
  icon?: string;
  link?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export function NewLaunchesPopover() {
  const navigate = useNavigate();
  const [launches, setLaunches] = useState<WhatsNew[]>([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    loadWhatsNew();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('whats_new_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whats_new'
        },
        () => {
          loadWhatsNew();
          setHasNew(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadWhatsNew = async () => {
    const { data, error } = await supabase
      .from('whats_new')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setLaunches(data);
    }
  };

  const getBadgeVariant = (createdAt: string) => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreation <= 7 ? 'default' : 'secondary';
  };

  const getBadgeText = (createdAt: string) => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreation <= 7 ? 'New' : 'Updated';
  };

  return (
    <Popover onOpenChange={(open) => open && setHasNew(false)}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Rocket className="h-5 w-5" />
          {(launches.length > 0 || hasNew) && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              What's New This Week
            </CardTitle>
            <CardDescription>
              Check out the latest features and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {launches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Rocket className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No new features yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {launches.map((launch) => (
                  <div
                    key={launch.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => launch.link && navigate(launch.link)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{launch.title}</h4>
                          <Badge variant={getBadgeVariant(launch.created_at)} className="text-xs">
                            {getBadgeText(launch.created_at)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {launch.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(launch.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
