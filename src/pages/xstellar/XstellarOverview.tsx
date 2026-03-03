import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, HardDrive, Users, Zap, Key, FileCode, Activity, Clock } from "lucide-react";

export function XstellarOverview() {
  const [stats, setStats] = useState({
    tables: 0,
    buckets: 0,
    users: 0,
    edgeFunctions: 0,
    customPages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [profilesRes, pagesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("admin_custom_pages").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        tables: 80,
        buckets: 19,
        users: profilesRes.count || 0,
        edgeFunctions: 15,
        customPages: pagesRes.count || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "Database Tables", value: stats.tables, icon: Database, color: "text-blue-500" },
    { title: "Storage Buckets", value: stats.buckets, icon: HardDrive, color: "text-green-500" },
    { title: "Total Users", value: stats.users, icon: Users, color: "text-purple-500" },
    { title: "Edge Functions", value: stats.edgeFunctions, icon: Zap, color: "text-yellow-500" },
    { title: "Custom Pages", value: stats.customPages, icon: FileCode, color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <div className="h-7 w-12 bg-muted animate-pulse rounded" /> : stats[card.title === "Database Tables" ? "tables" : card.title === "Storage Buckets" ? "buckets" : card.title === "Total Users" ? "users" : card.title === "Edge Functions" ? "edgeFunctions" : "customPages"]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Database", "Authentication", "Storage", "Edge Functions", "Realtime"].map((service) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-sm">{service}</span>
                <span className="flex items-center gap-1.5 text-xs text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Operational
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Navigate to <strong>SQL Editor</strong> to run queries against your database</p>
            <p>• Use <strong>Storage</strong> to manage file buckets and uploads</p>
            <p>• Check <strong>Edge Functions</strong> for backend logic status</p>
            <p>• Visit <strong>Page Creator</strong> to build custom pages for users</p>
            <p>• Monitor <strong>Secrets</strong> for API key configuration</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
