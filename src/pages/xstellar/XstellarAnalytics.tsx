import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Eye, Clock, Globe, TrendingUp, Users } from "lucide-react";

// Mock analytics data (would come from real tracking in production)
const mockData = {
  totalViews: 1243,
  uniqueVisitors: 847,
  avgSessionDuration: "2m 34s",
  topPages: [
    { slug: "portfolio", views: 456, trend: 12 },
    { slug: "blog-site", views: 312, trend: -3 },
    { slug: "dashboard-app", views: 198, trend: 28 },
    { slug: "landing-page", views: 147, trend: 5 },
  ],
  dailyViews: [32, 45, 28, 51, 67, 43, 55, 62, 48, 71, 59, 83, 64, 92],
  devices: { desktop: 62, mobile: 31, tablet: 7 },
};

function MiniBarChart({ data, height = 60 }: { data: number[]; height?: number }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(val / max) * 100}%` }}
          transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
          className="flex-1 bg-primary/60 rounded-t-sm min-w-[4px] hover:bg-primary transition-colors"
        />
      ))}
    </div>
  );
}

export function XstellarAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Views", value: mockData.totalViews.toLocaleString(), icon: Eye, color: "text-blue-400" },
          { label: "Unique Visitors", value: mockData.uniqueVisitors.toLocaleString(), icon: Users, color: "text-green-400" },
          { label: "Avg. Session", value: mockData.avgSessionDuration, icon: Clock, color: "text-amber-400" },
          { label: "Published Sites", value: mockData.topPages.length.toString(), icon: Globe, color: "text-purple-400" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Page Views (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MiniBarChart data={mockData.dailyViews} height={80} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockData.topPages.map((page, i) => (
                <motion.div
                  key={page.slug}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-sm font-medium">/x/{page.slug}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{page.views} views</span>
                    <Badge variant={page.trend > 0 ? "default" : "secondary"} className="text-[10px] h-4">
                      <TrendingUp className={`h-2.5 w-2.5 mr-0.5 ${page.trend < 0 ? "rotate-180" : ""}`} />
                      {Math.abs(page.trend)}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(mockData.devices).map(([device, pct], i) => (
                <motion.div key={device} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{device}</span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
