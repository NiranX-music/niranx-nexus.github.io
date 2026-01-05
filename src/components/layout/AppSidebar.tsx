import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Mail,
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
  Layers,
  Bookmark,
  ScanLine,
  Volume2,
  Repeat,
  Radio,
  FileStack,
  Trash2,
  Server,
  Plug,
  Database,
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
import { getValidIconOrFallback, getLucideIcon } from "@/lib/iconValidator";

import { useQuickLinks } from "@/hooks/useQuickLinks";
import { AddQuickLinkDialog } from "@/components/AddQuickLinkDialog";
import { useClassroom } from "@/hooks/useClassroom";
import { useXP } from "@/contexts/XPContext";
import * as LucideIcons from "lucide-react";
import niranxLogo from '@/assets/niranx-logo.jpg';

// Core Navigation
const coreNavigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "What's New", url: "/whats-new", icon: Bell },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "AI Chat", url: "/ai-chat", icon: Brain },
  { title: "AI Chat History", url: "/ai-chat-history", icon: ScrollText },
  { title: "AI Scheduler", url: "/ai-scheduler", icon: Calendar },
  { title: "Class Manager", url: "/class-scheduler", icon: CalendarCheck },
  { title: "Web Search", url: "/web-search", icon: Search },
  { title: "Profile", url: "/profile", icon: User },
];

// AI Corner
const aiCornerNavigation = [
  { title: "AI Hub", url: "/ai-corner", icon: Sparkles },
  { title: "AI Voice Tutor", url: "/ai-voice-tutor", icon: Volume2 },
  { title: "AI Solver", url: "/ai-solver", icon: Brain },
  { title: "AI Chat Hub", url: "/groq-chat", icon: Zap },
  { title: "Chat History", url: "/groq-chat-history", icon: ScrollText },
  { title: "PDF Summarizer", url: "/pdf-summarizer", icon: FileText },
  { title: "Essay Grader", url: "/essay-grader", icon: FileText },
  { title: "AI Library", url: "/ai-library", icon: Archive },
  { title: "Topic Map Generator", url: "/ai-topic-map-generator", icon: RouteIcon },
  { title: "AI Image Generator", url: "/lovable-image-gen", icon: Image },
];

// AI Development
const aiDevelopmentNavigation = [
  { title: "DeepSeek Coder", url: "/deepseek-chat", icon: Brain },
];

// Study & Focus
const studyNavigation = [
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Focus Engine", url: "/focus-engine", icon: Timer },
  { title: "Focus Sounds", url: "/focus-sounds", icon: Volume2 },
  { title: "Flashcards", url: "/flashcards", icon: Layers },
  { title: "Habit Tracker", url: "/habit-tracker", icon: Repeat },
  { title: "Study Analytics", url: "/study-analytics", icon: BarChart3 },
  { title: "Smart Bookmarks", url: "/smart-bookmarks", icon: Bookmark },
  { title: "Distraction Blocker", url: "/distraction-blocker", icon: Shield },
  { title: "Scheduler", url: "/scheduler", icon: Calendar },
  { title: "Labs", url: "/labs", icon: GraduationCap },
  { title: "3D Virtual Labs", url: "/virtual-labs", icon: Zap },
  { title: "AR Flashcards", url: "/ar-flashcards", icon: Eye },
  { title: "Exams", url: "/exams", icon: GraduationCap },
  { title: "Whiteboard", url: "/whiteboard", icon: PenTool },
  { title: "Mind Map Builder", url: "/mind-maps", icon: Map },
];

// Learning & Courses
const learningNavigation = [
  { title: "Course Generator", url: "/course-generator", icon: FileStack },
  { title: "Learning Style Quiz", url: "/learning-style", icon: Brain },
  { title: "AI Study Path", url: "/study-path-generator", icon: RouteIcon },
  { title: "Study Rooms", url: "/study-rooms", icon: Radio },
  { title: "Study Groups", url: "/study-groups", icon: Users },
  { title: "Document Scanner", url: "/document-scanner", icon: ScanLine },
  { title: "Note Summarizer", url: "/note-summarizer", icon: FileText },
  { title: "YouTube Library", url: "/youtube-library", icon: Youtube },
];

// Test Platform
const testNavigation = [
  { title: "Test Hub", url: "/tests", icon: GraduationCap },
  { title: "All Tests", url: "/tests?tab=all-tests", icon: FileText },
  { title: "My Attempts", url: "/tests?tab=attempted", icon: CheckSquare },
  { title: "Test Analytics", url: "/tests/analytics", icon: BarChart3 },
];

// Progress & Gamification
const progressNavigation = [
  { title: "Advanced Dashboard", url: "/advanced-dashboard", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Daily Challenges", url: "/daily-challenges", icon: Star },
  { title: "Daily Rewards", url: "/daily-rewards", icon: Gift },
  { title: "Study Streaks", url: "/study-streak-challenges", icon: Flame },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Reward Store", url: "/reward-store", icon: ShoppingBag },
  { title: "Games", url: "/games", icon: Gamepad2 },
];

// XVibe - Music Platform (New)
const xvibeNavigation = [
  { title: "XVibe Home", url: "/xvibe", icon: Music },
  { title: "Browse Music", url: "/xvibe/home", icon: Headphones },
  { title: "Search", url: "/xvibe/search", icon: Search },
  { title: "My Library", url: "/xvibe/library", icon: BookOpen },
  { title: "Artist Dashboard", url: "/xvibe/artist-dashboard", icon: Users },
  { title: "Upload Track", url: "/xvibe/upload", icon: Upload },
  { title: "Become Artist", url: "/xvibe/artist-register", icon: UserPlus },
];

// Xstage - Music Collaboration Platform
const xstageNavigation = [
  { title: "Xstage Home", url: "/xstage", icon: Music },
  { title: "Dashboard", url: "/xstage/app", icon: Home },
  { title: "Calendar", url: "/xstage/app/calendar", icon: Calendar },
  { title: "Chat", url: "/xstage/app/chat", icon: MessageCircle },
  { title: "Files", url: "/xstage/app/files", icon: FolderOpen },
  { title: "Songs & Setlists", url: "/xstage/app/songs", icon: FileMusic },
  { title: "SoundLab X", url: "/xstage/app/soundlab", icon: Headphones },
  { title: "Team", url: "/xstage/app/team", icon: Users },
];

// Integrations
const integrationsNavigation = [
  { title: "Integrations Hub", url: "/integrations", icon: Plug },
  { title: "FerqX Radio", url: "/integrations?tab=radio", icon: Radio },
];

// Media & Entertainment
const mediaNavigation = [
  { title: "Video Player", url: "/video-player", icon: Video },
  { title: "Video Library", url: "/video-library", icon: Video },
  { title: "StreamSphere", url: "/stream-sphere", icon: Youtube },
];

// Files & Cloud
const filesNavigation = [
  { title: "File Hub", url: "/file-hub", icon: FolderOpen },
  { title: "My Cloud", url: "/my-cloud", icon: Cloud },
  { title: "Local Server Saves", url: "/local-server-saves", icon: HardDrive },
  { title: "Recycle Bin", url: "/recycle-bin", icon: Trash2 },
  { title: "Manage Drives", url: "/manage-drives", icon: HardDrive },
  { title: "Google Drive", url: "/google-drive", icon: HardDrive },
  { title: "XOrbit Calendar", url: "/xorbit", icon: Calendar },
  { title: "Backblaze Storage", url: "/backblaze-storage", icon: Cloud },
  { title: "Upload", url: "/upload", icon: Upload },
];

// Xmail - Email System
const xmailNavigation = [
  { title: "Xmail Inbox", url: "/xmail", icon: Mail },
  { title: "Compose", url: "/xmail", icon: PenTool },
];

// Communication & Social
const socialNavigation = [
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Community", url: "/community", icon: MessagesSquare },
  { title: "Study Guilds", url: "/guilds", icon: Shield },
  { title: "Study Groups", url: "/study-groups", icon: Users },
  { title: "Blogs", url: "/blogs", icon: BookOpen },
  { title: "Picture Share", url: "/picture-share", icon: Image },
  { title: "Video Share", url: "/video-share", icon: Play },
];

// Debate Platform
const debateNavigation = [
  { title: "Debate Hub", url: "/debates", icon: MessageCircle },
  { title: "My Debates", url: "/debates/mine", icon: User },
  { title: "Bookmarked", url: "/debates/bookmarks", icon: StarIcon },
  { title: "Categories", url: "/debates/categories", icon: Target },
  { title: "Leaderboard", url: "/debates/leaderboard", icon: Trophy },
  { title: "Tournaments", url: "/debates/tournaments", icon: Trophy },
  { title: "Live Rooms", url: "/debates/live", icon: Zap },
];

// XFlow Social Platform
const xflowNavigation = [
  { title: "XFlow Home", url: "/xflow", icon: Users },
  { title: "XFlow Feed", url: "/xflow/feed", icon: Play },
  { title: "XFlow Messages", url: "/xflow/messages", icon: MessageCircle },
];

// Tools & Utilities
const toolsNavigation = [
  { title: "Password Manager", url: "/password-manager", icon: Lock },
  { title: "AI Website Generator", url: "/ai-website-generator", icon: Sparkles },
  { title: "My Websites", url: "/ai-website-generator", icon: Layout },
  { title: "Website Embedder", url: "/website", icon: Globe },
  { title: "Study Platforms", url: "/website/study-platforms", icon: GraduationCap },
  { title: "Infinite Chain", url: "/infinite-chain", icon: Infinity },
  { title: "Website Manager", url: "/website-manager", icon: Globe },
  { title: "Web Search", url: "/web-search", icon: Search },
  { title: "PWA Download", url: "/pwa-download", icon: Smartphone },
  { title: "Kiosk Mode", url: "/kiosk-mode", icon: Lock },
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
  { title: "Admin Dashboard", url: "/admin", icon: UserCog },
  { title: "User Controls", url: "/admin/user-controls", icon: Settings },
  { title: "Space Limits", url: "/admin/space-limits", icon: Layers },
  { title: "Artist Accounts", url: "/admin/artist-accounts", icon: Music },
  { title: "Xvibe Moderation", url: "/admin/music-moderation", icon: Music },
  { title: "XFlow Moderation", url: "/admin/xflow-moderation", icon: Users },
  { title: "Template Manager", url: "/admin/templates", icon: BookOpen },
  { title: "Feedback List", url: "/admin/feedback-list", icon: MessagesSquare },
  { title: "What's New Manager", url: "/admin/whats-new", icon: Sparkles },
  { title: "Custom Notifications", url: "/admin/custom-notifications", icon: Bell },
  { title: "Guardian Dashboard", url: "/guardian-dashboard", icon: Users },
];

const teacherNavigation = [
  { title: "Teacher Portal", url: "/teacher/dashboard", icon: GraduationCap },
  { title: "Role Management", url: "/admin/roles", icon: ShieldCheck },
];

const liveClassroomNavigation = [
  { title: "Live Classroom", url: "/live-classroom", icon: Video },
  { title: "Browse Classrooms", url: "/classrooms", icon: BookOpen },
];

const systemNavigation = [
  { title: "Explore Public Spaces", url: "/explore-spaces", icon: Layers },
  { title: "Widget Settings", url: "/widget-settings", icon: Layout },
  { title: "Notification Settings", url: "/notification-settings", icon: Bell },
  { title: "Smart Notifications", url: "/smart-notifications", icon: Zap },
  { title: "Accessibility Settings", url: "/accessibility-settings", icon: Eye },
  { title: "Theme Customization", url: "/theme-customization", icon: Palette },
  { title: "Guardian Settings", url: "/guardian-settings", icon: ShieldCheck },
  { title: "OAuth Settings", url: "/oauth-settings", icon: Link2 },
  { title: "Persona Setup", url: "/persona-setup", icon: User },
  { title: "Study Templates", url: "/study-templates", icon: BookOpen },
  { title: "Activity Log", url: "/security/activity-log", icon: Eye },
  { title: "Feedback & Suggestions", url: "/feedback", icon: MessagesSquare },
  { title: "Android TWA Setup", url: "/twa-setup", icon: Smartphone },
  { title: "Become an Admin", url: "/become-admin", icon: UserPlus },
];

// Archive - Old Pages (includes old music)
const archiveNavigation = [
  { title: "NiranX Nexus AI", url: "/bytez-ai", icon: Sparkles },
  { title: "Global Search", url: "/search", icon: Search },
  { title: "Pomodoro", url: "/pomodoro", icon: Timer },
  { title: "Smart Timetable", url: "/smart-timetable", icon: Calendar },
  { title: "Library", url: "/library", icon: BookOpen },
  // Old music pages
  { title: "Listed Songs", url: "/music/listed-songs", icon: FileMusic },
  { title: "Old Music Hub", url: "/music-hub", icon: FileMusic },
  { title: "Old Music Library", url: "/music/library", icon: Headphones },
  { title: "Listening Library", url: "/listening-library", icon: Headphones },
];

// More Pages
const morePages = [
  { title: "Website Guide", url: "/guide", icon: BookOpen },
  { title: "App Guide", url: "#", icon: HelpCircle, onClick: () => window.dispatchEvent(new Event("restart-guide")) },
  { title: "Sitemap", url: "/sitemap", icon: Map },
  { title: "Old Pages", url: "/old-pages", icon: Archive },
  { title: "Feature Ideas", url: "/feature-suggestions", icon: Sparkles },
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: false,
    aiCorner: false,
    aiDevelopment: false,
    study: false,
    learning: false,
    tests: false,
    progress: false,
    xvibe: false,
    xstage: false,
    integrations: false,
    media: false,
    files: false,
    xmail: false,
    social: false,
    debate: false,
    xflow: false,
    tools: false,
    external: false,
    admin: false,
    teacher: false,
    liveClassrooms: false,
    liveClasses: false,
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
    ...learningNavigation,
    ...testNavigation,
    ...progressNavigation,
    ...xvibeNavigation,
    ...xstageNavigation,
    ...mediaNavigation,
    ...filesNavigation,
    ...xmailNavigation,
    ...socialNavigation,
    ...debateNavigation,
    ...xflowNavigation,
    ...toolsNavigation,
    ...externalPlatforms,
    ...(isAdmin ? adminNavigation : []),
    ...(isTeacher || isAdmin ? teacherNavigation : []),
    ...liveClassroomNavigation,
    ...systemNavigation,
    ...archiveNavigation,
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
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return currentPath === "/" || currentPath === "/dashboard";
    }
    return currentPath === url || currentPath.startsWith(url + "/");
  };

  const handleAddFavorite = (item: { title: string; url: string; icon: any }) => {
    addFavorite(
      item.url,
      item.title,
      item.icon.displayName || item.icon.name || "Star"
    );
  };

  const renderNavItem = (item: any, showFavoriteButton = true) => {
    const Icon = item.icon;
    const external = (item as any).external;
    const itemIsFavorite = isFavorite(item.url);
    
    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          {external ? (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </>
              )}
            </a>
          ) : (
            <NavLink to={item.url} className="flex items-center gap-2 group">
              <Icon className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {showFavoriteButton && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (itemIsFavorite) {
                          removeFavorite(item.url);
                        } else {
                          handleAddFavorite(item);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {itemIsFavorite ? (
                        <StarOff className="h-3 w-3 text-yellow-500" />
                      ) : (
                        <Star className="h-3 w-3 text-muted-foreground hover:text-yellow-500" />
                      )}
                    </button>
                  )}
                </>
              )}
            </NavLink>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderNavGroup = (
    title: string,
    items: any[],
    sectionKey: string,
    icon?: React.ReactNode
  ) => (
    <SidebarGroup>
      <Collapsible
        open={expandedSections[sectionKey]}
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger className="w-full">
          <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1.5 transition-colors">
            <div className="flex items-center gap-2">
              {icon}
              {!isCollapsed && <span>{title}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedSections[sectionKey] ? "rotate-180" : ""
                }`}
              />
            )}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-accent p-0.5 flex-shrink-0">
              <img src={niranxLogo} alt="NiranX" className="w-full h-full object-cover rounded-lg" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">NiranX</span>
                <span className="text-xs text-muted-foreground">StudyVerse</span>
              </div>
            )}
          </NavLink>
        </div>
        
        {!isCollapsed && (
          <div className="mt-4">
            <XPDisplay />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Search */}
        {!isCollapsed && (
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 bg-sidebar-accent/50"
              />
            </div>
          </div>
        )}

        {/* Search Results */}
        {filteredNavItems && (
          <SidebarGroup>
            <SidebarGroupLabel>Search Results</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavItems.length > 0 ? (
                  filteredNavItems.map((item) => renderNavItem(item))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No results found
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Favorites */}
        {!filteredNavItems && favorites.length > 0 && (
          <SidebarGroup>
            <Collapsible
              open={expandedSections.favorites}
              onOpenChange={() => toggleSection("favorites")}
            >
              <CollapsibleTrigger className="w-full">
                <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {!isCollapsed && <span>Favorites</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedSections.favorites ? "rotate-180" : ""
                      }`}
                    />
                  )}
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
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Quick Links */}
        {!filteredNavItems && quickLinks.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                {!isCollapsed && <span>Quick Links</span>}
              </div>
              {!isCollapsed && <AddQuickLinkDialog onAdd={addQuickLink} />}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickLinks.map((link) => {
                  const IconComponent = getLucideIcon(link.icon_name);
                  return (
                    <SidebarMenuItem key={link.id}>
                      <SidebarMenuButton asChild>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 group"
                        >
                          <IconComponent className="h-4 w-4" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 truncate">{link.title}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeQuickLink(link.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <StarOff className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                              </button>
                            </>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Core Navigation */}
        {!filteredNavItems && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  {!isCollapsed && <span>Core</span>}
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {coreNavigation.map((item) => renderNavItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {renderNavGroup("AI Corner", aiCornerNavigation, "aiCorner", <Sparkles className="h-4 w-4" />)}
            {renderNavGroup("AI Development", aiDevelopmentNavigation, "aiDevelopment", <Brain className="h-4 w-4" />)}
            {renderNavGroup("Study & Focus", studyNavigation, "study", <Timer className="h-4 w-4" />)}
            {renderNavGroup("Learning & Courses", learningNavigation, "learning", <BookOpen className="h-4 w-4" />)}
            {renderNavGroup("Test Platform", testNavigation, "tests", <GraduationCap className="h-4 w-4" />)}
            {renderNavGroup("Progress & Gamification", progressNavigation, "progress", <Trophy className="h-4 w-4" />)}
            {renderNavGroup("XVibe Music", xvibeNavigation, "xvibe", <Music className="h-4 w-4" />)}
            {renderNavGroup("Xstage Collaboration", xstageNavigation, "xstage", <Users className="h-4 w-4" />)}
            {renderNavGroup("Integrations", integrationsNavigation, "integrations", <Plug className="h-4 w-4" />)}
            {renderNavGroup("Media", mediaNavigation, "media", <Video className="h-4 w-4" />)}
            {renderNavGroup("Files & Cloud", filesNavigation, "files", <Cloud className="h-4 w-4" />)}
            {renderNavGroup("Xmail", xmailNavigation, "xmail", <Mail className="h-4 w-4" />)}
            {renderNavGroup("Social", socialNavigation, "social", <MessageCircle className="h-4 w-4" />)}
            {renderNavGroup("Debates", debateNavigation, "debate", <MessagesSquare className="h-4 w-4" />)}
            {renderNavGroup("XFlow", xflowNavigation, "xflow", <Play className="h-4 w-4" />)}
            {renderNavGroup("Tools & Utilities", toolsNavigation, "tools", <Settings className="h-4 w-4" />)}
            {renderNavGroup("External Platforms", externalPlatforms, "external", <ExternalLink className="h-4 w-4" />)}
            
            {/* Live Classrooms */}
            {renderNavGroup("Live Classrooms", liveClassroomNavigation, "liveClassrooms", <Video className="h-4 w-4" />)}
            
            {/* My Classes */}
            {classrooms.length > 0 && (
              <SidebarGroup>
                <Collapsible
                  open={expandedSections.liveClasses}
                  onOpenChange={() => toggleSection("liveClasses")}
                >
                  <CollapsibleTrigger className="w-full">
                    <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1.5 transition-colors">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {!isCollapsed && <span>My Classes</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedSections.liveClasses ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {classrooms.map((classroom) => (
                          <SidebarMenuItem key={classroom.id}>
                            <SidebarMenuButton asChild isActive={isActive(`/teacher/classrooms/${classroom.id}`)}>
                              <NavLink to={`/teacher/classrooms/${classroom.id}`} className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {!isCollapsed && <span className="truncate">{classroom.name}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            )}

            {/* Teacher Navigation */}
            {(isTeacher || isAdmin) && !teacherLoading && renderNavGroup("Teacher", teacherNavigation, "teacher", <GraduationCap className="h-4 w-4" />)}
            
            {/* Admin Navigation */}
            {isAdmin && !adminLoading && renderNavGroup("Admin", adminNavigation, "admin", <UserCog className="h-4 w-4" />)}
            
            {renderNavGroup("System & Settings", systemNavigation, "system", <Settings className="h-4 w-4" />)}
            {renderNavGroup("Archive", archiveNavigation, "archive", <Archive className="h-4 w-4" />)}
            {renderNavGroup("More", morePages, "more", <HelpCircle className="h-4 w-4" />)}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <NavLink to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {!isCollapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
