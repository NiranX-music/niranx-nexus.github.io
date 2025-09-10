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
  Link
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
    title: "Analytics",
    url: "/niranx/analytics",
    icon: BarChart3,
  },
  {
    title: "Exams",
    url: "/niranx/exams",
    icon: GraduationCap,
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
    title: "Music Hub", 
    url: "/niranx/music-hub",
    icon: FileMusic,
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
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            {item.external ? (
              <button
                onClick={(e) => handleExternalLink(item.url, e)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-muted-foreground hover:text-foreground hover:bg-muted w-full text-left"
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && (
                  <span className="flex-1">{item.title}</span>
                )}
                {!isCollapsed && showExternalIcon && (
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                )}
              </button>
            ) : (
              <NavLink
                to={item.url}
                className={({ isActive: navIsActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive(item.url) || navIsActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">StudyVerse</span>
              <span className="text-xs text-muted-foreground">Study Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(mainNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools & Utilities */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(toolsNavigation)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Study Platforms */}
        <SidebarGroup>
          <SidebarGroupLabel>Study Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(studyPlatforms, true)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Media & External */}
        <SidebarGroup>
          <SidebarGroupLabel>External Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(mediaRedirects, true)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/niranx/profile" className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    U
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          User Profile
                        </p>
                        <XPDisplay className="mt-2" />
                      </div>
                      <Settings className="h-4 w-4 ml-2" />
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