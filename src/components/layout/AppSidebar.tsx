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

const navigation = [
  {
    title: "Dashboard",
    url: "/niranx/dashboard",
    icon: Home,
  },
  {
    title: "Messages",
    url: "/niranx/messages",
    icon: MessageCircle,
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
    title: "Music",
    url: "/niranx/music",
    icon: Music,
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
    title: "Library",
    url: "/niranx/library",
    icon: BookOpen,
  },
  {
    title: "Allen",
    url: "/niranx/allen",
    icon: GraduationCap,
  },
  {
    title: "PW",
    url: "/niranx/pw",
    icon: Users,
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
    title: "Open Website",
    url: "/niranx/website",
    icon: Globe,
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