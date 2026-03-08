import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bell, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WhatsNewItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  created_at: string;
}

export function UpdatesPanel() {
  const navigate = useNavigate();
  const [whatsNew, setWhatsNew] = useState<WhatsNewItem[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'updates' | 'notifications'>('updates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [wnRes, notifRes] = await Promise.all([
      supabase
        .from('whats_new')
        .select('id, title, description, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('admin_notifications')
        .select('id, title, message, type, priority, created_at')
        .eq('is_active', true)
        .eq('target_users', 'all')
        .order('created_at', { ascending: false })
        .limit(4),
    ]);

    if (wnRes.data) setWhatsNew(wnRes.data);
    if (notifRes.data) setNotifications(notifRes.data);
  };

  const isNew = (date: string) =>
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24) <= 7;

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Stay Updated
          </h2>
          <p className="text-muted-foreground text-lg">
            Latest features and platform announcements
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={activeTab === 'updates' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('updates')}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            What's New
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('notifications')}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Announcements
          </Button>
        </div>

        {/* Updates Grid */}
        {activeTab === 'updates' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {whatsNew.length === 0 ? (
              <Card className="col-span-full bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                  No updates yet — check back soon!
                </CardContent>
              </Card>
            ) : (
              whatsNew.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-colors h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        {isNew(item.created_at) && (
                          <Badge variant="default" className="text-xs shrink-0">New</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}

            <div className="col-span-full flex justify-center mt-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/whats-new')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                View all updates <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Notifications Grid */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {notifications.length === 0 ? (
              <Card className="col-span-full bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                  No announcements right now
                </CardContent>
              </Card>
            ) : (
              notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-colors h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{notif.title}</CardTitle>
                        {notif.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs shrink-0">Urgent</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}

            <div className="col-span-full flex justify-center mt-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/notifications')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                View all announcements <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
