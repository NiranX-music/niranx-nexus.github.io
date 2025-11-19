import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, Lock, Search, FileText, Music, Image, Video, 
  BookOpen, Calendar, Target, Trophy, Gamepad2, Users, 
  MessageCircle, Settings, Shield, Download, ExternalLink,
  ChevronRight, Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SitemapRoute {
  path: string;
  name: string;
  icon: any;
  category: string;
  protected: boolean;
  description: string;
}

const Sitemap = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const routes: SitemapRoute[] = [
    // Auth & Landing
    { path: '/', name: 'Landing Page', icon: Home, category: 'Landing', protected: false, description: 'Welcome page' },
    { path: '/auth', name: 'Login/Signup', icon: Lock, category: 'Auth', protected: false, description: 'Authentication page' },
    
    // Dashboard
    { path: '/niranx/dashboard', name: 'Dashboard', icon: Home, category: 'Dashboard', protected: true, description: 'Main dashboard' },
    
    // Study Tools
    { path: '/niranx/tasks', name: 'Tasks', icon: Target, category: 'Study Tools', protected: true, description: 'Task management with XP rewards' },
    { path: '/niranx/pomodoro', name: 'Pomodoro Timer', icon: Calendar, category: 'Study Tools', protected: true, description: 'Focus timer' },
    { path: '/niranx/focus', name: 'Focus Engine', icon: Target, category: 'Study Tools', protected: true, description: 'Advanced focus modes' },
    { path: '/niranx/scheduler', name: 'Task Scheduler', icon: Calendar, category: 'Study Tools', protected: true, description: 'Schedule management' },
    { path: '/niranx/smart-timetable', name: 'Smart Timetable', icon: Calendar, category: 'Study Tools', protected: true, description: 'AI-optimized timetable' },
    { path: '/niranx/enhanced-scheduler', name: 'Enhanced Scheduler', icon: Calendar, category: 'Study Tools', protected: true, description: 'Advanced scheduling' },
    { path: '/niranx/infinite-chain', name: 'Infinite Chain Manager', icon: Target, category: 'Study Tools', protected: true, description: 'Hierarchical task management' },
    { path: '/niranx/whiteboard', name: 'Whiteboard', icon: FileText, category: 'Study Tools', protected: true, description: 'Collaborative whiteboard' },
    
    // Content & Library
    { path: '/niranx/library', name: 'Library', icon: BookOpen, category: 'Content', protected: true, description: 'Study materials library' },
    { path: '/niranx/file-hub', name: 'File Hub', icon: FileText, category: 'Content', protected: true, description: 'File management' },
    { path: '/niranx/upload', name: 'Upload', icon: Download, category: 'Content', protected: true, description: 'Upload files' },
    { path: '/niranx/pdf-viewer', name: 'PDF Viewer', icon: FileText, category: 'Content', protected: true, description: 'View PDFs' },
    { path: '/niranx/my-cloud', name: 'My Cloud Drives', icon: FileText, category: 'Content', protected: true, description: 'Cloud storage' },
    
    // Media
    { path: '/niranx/music', name: 'Music Player', icon: Music, category: 'Media', protected: true, description: 'Music player' },
    { path: '/niranx/music-hub', name: 'Music Hub', icon: Music, category: 'Media', protected: true, description: 'Music library' },
    { path: '/niranx/listening-library', name: 'Listening Library', icon: Music, category: 'Media', protected: true, description: 'Your listened songs' },
    { path: '/niranx/videos', name: 'Videos', icon: Video, category: 'Media', protected: true, description: 'Video sharing' },
    { path: '/niranx/pictures', name: 'Pictures', icon: Image, category: 'Media', protected: true, description: 'Picture sharing' },
    { path: '/niranx/stream-sphere', name: 'Stream Sphere', icon: Video, category: 'Media', protected: true, description: 'Live streaming' },
    
    // Analytics & Progress
    { path: '/niranx/analytics', name: 'Analytics', icon: Target, category: 'Analytics', protected: true, description: 'Study analytics' },
    { path: '/niranx/leaderboard', name: 'Leaderboard', icon: Trophy, category: 'Analytics', protected: true, description: 'Global rankings' },
    { path: '/niranx/goals', name: 'Goals', icon: Target, category: 'Analytics', protected: true, description: 'Goal tracking' },
    
    // Gamification
    { path: '/niranx/daily-challenges', name: 'Daily Challenges', icon: Trophy, category: 'Gamification', protected: true, description: 'Daily challenges' },
    { path: '/niranx/reward-store', name: 'Reward Store', icon: Trophy, category: 'Gamification', protected: true, description: 'Redeem rewards' },
    { path: '/niranx/games', name: 'Games', icon: Gamepad2, category: 'Gamification', protected: true, description: 'Educational games' },
    
    // Social
    { path: '/niranx/community', name: 'Community', icon: Users, category: 'Social', protected: true, description: 'Community hub' },
    { path: '/niranx/messages', name: 'Messages', icon: MessageCircle, category: 'Social', protected: true, description: 'Direct messages' },
    { path: '/niranx/study-groups', name: 'Study Groups', icon: Users, category: 'Social', protected: true, description: 'Study groups' },
    
    // Tools
    { path: '/niranx/global-search', name: 'Global Search', icon: Search, category: 'Tools', protected: true, description: 'Search everywhere' },
    { path: '/niranx/web-search', name: 'Web Search', icon: Search, category: 'Tools', protected: true, description: 'Web search' },
    { path: '/niranx/exam-hub', name: 'Exam Hub', icon: FileText, category: 'Tools', protected: true, description: 'Exam management' },
    
    // Blogs
    { path: '/niranx/blogs', name: 'Blogs', icon: FileText, category: 'Content', protected: true, description: 'Read blogs' },
    
    // Settings & Security
    { path: '/niranx/profile', name: 'Profile', icon: Users, category: 'Settings', protected: true, description: 'Your profile' },
    { path: '/niranx/settings', name: 'Settings', icon: Settings, category: 'Settings', protected: true, description: 'App settings' },
    { path: '/niranx/2fa', name: 'Two-Factor Auth', icon: Shield, category: 'Security', protected: true, description: '2FA setup' },
    { path: '/niranx/sessions', name: 'Session Manager', icon: Shield, category: 'Security', protected: true, description: 'Active sessions' },
    { path: '/niranx/privacy', name: 'Privacy Settings', icon: Shield, category: 'Security', protected: true, description: 'Privacy controls' },
    { path: '/niranx/data-export', name: 'Data Export', icon: Download, category: 'Security', protected: true, description: 'Export your data' },
    { path: '/niranx/audit-log', name: 'Audit Log', icon: FileText, category: 'Security', protected: true, description: 'Activity log' },
    
    // External
    { path: '/niranx/allen', name: 'Allen', icon: ExternalLink, category: 'External', protected: true, description: 'Allen Digital' },
    { path: '/niranx/pw', name: 'Physics Wallah', icon: ExternalLink, category: 'External', protected: true, description: 'PW Platform' },
    { path: '/niranx/study-platforms', name: 'Study Platforms', icon: ExternalLink, category: 'External', protected: true, description: 'External platforms' },
    { path: '/niranx/websites', name: 'Website Manager', icon: ExternalLink, category: 'External', protected: true, description: 'Manage websites' },
  ];

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(routes.map(r => r.category)));
  const routesByCategory = categories.map(category => ({
    name: category,
    routes: filteredRoutes.filter(r => r.category === category)
  }));

  const totalPages = routes.length;
  const protectedPages = routes.filter(r => r.protected).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Map className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold">Site Map</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete navigation structure of NiranX StudyVerse
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-primary">{totalPages}</p>
            <p className="text-sm text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-blue-500">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-500">{protectedPages}</p>
            <p className="text-sm text-muted-foreground">Protected Routes</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Routes by Category */}
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="w-full flex-wrap h-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {routesByCategory.map(({ name, routes: categoryRoutes }) => (
          <TabsContent key={name} value={name} className="space-y-3">
            {categoryRoutes.map(route => {
              const Icon = route.icon;
              return (
                <Card
                  key={route.path}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(route.path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{route.name}</h3>
                            {route.protected && (
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                Protected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{route.description}</p>
                          <code className="text-xs text-muted-foreground mt-1 block">
                            {route.path}
                          </code>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Print Sitemap
          </Button>
          <Button variant="outline" onClick={() => {
            const text = routes.map(r => `${r.name} - ${r.path}`).join('\n');
            navigator.clipboard.writeText(text);
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Copy as Text
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sitemap;
