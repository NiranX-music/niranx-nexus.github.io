import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  CheckSquare,
  Timer,
  Music,
  Gamepad2,
  Calendar,
  BarChart3,
  GraduationCap,
  User,
  Settings,
  Star,
  Target,
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
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageCircle,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Pomodoro",
    url: "/pomodoro",
    icon: Timer,
  },
  {
    title: "Music",
    url: "/music",
    icon: Music,
  },
  {
    title: "Games",
    url: "/games",
    icon: Gamepad2,
  },
  {
    title: "Timetable",
    url: "/timetable",
    icon: Calendar,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Exams",
    url: "/exams",
    icon: GraduationCap,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile?.avatar_url} alt="User" />
                  <AvatarFallback>
                    {profile?.display_name ? getInitials(profile.display_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {profile?.display_name || profile?.username || 'User'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {profile?.class && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              <GraduationCap className="w-2 h-2 mr-1" />
                              {profile.class}
                            </Badge>
                          )}
                          {profile?.level && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              <Star className="w-2 h-2 mr-1" />
                              L{profile.level}
                            </Badge>
                          )}
                        </div>
                        {profile?.ambition && (
                          <p className="text-xs text-muted-foreground truncate flex items-center mt-1">
                            <Target className="w-2 h-2 mr-1" />
                            {profile.ambition}
                          </p>
                        )}
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