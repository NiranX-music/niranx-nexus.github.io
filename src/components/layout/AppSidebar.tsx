import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  CheckSquare,
  Timer,
  Music,
  Gamepad2,
  Calendar,
  CalendarDays,
  BarChart3,
  GraduationCap,
  User,
  Users,
  BookOpen,
  Settings,
  Star,
  Target,
  Globe,
  ExternalLink,
  FolderOpen,
  FileText,
  Video,
  Infinity,
  Headphones,
  Youtube,
  Chrome,
  Search,
  Laptop,
  Brain,
  FileMusic,
  Link,
  Upload,
  Library,
  Image,
  Play,
  MessagesSquare
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import XPDisplay from "@/components/ui/XPDisplay";

const mainNavigation = [
  {
    title: "Dashboard",
    url: "/niranx/dashboard",
    icon: Home,
  },
  {
    title: "Tasks",
    url: "/niranx/tasks",
    icon: CheckSquare,
  },
  {
    title: "Pomodoro",
    url: "/niranx/pomodoro",
    icon: Timer,
  },
  {
    title: "Community",
    url: "/niranx/community",
    icon: MessagesSquare,
  },
  {
    title: "Games",
    url: "/niranx/games",
    icon: Gamepad2,
  },
  {
    title: "Timetable",
    url: "/niranx/timetable",
    icon: Calendar,
  },
  {
    title: "Scheduler",
    url: "/niranx/scheduler",
    icon: CalendarDays,
  },
  {
    title: "Analytics",
    url: "/niranx/analytics",
    icon: BarChart3,
  },
  {
    title: "Exams",
    url: "/niranx/exams",
    icon: GraduationCap,
  },
  {
    title: "Library",
    url: "/niranx/library",
    icon: Library,
  },
  {
    title: "Settings",
    url: "/niranx/settings",
    icon: Settings,
  },
  {
    title: "Blogs",
    url: "/niranx/blogs",
    icon: BookOpen,
  },
  {
    title: "Search",
    url: "/niranx/search",
    icon: Search,
  },
];

const toolsNavigation = [
  {
    title: "Infinite Chain Manager",
    url: "/niranx/infinite-chain",
    icon: Infinity,
  },
  {
    title: "File Hub",
    url: "/niranx/file-hub",
    icon: FolderOpen,
  },
  {
    title: "Music Player", 
    url: "/niranx/music",
    icon: Music,
  },
  {
    title: "Music Hub", 
    url: "/niranx/music-hub",
    icon: FileMusic,
  },
  {
    title: "Website Manager",
    url: "/niranx/website-manager",
    icon: Link,
  },
  {
    title: "Upload Files",
    url: "/niranx/upload",
    icon: Upload,
  },
  {
    title: "PDF Viewer",
    url: "/niranx/pdf-viewer",
    icon: FileText,
  },
  {
    title: "Video Player",
    url: "/niranx/video-player",
    icon: Video,
  },
  {
    title: "Video Share",
    url: "/niranx/video-share",
    icon: Play,
  },
  {
    title: "Picture Share",
    url: "/niranx/picture-share",
    icon: Image,
  },
  {
    title: "StreamSphere",
    url: "/niranx/stream-sphere",
    icon: Youtube,
  },
  {
    title: "Web Search",
    url: "/niranx/web-search",
    icon: Search,
  },
  {
    title: "Website Embed",
    url: "/niranx/website",
    icon: Globe,
  },
];

const studyPlatforms = [
  {
    title: "Study Platforms",
    url: "/niranx/website/study-platforms",
    icon: Brain,
  },
  {
    title: "Allen Digital",
    url: "https://allen.ac.in/",
    icon: Target,
    external: true,
  },
  {
    title: "Physics Wallah",
    url: "https://www.pw.live/",
    icon: Users,
    external: true,
  },
];

const mediaRedirects = [
  {
    title: "Spotify Music",
    url: "https://open.spotify.com/",
    icon: Music,
    external: true,
  },
  {
    title: "YouTube",
    url: "https://youtube.com/",
    icon: Youtube,
    external: true,
  },
  {
    title: "Google",
    url: "https://google.com/",
    icon: Search,
    external: true,
  },
  {
    title: "ChatGPT",
    url: "https://chat.openai.com/",
    icon: Brain,
    external: true,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/niranx/dashboard") return currentPath === "/niranx/dashboard";
    return currentPath.startsWith(path);
  };

  const handleExternalLink = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank');
  };

  const renderNavItems = (items: any[], showExternalIcon = false) => (
    <>
      {items.map((item, index) => (
        <SidebarMenuItem key={item.title} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-in-left">
          <SidebarMenuButton asChild>
            {item.external ? (
              <button
                onClick={(e) => handleExternalLink(item.url, e)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all bg-sidebar-accent/50 hover:bg-sidebar-accent w-full text-left transform-3d hover:scale-105 hover:translate-x-1 group border border-sidebar-border"
              >
                <item.icon className="h-4 w-4 text-sidebar-foreground group-hover:rotate-12 transition-transform duration-300" />
                {!isCollapsed && (
                  <span className="flex-1 text-sidebar-foreground font-medium">{item.title}</span>
                )}
                {!isCollapsed && showExternalIcon && (
                  <ExternalLink className="h-3 w-3 ml-auto text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors" />
                )}
              </button>
            ) : (
              <NavLink
                to={item.url}
                className={({ isActive: navIsActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all transform-3d hover:scale-105 hover:translate-x-1 group border ${
                    isActive(item.url) || navIsActive
                      ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-lg animate-glow-pulse border-primary/50"
                      : "bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground font-medium border-sidebar-border"
                  }`
                }
              >
                <item.icon className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );

  return (
    <Sidebar collapsible="icon" className="border-r backdrop-blur-xl bg-sidebar fixed left-0 top-0 h-screen animate-slide-in-right z-40">
      <SidebarHeader className="border-b backdrop-blur-sm bg-sidebar border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground transform-3d group-hover:scale-110 transition-transform duration-300 animate-glow-pulse">
            <GraduationCap className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="text-sm font-semibold gradient-text">StudyVerse</span>
              <span className="text-xs text-sidebar-foreground/70">Study Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup className="animate-fade-in">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/90 bg-primary/10 px-3 py-1.5 rounded-md animate-slide-in-left">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(mainNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools & Utilities */}
        <SidebarGroup className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/90 bg-accent/10 px-3 py-1.5 rounded-md animate-slide-in-left" style={{ animationDelay: '0.1s' }}>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(toolsNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Study Platforms */}
        <SidebarGroup className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/90 bg-success/10 px-3 py-1.5 rounded-md animate-slide-in-left" style={{ animationDelay: '0.2s' }}>Study Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(studyPlatforms, true)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Media & External */}
        <SidebarGroup className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/90 bg-warning/10 px-3 py-1.5 rounded-md animate-slide-in-left" style={{ animationDelay: '0.3s' }}>External Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(mediaRedirects, true)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t backdrop-blur-sm bg-sidebar border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem className="animate-slide-up">
            <SidebarMenuButton asChild className="h-auto">
              <NavLink to="/niranx/profile" className="flex items-start gap-3 px-3 py-3 group hover:bg-accent/20 rounded-lg">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 animate-fade-in space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-sidebar-foreground group-hover:text-primary transition-colors">
                        User Profile
                      </p>
                      <Settings className="h-4 w-4 flex-shrink-0 text-sidebar-foreground group-hover:rotate-90 transition-transform duration-300" />
                    </div>
                    <div className="w-full">
                      <XPDisplay />
                    </div>
                  </div>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}