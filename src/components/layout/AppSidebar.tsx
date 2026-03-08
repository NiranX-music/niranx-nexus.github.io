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
  Pencil,
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
  Edit3,
  Handshake,
  Bot,
  Hammer,
  Activity,
  Clipboard,
  GitBranch,
  Keyboard,
  Box,
  Sun,
  Briefcase,
  Presentation,
  Table,
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
import { SidebarShortcutEditor } from "@/components/sidebar/SidebarShortcutEditor";

// Navigation Configuration - Organized by category
const navigationConfig = {
  main: {
    title: "Command",
    icon: Compass,
    color: "from-primary to-primary-glow",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "What's New", url: "/whats-new", icon: Bell },
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Profile", url: "/profile", icon: User },
    ],
  },
  ai: {
    title: "AI Chat & Assistants",
    icon: Brain,
    color: "from-accent to-accent-glow",
    items: [
      { title: "XNexus AI", url: "/xnexus-ai", icon: Rocket },
      { title: "Xvibing", url: "/xvibing", icon: Code },
      { title: "AI Corner", url: "/ai-corner", icon: Sparkles },
      { title: "AI Chat", url: "/ai-chat", icon: Brain },
      { title: "AI Solver", url: "/ai-solver", icon: Zap },
      { title: "AI Voice Tutor", url: "/ai-voice-tutor", icon: Volume2 },
      { title: "Smart PDF Chat", url: "/smart-pdf-chat", icon: FileSearch },
      { title: "AI Meeting Minutes", url: "/ai-meeting-minutes", icon: Mic },
      { title: "AI Writing Assistant", url: "/ai-writing-assistant", icon: Pen },
      { title: "Study Buddy", url: "/study-buddy", icon: Bot },
      { title: "Concept Explainer", url: "/concept-explainer", icon: Sparkles },
      { title: "XGenesis AI", url: "/xgenesis-ai", icon: Sparkles },
      { title: "XBot", url: "/xbot", icon: Bot },
    ],
  },
  aiTools: {
    title: "AI Generators",
    icon: Sparkles,
    color: "from-primary to-accent",
    items: [
      { title: "Quiz Generator", url: "/quiz-generator", icon: GraduationCap },
      { title: "AI Quiz Generator", url: "/ai-quiz-generator", icon: Brain },
      { title: "AI Image Generator", url: "/lovable-image-gen", icon: Image },
      { title: "AI Doc Summarizer", url: "/ai-doc-summarizer", icon: FileText },
      { title: "PDF Summarizer", url: "/pdf-summarizer", icon: FileText },
      { title: "Topic Map Generator", url: "/ai-topic-map-generator", icon: RouteIcon },
      { title: "Flashcard Generator", url: "/flashcard-generator", icon: Layers },
      { title: "Course Generator", url: "/course-generator", icon: FileStack },
      { title: "AI Study Path", url: "/study-path-generator", icon: RouteIcon },
      { title: "Auto Study Planner", url: "/auto-study-planner", icon: CalendarClock },
      { title: "AI Website Generator", url: "/ai-website-generator", icon: Sparkles },
    ],
  },
  aiModels: {
    title: "AI Models & Hubs",
    icon: Cpu,
    color: "from-primary-glow to-primary",
    items: [
      { title: "Hugging Face Hub", url: "/huggingface-hub", icon: Box },
      { title: "DeepSeek Coder", url: "/deepseek-chat", icon: Cpu },
      { title: "Research Assistant", url: "/research-assistant", icon: Search },
      { title: "Math Solver", url: "/math-solver", icon: Target },
      { title: "Essay Grader", url: "/essay-grader", icon: FileText },
    ],
  },
  study: {
    title: "Focus & Study",
    icon: Target,
    color: "from-success to-success/80",
    items: [
      { title: "Tasks", url: "/tasks", icon: CheckSquare },
      { title: "Focus Engine", url: "/focus-engine", icon: Timer },
      { title: "Study Timer", url: "/study-timer", icon: Timer },
      { title: "Focus Sounds", url: "/focus-sounds", icon: Volume2 },
      { title: "Focus Ambient", url: "/focus-ambient", icon: Eye },
      { title: "Habit Tracker", url: "/habit-tracker", icon: Repeat },
      { title: "Timer Dashboard", url: "/study-timer-dashboard", icon: Timer },
      { title: "Pomodoro Stats", url: "/pomodoro-stats", icon: BarChart3 },
      { title: "Session Planner", url: "/session-planner", icon: CalendarClock },
    ],
  },
  notes: {
    title: "Notes & Knowledge",
    icon: StickyNote,
    color: "from-warning to-warning/80",
    items: [
      { title: "Quick Notes", url: "/quick-notes", icon: StickyNote },
      { title: "Cornell Notes", url: "/cornell-notes", icon: StickyNote },
      { title: "Flashcards", url: "/flashcards", icon: Layers },
      { title: "Spaced Repetition", url: "/spaced-repetition", icon: Brain },
      { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen },
      { title: "Mind Maps", url: "/mind-maps", icon: Map },
      { title: "Whiteboard", url: "/whiteboard", icon: PenTool },
      { title: "Collaborative Whiteboard", url: "/collaborative-whiteboard", icon: Combine },
      { title: "Collaborative Notes", url: "/collaborative-notes", icon: FileText },
      { title: "Cheatsheets", url: "/cheatsheets", icon: FileText },
    ],
  },
  schedule: {
    title: "Planner & Calendar",
    icon: Calendar,
    color: "from-primary/80 to-success/80",
    items: [
      { title: "Scheduler", url: "/scheduler", icon: Calendar },
      { title: "Your Classes", url: "/your-classes", icon: GraduationCap },
      { title: "Weekly Planner", url: "/study-planner-calendar", icon: Calendar },
      { title: "Exams", url: "/exams", icon: GraduationCap },
      { title: "Exam Simulator", url: "/exam-simulator", icon: GraduationCap },
    ],
  },
  learning: {
    title: "Learn & Collaborate",
    icon: GraduationCap,
    color: "from-warning to-warning/80",
    items: [
      { title: "Learning Style Quiz", url: "/learning-style", icon: Brain },
      { title: "Study Rooms", url: "/study-rooms", icon: Radio },
      { title: "Study Groups", url: "/study-groups", icon: Users },
      { title: "Peer Matching", url: "/peer-study-matching", icon: Users },
      { title: "Accountability Partners", url: "/accountability-partners", icon: Handshake },
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
      { title: "Typing Test", url: "/typing-test", icon: Cpu },
    ],
  },
  progress: {
    title: "Progress & Analytics",
    icon: TrendingUp,
    color: "from-destructive to-destructive/80",
    items: [
      { title: "Advanced Dashboard", url: "/advanced-dashboard", icon: BarChart3 },
      { title: "Advanced Analytics", url: "/advanced-analytics", icon: TrendingUp },
      { title: "Study Analytics", url: "/study-analytics", icon: BarChart3 },
      { title: "Progress Journal", url: "/progress-journal", icon: BookOpen },
      { title: "Analytics", url: "/analytics", icon: TrendingUp },
      { title: "Goals", url: "/goals", icon: Target },
      { title: "Study Streaks", url: "/study-streak-challenges", icon: Flame },
      { title: "Study Diary", url: "/study-diary", icon: BookOpen },
      { title: "Knowledge Graph", url: "/knowledge-graph", icon: Brain },
    ],
  },
  rewards: {
    title: "Rewards & Games",
    icon: Trophy,
    color: "from-warning to-accent",
    items: [
      { title: "Daily Challenges", url: "/daily-challenges", icon: Star },
      { title: "Daily Rewards", url: "/daily-rewards", icon: Gift },
      { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
      { title: "Reward Store", url: "/reward-store", icon: ShoppingBag },
      { title: "Games", url: "/games", icon: Gamepad2 },
      { title: "XGames", url: "/xgames", icon: Gamepad2 },
      { title: "XBoard Games", url: "/xboard-games", icon: Gamepad2 },
    ],
  },
  tests: {
    title: "Test Lab",
    icon: FileText,
    color: "from-primary/80 to-accent/80",
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
    color: "from-accent to-primary",
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
    title: "Xstage Studio",
    icon: FileMusic,
    color: "from-primary to-success",
    items: [
      { title: "Xstage Home", url: "/xstage", icon: Music },
      { title: "Dashboard", url: "/xstage/app", icon: Home },
      { title: "Calendar", url: "/xstage/app/calendar", icon: Calendar },
      { title: "Chat", url: "/xstage/app/chat", icon: MessageCircle },
      { title: "Files", url: "/xstage/app/files", icon: FolderOpen },
      { title: "SoundLab X", url: "/xstage/app/soundlab", icon: Headphones },
    ],
  },
  nexus: {
    title: "Nexus Portal",
    icon: Globe,
    color: "from-primary-glow to-accent-glow",
    items: [
      { title: "Nexus Home", url: "/nexus", icon: Globe },
    ],
  },
  social: {
    title: "Social & Community",
    icon: Users,
    color: "from-primary/90 to-accent/90",
    items: [
      { title: "Social Chat", url: "/social-chat", icon: MessageCircle },
      { title: "Messages", url: "/messages", icon: MessageCircle },
      { title: "Community", url: "/community", icon: MessagesSquare },
      { title: "Community Forums", url: "/forums", icon: MessagesSquare },
      { title: "Activity Feed", url: "/activity-feed", icon: TrendingUp },
      { title: "Study Guilds", url: "/guilds", icon: Shield },
      { title: "Blogs", url: "/blogs", icon: BookOpen },
      { title: "XFlow Home", url: "/xflow", icon: Users },
      { title: "XFlow Feed", url: "/xflow/feed", icon: Play },
    ],
  },
  debate: {
    title: "Debate Arena",
    icon: MessageCircle,
    color: "from-warning to-warning/80",
    items: [
      { title: "Debate Hub", url: "/debates", icon: MessageCircle },
      { title: "My Debates", url: "/debates/mine", icon: User },
      { title: "Categories", url: "/debates/categories", icon: Target },
      { title: "Tournaments", url: "/debates/tournaments", icon: Trophy },
    ],
  },
  files: {
    title: "Cloud & Storage",
    icon: Cloud,
    color: "from-muted-foreground to-muted-foreground/80",
    items: [
      { title: "File Hub", url: "/file-hub", icon: FolderOpen },
      { title: "My Cloud", url: "/my-cloud", icon: Cloud },
      { title: "Google Drive", url: "/google-drive", icon: HardDrive },
      { title: "Backblaze Storage", url: "/backblaze-storage", icon: Cloud },
      { title: "Recycle Bin", url: "/recycle-bin", icon: Trash2 },
    ],
  },
  xApps: {
    title: "X-Apps Suite",
    icon: Workflow,
    color: "from-primary/70 to-accent/70",
    items: [
      { title: "XForge", url: "/xforge", icon: Hammer },
      { title: "XBoard", url: "/xboard", icon: LayoutGrid },
      { title: "XVault", url: "/xvault", icon: Lock },
      { title: "XLink", url: "/xlink", icon: Link2 },
      { title: "XPulse", url: "/xpulse", icon: TrendingUp },
      { title: "XSync", url: "/xsync", icon: Cloud },
      { title: "XRadar", url: "/xradar", icon: Activity },
      { title: "XDrop", url: "/xdrop", icon: Upload },
      { title: "XMemo", url: "/xmemo", icon: Brain },
      { title: "XFeed", url: "/xfeed", icon: Layers },
      { title: "XClip", url: "/xclip", icon: Clipboard },
      { title: "XMap", url: "/xmap", icon: GitBranch },
    ],
  },
  devTools: {
    title: "Dev & API Tools",
    icon: Code,
    color: "from-muted-foreground to-primary/60",
    items: [
      { title: "Developer Portal", url: "/developer", icon: Code },
      { title: "Integration Hub", url: "/integration-hub", icon: Plug },
      { title: "API Console", url: "/api-console", icon: Code },
      { title: "REST API Docs", url: "/rest-api-docs", icon: BookOpen },
      { title: "Web Search", url: "/web-search", icon: Search },
      { title: "Xmail", url: "/xmail", icon: Mail },
      { title: "Browser Extension", url: "/browser-extension-sync", icon: Chrome },
      { title: "Extension Download", url: "/extension-download", icon: Puzzle },
      { title: "Password Manager", url: "/password-manager", icon: Lock },
      { title: "User App Library", url: "/app-library", icon: LayoutGrid },
      { title: "Submit Your App", url: "/submit-app", icon: Code },
    ],
  },
  explore: {
    title: "Explore & Discover",
    icon: Globe,
    color: "from-accent/80 to-primary/80",
    items: [
      { title: "XAPI Explorer", url: "/xapi-explorer", icon: Globe },
      { title: "XAPI: Space & Science", url: "/xapi-space-science", icon: Rocket },
      { title: "XAPI: Animals", url: "/xapi-animals", icon: Globe },
      { title: "XAPI: Fun & Random", url: "/xapi-fun-random", icon: Sparkles },
      { title: "XAPI: Food & Drink", url: "/xapi-food-drink", icon: Globe },
      { title: "XAPI: Finance", url: "/xapi-finance", icon: TrendingUp },
      { title: "XAPI: Weather & Geo", url: "/xapi-weather-geo", icon: Cloud },
      { title: "XAPI: Music & Media", url: "/xapi-music-media", icon: Music },
      { title: "XAPI: Games", url: "/xapi-games", icon: Gamepad2 },
      { title: "XAPI: Art & Culture", url: "/xapi-art-culture", icon: Globe },
      { title: "XAPI: Books & Education", url: "/xapi-books-education", icon: BookOpen },
      { title: "XAPI: Tech & Dev", url: "/xapi-tech-dev", icon: Code },
      { title: "XAPI: Sports", url: "/xapi-sports", icon: Trophy },
      { title: "XAPI: Government", url: "/xapi-government", icon: Globe },
      { title: "XAPI: Health", url: "/xapi-health", icon: Globe },
      { title: "Scryfall MTG", url: "/scryfall-search", icon: Sparkles },
      { title: "SpaceX Dashboard", url: "/spacex", icon: Rocket },
      { title: "Sunrise & Sunset", url: "/sunrise-sunset", icon: Sun },
      { title: "NASA NEO Explorer", url: "/nasa-neo", icon: Rocket },
      { title: "Genrenator", url: "/genrenator", icon: Music },
      { title: "Weather", url: "/weather", icon: Cloud },
    ],
  },
  media: {
    title: "Media Player",
    icon: Video,
    color: "from-accent to-destructive/80",
    items: [
      { title: "Video Player", url: "/video-player", icon: Video },
      { title: "FerqX Radio", url: "/ferqx", icon: Radio },
    ],
  },
  settings: {
    title: "Settings & Help",
    icon: Settings,
    color: "from-muted-foreground/80 to-muted-foreground/60",
    items: [
      { title: "Theme Customization", url: "/theme-customization", icon: Palette },
      { title: "Accessibility", url: "/accessibility-settings", icon: Eye },
      { title: "Notifications", url: "/notification-settings", icon: Bell },
      { title: "Feedback", url: "/feedback", icon: MessagesSquare },
      { title: "Docs", url: "/docs", icon: BookOpen },
      { title: "Guide", url: "/guide", icon: BookOpen },
      { title: "Sitemap", url: "/sitemap", icon: Map },
    ],
  },
  archive: {
    title: "Archive",
    icon: Archive,
    color: "from-muted-foreground/60 to-muted-foreground/40",
    items: [
      { title: "Old Pages", url: "/old-pages", icon: Archive },
    ],
  },
};

const adminNavigation = [
  { title: "Admin Dashboard", url: "/admin", icon: UserCog },
  { title: "Xstellar", url: "/stellar", icon: Globe },
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
  const { groups: customGroups, getGroupPages, loading: customGroupsLoading, reload: reloadCustomGroups } = useCustomSidebarGroups();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    main: true,
  });
  const [editingGroup, setEditingGroup] = useState<{key: string; title: string; items: any[]; color: string} | null>(null);

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
    config: { title: string; icon: any; color: string; items: any[] },
    showEditButton = true
  ) => {
    const GroupIcon = config.icon;
    const isExpanded = expandedSections[key];
    
    const handleEditGroup = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      // Open the shortcut editor dialog
      setEditingGroup({
        key,
        title: config.title,
        items: config.items,
        color: config.color,
      });
    };
    
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
                "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 mx-1 transition-all duration-300 group/header",
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
                  <div className="flex items-center gap-1.5">
                    {showEditButton && (
                      <motion.button
                        onClick={handleEditGroup}
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover/header:opacity-100 p-1 rounded-md hover:bg-primary/20 transition-all duration-200"
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </motion.button>
                    )}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {config.items.length}
                    </Badge>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    >
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-colors",
                        isExpanded ? "text-foreground" : "text-muted-foreground"
                      )} />
                    </motion.div>
                  </div>
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
        "border-r border-sidebar-border/10 backdrop-blur-3xl sidebar-glow",
        "bg-sidebar/70"
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
                <span className="font-display font-bold text-lg tracking-wider gradient-text">
                  NIRANX
                </span>
                <span className="text-[9px] text-muted-foreground font-mono tracking-[0.2em] uppercase">
                  CYBER_NEXUS
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
                placeholder="Search..."
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
            className="space-y-1 py-2"
          >
            {Object.entries(navigationConfig).map(([key, config], index, arr) => (
              <div key={key}>
                {renderNavGroup(key, config)}
                {index < arr.length - 1 && (
                  <div className="mx-4 my-1.5">
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                )}
              </div>
            ))}

            {/* Custom Sidebar Groups from Database */}
            {!customGroupsLoading && customGroups.length > 0 && (
              <CustomSidebarGroups
                groups={customGroups}
                getGroupPages={getGroupPages}
                isCollapsed={isCollapsed}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                currentPath={currentPath}
                onReload={reloadCustomGroups}
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
      <SidebarFooter className="border-t border-sidebar-border/20 p-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NavLink 
            to="/profile" 
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
              "hover:bg-primary/5 group neon-border"
            )}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-bold">
                  U
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-mono font-semibold text-xs tracking-wider truncate">USER_PROFILE</span>
                <span className="text-[9px] text-muted-foreground font-mono tracking-wider">LVL_{level} // {xp}_XP</span>
              </div>
            )}
          </NavLink>
        </motion.div>
      </SidebarFooter>
      
      {/* Shortcut Editor Dialog */}
      <SidebarShortcutEditor
        open={!!editingGroup}
        onOpenChange={(open) => !open && setEditingGroup(null)}
        groupKey={editingGroup?.key || ''}
        groupTitle={editingGroup?.title || ''}
        items={editingGroup?.items || []}
        groupColor={editingGroup?.color || 'from-gray-500 to-gray-600'}
        onSave={() => setEditingGroup(null)}
      />
    </Sidebar>
  );
}
