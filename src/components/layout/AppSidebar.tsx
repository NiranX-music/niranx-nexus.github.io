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
  Mic,
  FileSearch,
  CalendarClock,
  Chrome,
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  { title: "Smart PDF Chat", url: "/smart-pdf-chat", icon: FileSearch },
  { title: "AI Meeting Minutes", url: "/ai-meeting-minutes", icon: Mic },
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
  { title: "Auto Study Planner", url: "/auto-study-planner", icon: CalendarClock },
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
  { title: "Browser Extension", url: "/browser-extension-sync", icon: Chrome },
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
  { title: "Old Pages Archive", url: "/old-pages", icon: Archive },
];

// More Pages
const morePages = [
  { title: "Website Guide", url: "/guide", icon: BookOpen },
  { title: "App Guide", url: "#", icon: HelpCircle, onClick: () => window.dispatchEvent(new Event("restart-guide")) },
  { title: "Sitemap", url: "/sitemap", icon: Map },
  { title: "Feature Ideas", url: "/feature-suggestions", icon: Sparkles },
];

// Animation variants
const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.02,
      duration: 0.3,
      ease: "easeOut" as const,
    },
  }),
  hover: {
    x: 4,
    transition: { duration: 0.2 },
  },
};

const groupVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
      staggerChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
    },
  },
};

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
    favorites: true,
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

  const renderNavItem = (item: any, showFavoriteButton = true, index = 0) => {
    const Icon = item.icon;
    const external = (item as any).external;
    const itemIsFavorite = isFavorite(item.url);
    const active = isActive(item.url);
    
    return (
      <motion.div
        key={item.url}
        custom={index}
        variants={sidebarItemVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            isActive={active}
            className={cn(
              "group relative overflow-hidden transition-all duration-300",
              active && "bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary"
            )}
          >
            {external ? (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  active ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.title}</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </>
                )}
              </a>
            ) : (
              <NavLink to={item.url} className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  active ? "bg-primary/20 text-primary" : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                  <>
                    <span className={cn(
                      "flex-1 font-medium transition-colors",
                      active ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                    )}>{item.title}</span>
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
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      >
                        {itemIsFavorite ? (
                          <StarOff className="h-3.5 w-3.5 text-yellow-500" />
                        ) : (
                          <Star className="h-3.5 w-3.5 text-muted-foreground hover:text-yellow-500" />
                        )}
                      </button>
                    )}
                  </>
                )}
              </NavLink>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </motion.div>
    );
  };

  const renderNavGroup = (
    title: string,
    items: any[],
    sectionKey: string,
    icon?: React.ReactNode,
    accentColor?: string
  ) => (
    <SidebarGroup className="py-1">
      <Collapsible
        open={expandedSections[sectionKey]}
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger className="w-full">
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <SidebarGroupLabel className={cn(
              "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 transition-all duration-300",
              "hover:bg-gradient-to-r hover:from-muted/80 hover:to-transparent",
              expandedSections[sectionKey] && "bg-muted/50"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-300",
                  expandedSections[sectionKey] ? "bg-primary/20 text-primary" : "text-muted-foreground"
                )}>
                  {icon}
                </div>
                {!isCollapsed && (
                  <span className={cn(
                    "font-semibold text-sm transition-colors",
                    expandedSections[sectionKey] ? "text-foreground" : "text-muted-foreground"
                  )}>{title}</span>
                )}
              </div>
              {!isCollapsed && (
                <motion.div
                  animate={{ rotate: expandedSections[sectionKey] ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              )}
            </SidebarGroupLabel>
          </motion.div>
        </CollapsibleTrigger>
        <AnimatePresence>
          {expandedSections[sectionKey] && (
            <CollapsibleContent forceMount>
              <motion.div
                variants={groupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <SidebarGroupContent className="pl-2">
                  <SidebarMenu>
                    {items.map((item, index) => renderNavItem(item, true, index))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50 bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-xl">
      <SidebarHeader className="border-b border-sidebar-border/50 p-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NavLink to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-accent to-primary p-0.5 flex-shrink-0 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={niranxLogo} alt="NiranX" className="w-full h-full object-cover rounded-xl" />
            </motion.div>
            {!isCollapsed && (
              <motion.div 
                className="flex flex-col"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NiranX</span>
                <span className="text-xs text-muted-foreground font-medium">StudyVerse Pro</span>
              </motion.div>
            )}
          </NavLink>
        </motion.div>
        
        {!isCollapsed && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <XPDisplay />
          </motion.div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 sidebar-scroll">
        {/* Search */}
        {!isCollapsed && (
          <motion.div 
            className="p-2 pt-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-muted/30 border-muted/50 rounded-xl transition-all duration-300 focus:bg-background focus:shadow-lg focus:shadow-primary/10 focus:border-primary/50"
              />
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        <AnimatePresence>
          {filteredNavItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center gap-2 px-3">
                  <Search className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Search Results</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{filteredNavItems.length}</Badge>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredNavItems.length > 0 ? (
                      filteredNavItems.map((item, index) => renderNavItem(item, true, index))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">No results found</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Try different keywords</p>
                      </div>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorites */}
        {!filteredNavItems && favorites.length > 0 && (
          <SidebarGroup className="py-1">
            <Collapsible
              open={expandedSections.favorites}
              onOpenChange={() => toggleSection("favorites")}
            >
              <CollapsibleTrigger className="w-full">
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-transparent transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-500">
                        <Star className="h-4 w-4" />
                      </div>
                      {!isCollapsed && <span className="font-semibold text-sm">Favorites</span>}
                    </div>
                    {!isCollapsed && (
                      <motion.div
                        animate={{ rotate: expandedSections.favorites ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    )}
                  </SidebarGroupLabel>
                </motion.div>
              </CollapsibleTrigger>
              <AnimatePresence>
                {expandedSections.favorites && (
                  <CollapsibleContent forceMount>
                    <motion.div
                      variants={groupVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <SidebarGroupContent className="pl-2">
                        <DraggableFavorites
                          favorites={favorites}
                          navItems={allNavItems}
                          onReorder={reorderFavorites}
                          onRemove={removeFavorite}
                          currentPath={currentPath}
                        />
                      </SidebarGroupContent>
                    </motion.div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Quick Links */}
        {!filteredNavItems && quickLinks.length > 0 && (
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-accent/20 text-accent">
                  <Link2 className="h-4 w-4" />
                </div>
                {!isCollapsed && <span className="font-semibold text-sm">Quick Links</span>}
              </div>
              {!isCollapsed && <AddQuickLinkDialog onAdd={addQuickLink} />}
            </SidebarGroupLabel>
            <SidebarGroupContent className="pl-2">
              <SidebarMenu>
                {quickLinks.map((link, index) => {
                  const IconComponent = getLucideIcon(link.icon_name);
                  return (
                    <motion.div
                      key={link.id}
                      custom={index}
                      variants={sidebarItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="group">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3"
                          >
                            <div className="p-1.5 rounded-lg text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50 transition-all">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            {!isCollapsed && (
                              <>
                                <span className="flex-1 truncate font-medium">{link.title}</span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeQuickLink(link.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                >
                                  <StarOff className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                                </button>
                              </>
                            )}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Core Navigation */}
        {!filteredNavItems && (
          <>
            <SidebarGroup className="py-1">
              <SidebarGroupLabel className="flex items-center gap-3 px-3 py-2.5">
                <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                  <Home className="h-4 w-4" />
                </div>
                {!isCollapsed && <span className="font-semibold text-sm">Core</span>}
              </SidebarGroupLabel>
              <SidebarGroupContent className="pl-2">
                <SidebarMenu>
                  {coreNavigation.map((item, index) => renderNavItem(item, true, index))}
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
              <SidebarGroup className="py-1">
                <Collapsible
                  open={expandedSections.liveClasses}
                  onOpenChange={() => toggleSection("liveClasses")}
                >
                  <CollapsibleTrigger className="w-full">
                    <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                      <SidebarGroupLabel className="flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-success/20 text-success">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          {!isCollapsed && <span className="font-semibold text-sm">My Classes</span>}
                        </div>
                        {!isCollapsed && (
                          <motion.div
                            animate={{ rotate: expandedSections.liveClasses ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        )}
                      </SidebarGroupLabel>
                    </motion.div>
                  </CollapsibleTrigger>
                  <AnimatePresence>
                    {expandedSections.liveClasses && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          variants={groupVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <SidebarGroupContent className="pl-2">
                            <SidebarMenu>
                              {classrooms.map((classroom, index) => (
                                <motion.div
                                  key={classroom.id}
                                  custom={index}
                                  variants={sidebarItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  whileHover="hover"
                                >
                                  <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive(`/teacher/classrooms/${classroom.id}`)}>
                                      <NavLink to={`/teacher/classrooms/${classroom.id}`} className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg text-muted-foreground">
                                          <BookOpen className="h-4 w-4" />
                                        </div>
                                        {!isCollapsed && <span className="truncate font-medium">{classroom.name}</span>}
                                      </NavLink>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                </motion.div>
                              ))}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
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

      <SidebarFooter className="border-t border-sidebar-border/50 p-3">
        <SidebarMenu>
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive("/settings")}
                className={cn(
                  "rounded-xl transition-all duration-300",
                  isActive("/settings") && "bg-gradient-to-r from-primary/20 to-transparent"
                )}
              >
                <NavLink to="/settings" className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all",
                    isActive("/settings") ? "bg-primary/20 text-primary" : "text-muted-foreground"
                  )}>
                    <Settings className="h-4 w-4" />
                  </div>
                  {!isCollapsed && <span className="font-medium">Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </motion.div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
