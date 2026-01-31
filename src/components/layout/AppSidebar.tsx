import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Mail,
  MessageCircle,
  CheckSquare,
  Code,
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
  ChevronRight,
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
  Plug,
  Mic,
  FileSearch,
  CalendarClock,
  Chrome,
  Pen,
  StickyNote,
  Combine,
  Menu,
  X,
  Compass,
  LayoutGrid,
  Workflow,
  Cpu,
  Rocket,
  Puzzle,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCustomSidebarGroups } from "@/hooks/useCustomSidebarGroups";
import { CustomSidebarGroups } from "@/components/sidebar/CustomSidebarGroups";

// Navigation Configuration - Organized by category
const navigationConfig = {
  main: {
    title: "Main",
    icon: Compass,
    color: "from-blue-500 to-cyan-500",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "What's New", url: "/whats-new", icon: Bell },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Profile", url: "/profile", icon: User },
    ],
  },
  ai: {
    title: "AI Hub",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    items: [
      { title: "XNexus AI", url: "/xnexus-ai", icon: Rocket },
      { title: "AI Corner", url: "/ai-corner", icon: Sparkles },
      { title: "AI Chat", url: "/ai-chat", icon: Brain },
      { title: "AI Solver", url: "/ai-solver", icon: Zap },
      { title: "AI Voice Tutor", url: "/ai-voice-tutor", icon: Volume2 },
      { title: "Smart PDF Chat", url: "/smart-pdf-chat", icon: FileSearch },
      { title: "AI Meeting Minutes", url: "/ai-meeting-minutes", icon: Mic },
      { title: "AI Writing Assistant", url: "/ai-writing-assistant", icon: Pen },
      { title: "Quiz Generator", url: "/quiz-generator", icon: GraduationCap },
      { title: "Research Assistant", url: "/research-assistant", icon: Search },
      { title: "Math Solver", url: "/math-solver", icon: Target },
      { title: "Concept Explainer", url: "/concept-explainer", icon: Sparkles },
      { title: "PDF Summarizer", url: "/pdf-summarizer", icon: FileText },
      { title: "Essay Grader", url: "/essay-grader", icon: FileText },
      { title: "Topic Map Generator", url: "/ai-topic-map-generator", icon: RouteIcon },
      { title: "AI Image Generator", url: "/lovable-image-gen", icon: Image },
      { title: "DeepSeek Coder", url: "/deepseek-chat", icon: Cpu },
    ],
  },
  study: {
    title: "Study & Focus",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    items: [
      { title: "Tasks", url: "/tasks", icon: CheckSquare },
      { title: "Focus Engine", url: "/focus-engine", icon: Timer },
      { title: "Study Timer", url: "/study-timer", icon: Timer },
      { title: "Focus Sounds", url: "/focus-sounds", icon: Volume2 },
      { title: "Flashcards", url: "/flashcards", icon: Layers },
      { title: "Flashcard Generator", url: "/flashcard-generator", icon: Layers },
      { title: "Spaced Repetition", url: "/spaced-repetition", icon: Brain },
      { title: "Quick Notes", url: "/quick-notes", icon: StickyNote },
      { title: "Habit Tracker", url: "/habit-tracker", icon: Repeat },
      { title: "Scheduler", url: "/scheduler", icon: Calendar },
      { title: "Auto Study Planner", url: "/auto-study-planner", icon: CalendarClock },
      { title: "Exams", url: "/exams", icon: GraduationCap },
      { title: "Exam Simulator", url: "/exam-simulator", icon: GraduationCap },
      { title: "Whiteboard", url: "/whiteboard", icon: PenTool },
      { title: "Collaborative Whiteboard", url: "/collaborative-whiteboard", icon: Combine },
      { title: "Mind Maps", url: "/mind-maps", icon: Map },
    ],
  },
  learning: {
    title: "Learning",
    icon: GraduationCap,
    color: "from-orange-500 to-amber-500",
    items: [
      { title: "Course Generator", url: "/course-generator", icon: FileStack },
      { title: "Learning Style Quiz", url: "/learning-style", icon: Brain },
      { title: "AI Study Path", url: "/study-path-generator", icon: RouteIcon },
      { title: "Study Rooms", url: "/study-rooms", icon: Radio },
      { title: "Study Groups", url: "/study-groups", icon: Users },
      { title: "Code Playground", url: "/code-playground", icon: Cpu },
      { title: "Vocabulary Builder", url: "/vocabulary-builder", icon: BookOpen },
      { title: "Reading Trainer", url: "/reading-trainer", icon: BookOpen },
      { title: "Lecture Transcriber", url: "/lecture-transcriber", icon: Mic },
      { title: "Citation Generator", url: "/citation-generator", icon: FileText },
      { title: "Grade Calculator", url: "/grade-calculator", icon: Target },
      { title: "Document Scanner", url: "/document-scanner", icon: ScanLine },
      { title: "Note Summarizer", url: "/note-summarizer", icon: FileText },
      { title: "YouTube Library", url: "/youtube-library", icon: Youtube },
      { title: "Labs", url: "/labs", icon: GraduationCap },
      { title: "3D Virtual Labs", url: "/virtual-labs", icon: Zap },
    ],
  },
  progress: {
    title: "Progress",
    icon: TrendingUp,
    color: "from-rose-500 to-red-500",
    items: [
      { title: "Advanced Dashboard", url: "/advanced-dashboard", icon: BarChart3 },
      { title: "Study Analytics", url: "/study-analytics", icon: BarChart3 },
      { title: "Progress Journal", url: "/progress-journal", icon: BookOpen },
      { title: "Analytics", url: "/analytics", icon: TrendingUp },
      { title: "Goals", url: "/goals", icon: Target },
      { title: "Daily Challenges", url: "/daily-challenges", icon: Star },
      { title: "Daily Rewards", url: "/daily-rewards", icon: Gift },
      { title: "Study Streaks", url: "/study-streak-challenges", icon: Flame },
      { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
      { title: "Reward Store", url: "/reward-store", icon: ShoppingBag },
      { title: "Games", url: "/games", icon: Gamepad2 },
    ],
  },
  tests: {
    title: "Tests",
    icon: FileText,
    color: "from-indigo-500 to-violet-500",
    items: [
      { title: "Test Hub", url: "/tests", icon: GraduationCap },
      { title: "All Tests", url: "/tests?tab=all-tests", icon: FileText },
      { title: "My Attempts", url: "/tests?tab=attempted", icon: CheckSquare },
      { title: "Test Analytics", url: "/tests/analytics", icon: BarChart3 },
    ],
  },
  xvibe: {
    title: "XVibe Music",
    icon: Music,
    color: "from-fuchsia-500 to-purple-500",
    items: [
      { title: "XVibe Home", url: "/xvibe", icon: Music },
      { title: "Browse Music", url: "/xvibe/home", icon: Headphones },
      { title: "Search", url: "/xvibe/search", icon: Search },
      { title: "My Library", url: "/xvibe/library", icon: BookOpen },
      { title: "Artist Dashboard", url: "/xvibe/artist-dashboard", icon: Users },
      { title: "Upload Track", url: "/xvibe/upload", icon: Upload },
    ],
  },
  xstage: {
    title: "Xstage",
    icon: FileMusic,
    color: "from-cyan-500 to-teal-500",
    items: [
      { title: "Xstage Home", url: "/xstage", icon: Music },
      { title: "Dashboard", url: "/xstage/app", icon: Home },
      { title: "Calendar", url: "/xstage/app/calendar", icon: Calendar },
      { title: "Chat", url: "/xstage/app/chat", icon: MessageCircle },
      { title: "Files", url: "/xstage/app/files", icon: FolderOpen },
      { title: "SoundLab X", url: "/xstage/app/soundlab", icon: Headphones },
    ],
  },
  social: {
    title: "Social",
    icon: Users,
    color: "from-sky-500 to-blue-500",
    items: [
      { title: "Messages", url: "/messages", icon: MessageCircle },
      { title: "Community", url: "/community", icon: MessagesSquare },
      { title: "Study Guilds", url: "/guilds", icon: Shield },
      { title: "Blogs", url: "/blogs", icon: BookOpen },
      { title: "XFlow Home", url: "/xflow", icon: Users },
      { title: "XFlow Feed", url: "/xflow/feed", icon: Play },
    ],
  },
  debate: {
    title: "Debates",
    icon: MessageCircle,
    color: "from-amber-500 to-yellow-500",
    items: [
      { title: "Debate Hub", url: "/debates", icon: MessageCircle },
      { title: "My Debates", url: "/debates/mine", icon: User },
      { title: "Categories", url: "/debates/categories", icon: Target },
      { title: "Tournaments", url: "/debates/tournaments", icon: Trophy },
    ],
  },
  files: {
    title: "Files & Cloud",
    icon: Cloud,
    color: "from-slate-500 to-gray-500",
    items: [
      { title: "File Hub", url: "/file-hub", icon: FolderOpen },
      { title: "My Cloud", url: "/my-cloud", icon: Cloud },
      { title: "Google Drive", url: "/google-drive", icon: HardDrive },
      { title: "Backblaze Storage", url: "/backblaze-storage", icon: Cloud },
      { title: "Recycle Bin", url: "/recycle-bin", icon: Trash2 },
    ],
  },
  tools: {
    title: "Tools",
    icon: Workflow,
    color: "from-zinc-500 to-neutral-500",
    items: [
      { title: "Integration Hub", url: "/integration-hub", icon: Plug },
      { title: "Browser Extension", url: "/browser-extension-sync", icon: Chrome },
      { title: "Extension Download", url: "/extension-download", icon: Puzzle },
      { title: "Password Manager", url: "/password-manager", icon: Lock },
      { title: "AI Website Generator", url: "/ai-website-generator", icon: Sparkles },
      { title: "User App Library", url: "/app-library", icon: LayoutGrid },
      { title: "Submit Your App", url: "/submit-app", icon: Code },
      { title: "Web Search", url: "/web-search", icon: Search },
      { title: "Xmail", url: "/xmail", icon: Mail },
      { title: "Video Player", url: "/video-player", icon: Video },
    ],
  },
  settings: {
    title: "Settings",
    icon: Settings,
    color: "from-gray-500 to-stone-500",
    items: [
      { title: "Theme Customization", url: "/theme-customization", icon: Palette },
      { title: "Accessibility", url: "/accessibility-settings", icon: Eye },
      { title: "Notifications", url: "/notification-settings", icon: Bell },
      { title: "Feedback", url: "/feedback", icon: MessagesSquare },
      { title: "Guide", url: "/guide", icon: BookOpen },
      { title: "Sitemap", url: "/sitemap", icon: Map },
    ],
  },
  archive: {
    title: "Archive",
    icon: Archive,
    color: "from-stone-500 to-neutral-600",
    items: [
      { title: "Old Pages", url: "/old-pages", icon: Archive },
    ],
  },
};

const adminNavigation = [
  { title: "Admin Dashboard", url: "/admin", icon: UserCog },
  { title: "User Controls", url: "/admin/user-controls", icon: Settings },
  { title: "Space Limits", url: "/admin/space-limits", icon: Layers },
  { title: "Artist Accounts", url: "/admin/artist-accounts", icon: Music },
  { title: "Feedback List", url: "/admin/feedback-list", icon: MessagesSquare },
];

const teacherNavigation = [
  { title: "Teacher Portal", url: "/teacher/dashboard", icon: GraduationCap },
  { title: "Role Management", url: "/admin/roles", icon: ShieldCheck },
  { title: "Live Classroom", url: "/live-classroom", icon: Video },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const groupVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.1 },
    },
  },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95 },
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
  const { groups: customGroups, getGroupPages, loading: customGroupsLoading } = useCustomSidebarGroups();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    main: true,
  });

  // Combine all navigation items for search
  const allNavItems = useMemo(() => {
    const items: any[] = [];
    Object.values(navigationConfig).forEach(section => {
      items.push(...section.items);
    });
    if (isAdmin) items.push(...adminNavigation);
    if (isTeacher || isAdmin) items.push(...teacherNavigation);
    return items;
  }, [isAdmin, isTeacher]);

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
    
    const content = (
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            isActive={active}
            className={cn(
              "group relative overflow-hidden rounded-xl transition-all duration-300 h-10",
              active 
                ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-sm shadow-primary/20" 
                : "hover:bg-muted/60"
            )}
          >
            {external ? (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3"
              >
                <motion.div 
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                    active 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                {!isCollapsed && (
                  <>
                    <span className={cn(
                      "flex-1 font-medium text-sm transition-colors",
                      active ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                    )}>{item.title}</span>
                    <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-70 transition-opacity" />
                  </>
                )}
              </a>
            ) : (
              <NavLink to={item.url} className="flex items-center gap-3 px-3">
                <motion.div 
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                    active 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                {!isCollapsed && (
                  <>
                    <span className={cn(
                      "flex-1 font-medium text-sm transition-colors truncate",
                      active ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                    )}>{item.title}</span>
                    {showFavoriteButton && (
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (itemIsFavorite) {
                            removeFavorite(item.url);
                          } else {
                            handleAddFavorite(item);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        {itemIsFavorite ? (
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <Star className="h-3.5 w-3.5 text-muted-foreground hover:text-yellow-500" />
                        )}
                      </motion.button>
                    )}
                  </>
                )}
              </NavLink>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </motion.div>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.url} delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.url}>{content}</div>;
  };

  const renderNavGroup = (
    key: string,
    config: { title: string; icon: any; color: string; items: any[] }
  ) => {
    const GroupIcon = config.icon;
    const isExpanded = expandedSections[key];
    
    return (
      <SidebarGroup key={key} className="py-0.5">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleSection(key)}
        >
          <CollapsibleTrigger className="w-full">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <SidebarGroupLabel className={cn(
                "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 mx-1 transition-all duration-300",
                "hover:bg-muted/60",
                isExpanded && "bg-muted/40"
              )}>
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: isExpanded ? 5 : 0 }}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br shadow-sm",
                      config.color,
                      "text-white"
                    )}
                  >
                    <GroupIcon className="h-4 w-4" />
                  </motion.div>
                  {!isCollapsed && (
                    <span className={cn(
                      "font-semibold text-sm transition-colors",
                      isExpanded ? "text-foreground" : "text-muted-foreground"
                    )}>{config.title}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-colors",
                      isExpanded ? "text-foreground" : "text-muted-foreground"
                    )} />
                  </motion.div>
                )}
              </SidebarGroupLabel>
            </motion.div>
          </CollapsibleTrigger>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <CollapsibleContent forceMount>
                <motion.div
                  variants={groupVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <SidebarGroupContent className="pl-3 pr-1 py-1">
                    <SidebarMenu className="space-y-0.5">
                      {config.items.map((item, index) => renderNavItem(item, true, index))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "border-r border-sidebar-border/30 backdrop-blur-xl",
        "bg-gradient-to-b from-sidebar via-sidebar/98 to-sidebar/95"
      )}
    >
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border/30 p-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <NavLink to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="relative w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0"
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl p-0.5">
                <img 
                  src={niranxLogo} 
                  alt="NiranX" 
                  className="w-full h-full object-cover rounded-xl" 
                />
              </div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
              />
            </motion.div>
            {!isCollapsed && (
              <motion.div 
                className="flex flex-col"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <span className="font-bold text-lg bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                  NiranX
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                  StudyVerse Pro
                </span>
              </motion.div>
            )}
          </NavLink>
        </motion.div>
        
        {!isCollapsed && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <XPDisplay />
          </motion.div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 sidebar-scroll">
        {/* Search */}
        {!isCollapsed && (
          <motion.div 
            className="p-2 pt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-9 h-10 rounded-xl transition-all duration-300",
                  "bg-muted/30 border-muted/30 placeholder:text-muted-foreground/50",
                  "focus:bg-background focus:shadow-lg focus:shadow-primary/5 focus:border-primary/30",
                  "hover:bg-muted/40"
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        <AnimatePresence mode="wait">
          {filteredNavItems && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-2"
            >
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center gap-2 px-4 py-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
                    <Search className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="font-semibold text-sm">Results</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                    {filteredNavItems.length}
                  </Badge>
                </SidebarGroupLabel>
                <SidebarGroupContent className="px-1">
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <SidebarMenu className="space-y-0.5">
                      {filteredNavItems.length > 0 ? (
                        filteredNavItems.map((item, index) => renderNavItem(item, true, index))
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-4 py-8 text-center"
                        >
                          <p className="text-sm text-muted-foreground">No results found</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Try different keywords</p>
                        </motion.div>
                      )}
                    </SidebarMenu>
                  </motion.div>
                </SidebarGroupContent>
              </SidebarGroup>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorites */}
        {!filteredNavItems && favorites.length > 0 && (
          <SidebarGroup className="py-0.5">
            <Collapsible
              open={expandedSections.favorites}
              onOpenChange={() => toggleSection("favorites")}
            >
              <CollapsibleTrigger className="w-full">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <SidebarGroupLabel className={cn(
                    "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 mx-1 transition-all duration-300",
                    "hover:bg-yellow-500/10",
                    expandedSections.favorites && "bg-yellow-500/5"
                  )}>
                    <div className="flex items-center gap-3">
                      <motion.div 
                        animate={{ rotate: expandedSections.favorites ? 5 : 0 }}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-sm"
                      >
                        <Star className="h-4 w-4" />
                      </motion.div>
                      {!isCollapsed && <span className="font-semibold text-sm">Favorites</span>}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          {favorites.length}
                        </Badge>
                        <motion.div
                          animate={{ rotate: expandedSections.favorites ? 180 : 0 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </div>
                    )}
                  </SidebarGroupLabel>
                </motion.div>
              </CollapsibleTrigger>
              <AnimatePresence initial={false}>
                {expandedSections.favorites && (
                  <CollapsibleContent forceMount>
                    <motion.div
                      variants={groupVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <SidebarGroupContent className="pl-3 pr-1 py-1">
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

        {/* Navigation Groups */}
        {!filteredNavItems && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-0.5 py-2"
          >
            {Object.entries(navigationConfig).map(([key, config]) => 
              renderNavGroup(key, config)
            )}

            {/* Custom Sidebar Groups from Database */}
            {!customGroupsLoading && customGroups.length > 0 && (
              <CustomSidebarGroups
                groups={customGroups}
                getGroupPages={getGroupPages}
                isCollapsed={isCollapsed}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                currentPath={currentPath}
              />
            )}

            {/* Admin Section */}
            {isAdmin && !adminLoading && (
              <SidebarGroup className="py-0.5">
                <Collapsible
                  open={expandedSections.admin}
                  onOpenChange={() => toggleSection("admin")}
                >
                  <CollapsibleTrigger className="w-full">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <SidebarGroupLabel className={cn(
                        "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 mx-1 transition-all duration-300",
                        "hover:bg-red-500/10",
                        expandedSections.admin && "bg-red-500/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <motion.div 
                            animate={{ rotate: expandedSections.admin ? 5 : 0 }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </motion.div>
                          {!isCollapsed && <span className="font-semibold text-sm">Admin</span>}
                        </div>
                        {!isCollapsed && (
                          <motion.div
                            animate={{ rotate: expandedSections.admin ? 180 : 0 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        )}
                      </SidebarGroupLabel>
                    </motion.div>
                  </CollapsibleTrigger>
                  <AnimatePresence initial={false}>
                    {expandedSections.admin && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          variants={groupVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <SidebarGroupContent className="pl-3 pr-1 py-1">
                            <SidebarMenu className="space-y-0.5">
                              {adminNavigation.map((item, index) => renderNavItem(item, false, index))}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Collapsible>
              </SidebarGroup>
            )}

            {/* Teacher Section */}
            {(isTeacher || isAdmin) && !teacherLoading && (
              <SidebarGroup className="py-0.5">
                <Collapsible
                  open={expandedSections.teacher}
                  onOpenChange={() => toggleSection("teacher")}
                >
                  <CollapsibleTrigger className="w-full">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <SidebarGroupLabel className={cn(
                        "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 mx-1 transition-all duration-300",
                        "hover:bg-blue-500/10",
                        expandedSections.teacher && "bg-blue-500/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <motion.div 
                            animate={{ rotate: expandedSections.teacher ? 5 : 0 }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm"
                          >
                            <GraduationCap className="h-4 w-4" />
                          </motion.div>
                          {!isCollapsed && <span className="font-semibold text-sm">Teacher</span>}
                        </div>
                        {!isCollapsed && (
                          <motion.div
                            animate={{ rotate: expandedSections.teacher ? 180 : 0 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        )}
                      </SidebarGroupLabel>
                    </motion.div>
                  </CollapsibleTrigger>
                  <AnimatePresence initial={false}>
                    {expandedSections.teacher && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          variants={groupVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <SidebarGroupContent className="pl-3 pr-1 py-1">
                            <SidebarMenu className="space-y-0.5">
                              {teacherNavigation.map((item, index) => renderNavItem(item, false, index))}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </Collapsible>
              </SidebarGroup>
            )}
          </motion.div>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border/30 p-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NavLink 
            to="/profile" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
              "hover:bg-muted/60 group"
            )}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-medium">
                  U
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">User Profile</span>
                <span className="text-[10px] text-muted-foreground">Level {level}</span>
              </div>
            )}
          </NavLink>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
