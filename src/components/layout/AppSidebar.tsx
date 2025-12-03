import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  CheckSquare,
  Timer,
  Music,
  Gamepad2,
  Calendar,
  CalendarCheck,
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
  FileText,
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
  Bell,
  UserCog,
  Star as StarIcon,
  StarOff,
  UserPlus,
  ScrollText,
  ShieldCheck,
  Link2,
  Eye,
  Gift,
  Palette,
  Layout,
  Route as RouteIcon,
  HelpCircle,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import XPDisplay from "@/components/ui/XPDisplay";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useTeacherCheck } from "@/hooks/useTeacherCheck";
import { useFavorites } from "@/hooks/useFavorites";
import { DraggableFavorites } from "@/components/DraggableFavorites";
import { getValidIconOrFallback } from "@/lib/iconValidator";
import { MasterPasswordDialog } from "@/components/MasterPasswordDialog";
import { useQuickLinks } from "@/hooks/useQuickLinks";
import { AddQuickLinkDialog } from "@/components/AddQuickLinkDialog";
import { useClassroom } from "@/hooks/useClassroom";
import { useXP } from "@/contexts/XPContext";
import * as LucideIcons from "lucide-react";
import niranxLogo from '@/assets/niranx-logo.jpg';

// Core Navigation
const coreNavigation = [
  { title: "Dashboard", url: "/niranx/dashboard", icon: Home },
  { title: "What's New", url: "/niranx/whats-new", icon: Sparkles },
  { title: "Notifications", url: "/niranx/notifications", icon: Bell },
  { title: "AI Chat", url: "/niranx/ai-chat", icon: Brain },
  { title: "AI Chat History", url: "/niranx/ai-chat-history", icon: ScrollText },
  { title: "AI Scheduler", url: "/niranx/ai-scheduler", icon: Calendar },
  { title: "Class Manager", url: "/niranx/class-scheduler", icon: CalendarCheck },
  { title: "Web Search", url: "/niranx/web-search", icon: Search },
  { title: "Profile", url: "/niranx/profile", icon: User },
];

// AI Corner
const aiCornerNavigation = [
  { title: "AI Hub", url: "/niranx/ai-corner", icon: Sparkles },
  { title: "AI Solver", url: "/niranx/ai-solver", icon: Brain },
  { title: "AI Chat Hub", url: "/niranx/groq-chat", icon: Zap },
  { title: "Chat History", url: "/niranx/groq-chat-history", icon: ScrollText },
  { title: "PDF Summarizer", url: "/niranx/pdf-summarizer", icon: FileText },
  { title: "AI Library", url: "/niranx/ai-library", icon: Archive },
  { title: "Topic Map Generator", url: "/niranx/ai-topic-map-generator", icon: RouteIcon },
  { title: "AI Image Generator", url: "/niranx/lovable-image-gen", icon: Image },
];

// AI Development
const aiDevelopmentNavigation = [
  { title: "DeepSeek Coder", url: "/niranx/deepseek-chat", icon: Brain },
];

// Study & Focus
const studyNavigation = [
  { title: "Tasks", url: "/niranx/tasks", icon: CheckSquare },
  { title: "Focus Engine", url: "/niranx/focus-engine", icon: Timer },
  { title: "Distraction Blocker", url: "/niranx/distraction-blocker", icon: Shield },
  { title: "Scheduler", url: "/niranx/scheduler", icon: Calendar },
  { title: "Labs", url: "/niranx/labs", icon: GraduationCap },
  { title: "Exams", url: "/niranx/exams", icon: GraduationCap },
  { title: "Whiteboard", url: "/niranx/whiteboard", icon: PenTool },
  { title: "Study Groups", url: "/niranx/study-groups", icon: Users },
  { title: "AI Study Path", url: "/niranx/study-path-generator", icon: RouteIcon },
  { title: "Note Summarizer", url: "/niranx/note-summarizer", icon: FileText },
  { title: "YouTube Library", url: "/niranx/youtube-library", icon: Youtube },
];

// Progress & Gamification
const progressNavigation = [
  { title: "Advanced Dashboard", url: "/niranx/advanced-dashboard", icon: BarChart3 },
  { title: "Analytics", url: "/niranx/analytics", icon: TrendingUp },
  { title: "Goals", url: "/niranx/goals", icon: Target },
  { title: "Daily Challenges", url: "/niranx/daily-challenges", icon: Star },
  { title: "Daily Rewards", url: "/niranx/daily-rewards", icon: Gift },
  { title: "Study Streaks", url: "/niranx/study-streak-challenges", icon: Flame },
  { title: "Leaderboard", url: "/niranx/leaderboard", icon: Trophy },
  { title: "Reward Store", url: "/niranx/reward-store", icon: ShoppingBag },
  { title: "Games", url: "/niranx/games", icon: Gamepad2 },
];

// Media & Entertainment
const mediaNavigation = [
  { title: "Music Player", url: "/niranx/music", icon: Music },
  { title: "Music Hub", url: "/niranx/music-hub", icon: FileMusic },
  { title: "Music Library", url: "/niranx/music/library", icon: Headphones },
  { title: "Upload Track", url: "/niranx/music/upload", icon: Upload },
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
  { title: "Backblaze Storage", url: "/niranx/backblaze-storage", icon: Cloud },
  { title: "Upload", url: "/niranx/upload", icon: Upload },
];

// Communication & Social
const socialNavigation = [
  { title: "Messages", url: "/niranx/messages", icon: MessageCircle },
  { title: "Community", url: "/niranx/community", icon: MessagesSquare },
  { title: "Study Guilds", url: "/niranx/guilds", icon: Shield },
  { title: "Study Groups", url: "/niranx/study-groups", icon: Users },
  { title: "Blogs", url: "/niranx/blogs", icon: BookOpen },
  { title: "Picture Share", url: "/niranx/picture-share", icon: Image },
  { title: "Video Share", url: "/niranx/video-share", icon: Play },
];

// Debate Platform
const debateNavigation = [
  { title: "Debate Hub", url: "/niranx/debates", icon: MessageCircle },
  { title: "My Debates", url: "/niranx/debates/mine", icon: User },
  { title: "Bookmarked", url: "/niranx/debates/bookmarks", icon: StarIcon },
  { title: "Categories", url: "/niranx/debates/categories", icon: Target },
  { title: "Leaderboard", url: "/niranx/debates/leaderboard", icon: Trophy },
  { title: "Tournaments", url: "/niranx/debates/tournaments", icon: Trophy },
  { title: "Live Rooms", url: "/niranx/debates/live", icon: Zap },
];

// Tools & Utilities
const toolsNavigation = [
  { title: "AI Website Generator", url: "/niranx/ai-website-generator", icon: Sparkles },
  { title: "My Websites", url: "/niranx/ai-website-generator", icon: Layout },
  { title: "Website Embedder", url: "/niranx/website", icon: Globe },
  { title: "Study Platforms", url: "/niranx/website/study-platforms", icon: GraduationCap },
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

// Admin & System
const adminNavigation = [
  { title: "Admin Dashboard", url: "/niranx/admin", icon: UserCog },
  { title: "User Controls", url: "/niranx/admin/user-controls", icon: Settings },
  { title: "Music Moderation", url: "/niranx/admin/music-moderation", icon: Music },
  { title: "Feedback List", url: "/niranx/admin/feedback-list", icon: MessagesSquare },
  { title: "What's New Manager", url: "/niranx/admin/whats-new", icon: Sparkles },
  { title: "Custom Notifications", url: "/niranx/admin/custom-notifications", icon: Bell },
  { title: "Guardian Dashboard", url: "/niranx/guardian-dashboard", icon: Users },
];

const teacherNavigation = [
  { title: "Teacher Portal", url: "/niranx/teacher/dashboard", icon: GraduationCap },
  { title: "Role Management", url: "/niranx/admin/roles", icon: ShieldCheck },
];

const liveClassroomNavigation = [
  { title: "Live Classroom", url: "/niranx/live-classroom", icon: Video },
  { title: "Browse Classrooms", url: "/niranx/classrooms", icon: BookOpen },
];

const systemNavigation = [
  { title: "Widget Settings", url: "/niranx/widget-settings", icon: Layout },
  { title: "Notification Settings", url: "/niranx/notification-settings", icon: Bell },
  { title: "Smart Notifications", url: "/niranx/smart-notifications", icon: Zap },
  { title: "Accessibility Settings", url: "/niranx/accessibility-settings", icon: Eye },
  { title: "Theme Customization", url: "/niranx/theme-customization", icon: Palette },
  { title: "Guardian Settings", url: "/niranx/guardian-settings", icon: ShieldCheck },
  { title: "OAuth Settings", url: "/niranx/oauth-settings", icon: Link2 },
  { title: "Feedback & Suggestions", url: "/niranx/feedback", icon: MessagesSquare },
  { title: "Android TWA Setup", url: "/niranx/twa-setup", icon: Smartphone },
  { title: "Become an Admin", url: "/niranx/become-admin", icon: UserPlus },
];

// Archive - Old Pages
const archiveNavigation = [
  { title: "Global Search", url: "/niranx/search", icon: Search },
  { title: "Pomodoro", url: "/niranx/pomodoro", icon: Timer },
  { title: "Smart Timetable", url: "/niranx/smart-timetable", icon: Calendar },
  { title: "Library", url: "/niranx/library", icon: BookOpen },
];

// More Pages
const morePages = [
  { title: "Website Guide", url: "/niranx/guide", icon: BookOpen },
  { title: "App Guide", url: "#", icon: HelpCircle, onClick: () => window.dispatchEvent(new Event("restart-guide")) },
  { title: "Sitemap", url: "/niranx/sitemap", icon: Map },
  { title: "Old Pages", url: "/niranx/old-pages", icon: Archive },
  { title: "Feature Ideas", url: "/niranx/feature-suggestions", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { isTeacher, isLoading: teacherLoading } = useTeacherCheck();
  const { favorites, addFavorite, removeFavorite, isFavorite, reorderFavorites } = useFavorites();
  const { quickLinks, addQuickLink, removeQuickLink } = useQuickLinks();
  const { classrooms } = useClassroom();
  const { xp, level } = useXP();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    aiCorner: true,
    aiDevelopment: true,
    study: true,
    progress: false,
    media: false,
    files: false,
    social: false,
    debate: false,
    tools: false,
    external: false,
    admin: true,
    teacher: true,
    liveClassrooms: true,
    liveClasses: true,
    system: false,
    archive: false,
    more: false,
  });

  // Combine all navigation items for search
  const allNavItems = useMemo(() => [
    ...coreNavigation,
    ...aiCornerNavigation,
    ...aiDevelopmentNavigation,
    ...studyNavigation,
    ...progressNavigation,
    ...mediaNavigation,
    ...filesNavigation,
    ...socialNavigation,
    ...debateNavigation,
    ...toolsNavigation,
    ...externalPlatforms,
    ...(isAdmin ? adminNavigation : []),
    ...(isTeacher || isAdmin ? teacherNavigation : []),
    ...liveClassroomNavigation,
    ...systemNavigation,
    ...morePages,
  ], [isAdmin, isTeacher]);

  // Filter navigation items based on search query
  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    return allNavItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allNavItems]);

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

  const renderNavItems = (items: any[], showExternalIcon = false, showFavoriteButton = true) => (
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
              <div className="flex items-center w-full gap-1">
                <NavLink
                  to={item.url}
                  className={({ isActive: navIsActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all flex-1 ${
                      isActive(item.url) || navIsActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
                {!isCollapsed && showFavoriteButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isFavorite(item.url)) {
                        const fav = favorites.find(f => f.page_url === item.url);
                        if (fav) removeFavorite(fav.id);
                      } else {
                        // Get and validate icon name from the item
                        const rawIconName = item.icon.displayName || item.icon.name || 'Star';
                        const validIconName = getValidIconOrFallback(rawIconName);
                        addFavorite(item.url, item.title, validIconName);
                      }
                    }}
                  >
                    {isFavorite(item.url) ? (
                      <StarIcon className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <StarOff className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl hidden md:flex shadow-2xl flex-col h-full overflow-hidden fixed left-0 top-0 bottom-0 z-50">
      <SidebarHeader className="border-b border-primary/20 p-4 bg-gradient-to-r from-primary/10 via-purple-600/10 to-blue-600/10 flex-shrink-0 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-black shadow-lg shadow-primary/20">
              <img src={niranxLogo} alt="NiranX Logo" className="h-full w-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="font-bold text-xl bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  NiranX
                </h1>
                <p className="text-xs text-white/60 font-medium">StudyVerse Platform</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="hover:bg-white/10 rounded-md p-1.5 transition-colors" />
        </div>
        {!isCollapsed && (
          <>
            <div className="mt-4 p-3 bg-gradient-to-br from-primary/20 via-purple-600/15 to-blue-600/15 rounded-lg border border-primary/30 shadow-lg shadow-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Your Progress</span>
                <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-full">
                  <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-sm font-bold text-yellow-400">{xp} XP</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-full w-fit">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Level {level}</span>
              </div>
            </div>
            <div className="mt-3">
              <Input
                type="search"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-primary/30 text-white placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </>
        )}
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll">{/* Show search results when searching */}
        {filteredNavItems && filteredNavItems.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white font-semibold">
              Search Results ({filteredNavItems.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderNavItems(filteredNavItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : filteredNavItems && filteredNavItems.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white font-semibold">
              No results found
            </SidebarGroupLabel>
          </SidebarGroup>
        ) : (
          <>
        {/* Favorites */}
        {favorites.length > 0 && (
          <Collapsible
            open={expandedSections.favorites}
            onOpenChange={() => toggleSection("favorites")}
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                  <span>⭐ Favorites</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform text-white ${
                      expandedSections.favorites ? "" : "-rotate-90"
                    }`}
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <DraggableFavorites
                    favorites={favorites}
                    navItems={allNavItems}
                    onReorder={reorderFavorites}
                    onRemove={removeFavorite}
                    currentPath={currentPath}
                  />
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Core */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/90 font-bold text-sm uppercase tracking-wider flex items-center gap-2 px-3 py-3 bg-gradient-to-r from-primary/30 via-purple-500/20 to-transparent rounded-lg border border-primary/20 mb-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            {!isCollapsed && "Core"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(coreNavigation)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Corner */}
        <Collapsible open={expandedSections.aiCorner} onOpenChange={() => toggleSection('aiCorner')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-cyan-500/20 rounded-lg px-3 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-cyan-500/25 to-transparent border border-cyan-500/20 mb-2">
                <span className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  {!isCollapsed && "AI Corner"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-cyan-400 ${expandedSections.aiCorner ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(aiCornerNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* AI Development */}
        <Collapsible open={expandedSections.aiDevelopment} onOpenChange={() => toggleSection('aiDevelopment')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-purple-500/20 rounded-lg px-3 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-purple-500/25 to-transparent border border-purple-500/20 mb-2">
                <span className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  {!isCollapsed && "AI Development"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-purple-400 ${expandedSections.aiDevelopment ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(aiDevelopmentNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Study & Focus */}
        <Collapsible open={expandedSections.study} onOpenChange={() => toggleSection('study')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-blue-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-400" />
                  {!isCollapsed && "Study & Focus"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.study ? '' : '-rotate-90'}`} />
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
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-yellow-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  {!isCollapsed && "Progress & Rewards"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.progress ? '' : '-rotate-90'}`} />
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
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-purple-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-purple-400" />
                  {!isCollapsed && "Media"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.media ? '' : '-rotate-90'}`} />
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
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-green-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-green-400" />
                  {!isCollapsed && "Files & Cloud"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.files ? '' : '-rotate-90'}`} />
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
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-pink-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pink-400" />
                  {!isCollapsed && "Social & Community"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.social ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(socialNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Debate Platform */}
        <Collapsible open={expandedSections.debate} onOpenChange={() => toggleSection('debate')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-orange-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-orange-400" />
                  {!isCollapsed && "Debate Platform"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.debate ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(debateNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Tools */}
        <Collapsible open={expandedSections.tools} onOpenChange={() => toggleSection('tools')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-cyan-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-cyan-400" />
                  {!isCollapsed && "Tools & Utilities"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.tools ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(toolsNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Quick Links */}
        <Collapsible open={expandedSections.external} onOpenChange={() => toggleSection('external')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-primary/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-orange-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-orange-400" />
                  {!isCollapsed && "Quick Links"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.external ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Add Quick Link Button */}
                  {!isCollapsed && (
                    <SidebarMenuItem>
                      <AddQuickLinkDialog onAdd={addQuickLink} />
                    </SidebarMenuItem>
                  )}
                  
                  {/* User's Custom Quick Links */}
                  {quickLinks.map((link) => {
                    const IconComponent = (LucideIcons as any)[link.icon_name] || ExternalLink;
                    return (
                      <SidebarMenuItem key={link.id}>
                        <SidebarMenuButton asChild className="text-white [&_svg]:text-white">
                          <button
                            onClick={(e) => handleExternalLink(link.url, e)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left group text-white hover:bg-white/10 relative"
                          >
                            <IconComponent className="h-4 w-4 text-white" />
                            {!isCollapsed && (
                              <>
                                <span className="flex-1">{link.title}</span>
                                <ExternalLink className="h-3 w-3 opacity-70 text-white/70" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeQuickLink(link.id);
                                  }}
                                >
                                  <StarOff className="h-3 w-3 text-red-400" />
                                </Button>
                              </>
                            )}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  
                  {/* Divider between custom and default links */}
                  {quickLinks.length > 0 && !isCollapsed && (
                    <div className="my-2 border-t border-white/10" />
                  )}
                  
                  {/* Default External Platforms */}
                  {renderNavItems(externalPlatforms, true, false)}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Admin - Conditionally rendered */}
        {!adminLoading && isAdmin && (
          <Collapsible open={expandedSections.admin} onOpenChange={() => toggleSection('admin')}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-red-500/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-red-500/20 to-transparent border border-red-500/20">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-red-400" />
                    {!isCollapsed && "Admin"}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.admin ? '' : '-rotate-90'}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>{renderNavItems(adminNavigation)}</SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Teacher Portal - Conditionally rendered */}
        {!teacherLoading && (isTeacher || isAdmin) && (
          <Collapsible open={expandedSections.teacher} onOpenChange={() => toggleSection('teacher')}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-blue-500/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-blue-500/20 to-transparent border border-blue-500/20">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-400" />
                    {!isCollapsed && "Teacher"}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.teacher ? '' : '-rotate-90'}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>{renderNavItems(teacherNavigation)}</SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Live Classrooms Subgroup */}
        <Collapsible open={expandedSections.liveClassrooms} onOpenChange={() => toggleSection('liveClassrooms')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-purple-500/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-purple-500/20 to-transparent">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  {!isCollapsed && "Live Classrooms"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.liveClassrooms ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(liveClassroomNavigation)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Live Classes - Show classrooms for teachers/admins */}
        {!teacherLoading && (isTeacher || isAdmin) && classrooms && classrooms.length > 0 && (
          <Collapsible open={expandedSections.liveClasses} onOpenChange={() => toggleSection('liveClasses')}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-green-500/20 rounded-lg px-2 -mx-2 flex items-center justify-between text-white/90 font-bold text-sm uppercase tracking-wider transition-all duration-200 py-3 bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/20">
                  <span className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-green-400" />
                    {!isCollapsed && "Live Classes"}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${expandedSections.liveClasses ? '' : '-rotate-90'}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {classrooms.map((classroom) => (
                      <SidebarMenuItem key={classroom.id}>
                        <SidebarMenuButton asChild className="text-white [&_svg]:text-white">
                          <NavLink
                            to={`/niranx/teacher/classroom/${classroom.id}`}
                            className={({ isActive: navIsActive }) =>
                              `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                navIsActive
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : "text-white hover:bg-white/10"
                              }`
                            }
                          >
                            <Video className="h-4 w-4" />
                            {!isCollapsed && <span className="truncate">{classroom.name}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* System */}
        <Collapsible open={expandedSections.system} onOpenChange={() => toggleSection('system')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>System</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.system ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderNavItems(systemNavigation)}
                  
                  {/* Master Password Admin Access - Only for non-admins */}
                  {!adminLoading && !isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="text-white [&_svg]:text-white">
                        <button
                          onClick={() => setShowMasterPasswordDialog(true)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full text-left group text-destructive hover:bg-destructive/10 border border-destructive/20"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          {!isCollapsed && <span className="flex-1">Admin (Master)</span>}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Archive */}
        <Collapsible open={expandedSections.archive} onOpenChange={() => toggleSection('archive')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/60 rounded px-2 -mx-2 flex items-center justify-between text-white font-semibold">
                <span>Archive</span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white ${expandedSections.archive ? '' : '-rotate-90'}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderNavItems(archiveNavigation)}</SidebarMenu>
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
          </>
        )}
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

      {/* Master Password Dialog */}
      <MasterPasswordDialog
        open={showMasterPasswordDialog}
        onOpenChange={setShowMasterPasswordDialog}
      />
    </Sidebar>
  );
}
