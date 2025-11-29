import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface WhatsNewItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  link?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export default function WhatsNewPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WhatsNewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWhatsNew();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('whats_new_page_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whats_new'
        },
        () => {
          loadWhatsNew();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadWhatsNew = async () => {
    try {
      const { data, error } = await supabase
        .from('whats_new')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading what\'s new:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">What's New</h1>
            <p className="text-muted-foreground">Check out the latest features and updates</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">What's New</h1>
          <p className="text-muted-foreground">Check out the latest features and updates</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Sparkles className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">No new features yet</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for updates!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => item.link && navigate(item.link)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                      {item.title}
                      <Badge variant={getBadgeVariant(item.created_at)} className="text-xs">
                        {getBadgeText(item.created_at)}
                      </Badge>
                    </CardTitle>
                  </div>
                  {item.link && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <CardDescription className="mt-3 line-clamp-3">
                  {item.description}
                </CardDescription>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
