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
  TrendingUp,
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
  Video,
  Infinity,
  Headphones,
  Youtube,
  Search,
  Brain,
  FileMusic,
  Upload,
  Image,
  Play,
  MessagesSquare,
  Cloud,
  HardDrive,
  Smartphone,
  Shield,
  PenTool,
  Trophy,
  ShoppingBag,
  Lock,
  Map,
  Sparkles,
  Flame,
  Zap,
  Archive,
  ChevronDown,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

// Core Navigation
const coreNavigation = [
  { title: "Dashboard", url: "/niranx/dashboard", icon: Home },
  { title: "Search", url: "/niranx/search", icon: Search },
  { title: "Profile", url: "/niranx/profile", icon: User },
  { title: "Feedback & Suggestions", url: "/niranx/feedback", icon: MessagesSquare },
];

// Study & Focus
const studyNavigation = [
  { title: "Tasks", url: "/niranx/tasks", icon: CheckSquare },
  { title: "Focus Engine", url: "/niranx/focus-engine", icon: Timer },
  { title: "Distraction Blocker", url: "/niranx/distraction-blocker", icon: Shield },
  { title: "Scheduler", url: "/niranx/scheduler", icon: Calendar },
  { title: "Exams", url: "/niranx/exams", icon: GraduationCap },
  { title: "Whiteboard", url: "/niranx/whiteboard", icon: PenTool },
  { title: "Study Groups", url: "/niranx/study-groups", icon: Users },
];

// Progress & Gamification
const progressNavigation = [
  { title: "Advanced Dashboard", url: "/niranx/advanced-dashboard", icon: BarChart3 },
  { title: "Analytics", url: "/niranx/analytics", icon: TrendingUp },
  { title: "Goals", url: "/niranx/goals", icon: Target },
  { title: "Daily Challenges", url: "/niranx/daily-challenges", icon: Star },
  { title: "Study Streaks", url: "/niranx/study-streak-challenges", icon: Flame },
  { title: "Leaderboard", url: "/niranx/leaderboard", icon: Trophy },
  { title: "Reward Store", url: "/niranx/reward-store", icon: ShoppingBag },
  { title: "Games", url: "/niranx/games", icon: Gamepad2 },
];

// Media & Entertainment
const mediaNavigation = [
  { title: "Music Player", url: "/niranx/music", icon: Music },
  { title: "Music Hub", url: "/niranx/music-hub", icon: FileMusic },
  { title: "Listening Library", url: "/niranx/listening-library", icon: Headphones },
  { title: "Video Player", url: "/niranx/video-player", icon: Video },
  { title: "Video Library", url: "/niranx/video-library", icon: Video },
  { title: "StreamSphere", url: "/niranx/stream-sphere", icon: Youtube },
];

// Files & Cloud
const filesNavigation = [
  { title: "File Hub", url: "/niranx/file-hub", icon: FolderOpen },
  { title: "My Cloud", url: "/niranx/my-cloud", icon: Cloud },
  { title: "Manage Drives", url: "/niranx/manage-drives", icon: HardDrive },
  { title: "Upload", url: "/niranx/upload", icon: Upload },
];

// Communication & Social
const socialNavigation = [
  { title: "Messages", url: "/niranx/messages", icon: MessageCircle },
  { title: "Community", url: "/niranx/community", icon: MessagesSquare },
  { title: "Blogs", url: "/niranx/blogs", icon: BookOpen },
  { title: "Picture Share", url: "/niranx/picture-share", icon: Image },
  { title: "Video Share", url: "/niranx/video-share", icon: Play },
];

// Tools & Utilities
const toolsNavigation = [
  { title: "Infinite Chain", url: "/niranx/infinite-chain", icon: Infinity },
  { title: "Website Manager", url: "/niranx/website-manager", icon: Globe },
  { title: "Web Search", url: "/niranx/web-search", icon: Search },
  { title: "PWA Download", url: "/niranx/pwa-download", icon: Smartphone },
  { title: "Kiosk Mode", url: "/niranx/kiosk-mode", icon: Lock },
];

// External Study Platforms
const externalPlatforms = [
  { title: "Allen Digital", url: "https://allen.ac.in/", icon: Target, external: true },
  { title: "Physics Wallah", url: "https://www.pw.live/", icon: Users, external: true },
  { title: "Spotify", url: "https://open.spotify.com/", icon: Music, external: true },
  { title: "YouTube", url: "https://youtube.com/", icon: Youtube, external: true },
  { title: "ChatGPT", url: "https://chat.openai.com/", icon: Brain, external: true },
];

// More Pages
const morePages = [
  { title: "Sitemap", url: "/niranx/sitemap", icon: Map },
  { title: "Old Pages", url: "/niranx/old-pages", icon: Archive },
  { title: "Feature Ideas", url: "/niranx/feature-suggestions", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    study: true,
    progress: false,
    media: false,
    files: false,
    social: false,
    tools: false,
    external: false,
    more: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
          <SidebarMenuButton asChild className="text-white [&_svg]:text-white">
            {item.external ? (
              <button
                onClick={(e) => handleExternalLink(item.url, e)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left group text-white hover:bg-white/10"
              >
                <item.icon className="h-4 w-4 text-white" />
                {!isCollapsed && <span className="flex-1">{item.title}</span>}
                {!isCollapsed && showExternalIcon && (
                  <ExternalLink className="h-3 w-3 ml-auto opacity-70 text-white/70" />
                )}
              </button>
            ) : (
              <NavLink
                to={item.url}
                className={({ isActive: navIsActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive(item.url) || navIsActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-white hover:bg-white/10"
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
    <Sidebar className="border-r border-sidebar-border bg-gradient-to-b from-sidebar/95 via-sidebar/90 to-background/80 backdrop-blur-xl">
      <SidebarHeader className="border-b border-sidebar-border/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="font-bold text-lg text-white">
                NiranX
              </h1>
              <p className="text-xs text-white/70">StudyVerse</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="mt-3">
            <XPDisplay />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Core */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-semibold">Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(coreNavigation)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Study & Focus */}
        <Collapsible open={expandedSections.study} onOpenChange={() => toggleSection('study')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Study & Focus</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.study ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(studyNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Progress & Gamification */}
        <Collapsible open={expandedSections.progress} onOpenChange={() => toggleSection('progress')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Progress & Rewards</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.progress ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(progressNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Media */}
        <Collapsible open={expandedSections.media} onOpenChange={() => toggleSection('media')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Media</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.media ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(mediaNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Files & Cloud */}
        <Collapsible open={expandedSections.files} onOpenChange={() => toggleSection('files')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Files & Cloud</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.files ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(filesNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Social */}
        <Collapsible open={expandedSections.social} onOpenChange={() => toggleSection('social')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Social & Community</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.social ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(socialNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Tools */}
        <Collapsible open={expandedSections.tools} onOpenChange={() => toggleSection('tools')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Tools & Utilities</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.tools ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(toolsNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* External Links */}
        <Collapsible open={expandedSections.external} onOpenChange={() => toggleSection('external')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Quick Links</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.external ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(externalPlatforms, true)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* More */}
        <Collapsible open={expandedSections.more} onOpenChange={() => toggleSection('more')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>More</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.more ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(morePages)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-white [&_svg]:text-white">
              <NavLink
                to="/niranx/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-white/10"
              >
                <Settings className="h-4 w-4 text-white" />
                {!isCollapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
