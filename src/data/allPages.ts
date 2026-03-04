// Complete list of all pages in the application
// Used by Guide page and SidebarGroupsManager

export interface PageInfo {
  name: string;
  route: string;
  description: string;
  category: string;
  accessLevel: "Public" | "Authenticated" | "Admin" | "Moderator" | "Teacher" | "Guardian" | "Guest Allowed";
  icon: string;
}

export const allPages: PageInfo[] = [
  // Core Navigation
  { name: "Landing", route: "/", description: "Welcome page with app overview", category: "Core", accessLevel: "Public", icon: "Home" },
  { name: "Dashboard", route: "/niranx/dashboard", description: "Main user dashboard with widgets", category: "Core", accessLevel: "Authenticated", icon: "Home" },
  { name: "What's New", route: "/niranx/whats-new", description: "Latest updates and features", category: "Core", accessLevel: "Authenticated", icon: "Sparkles" },
  { name: "Notifications", route: "/niranx/notifications", description: "View all notifications", category: "Core", accessLevel: "Authenticated", icon: "Bell" },
  { name: "Profile", route: "/niranx/profile", description: "User profile management", category: "Core", accessLevel: "Authenticated", icon: "User" },
  { name: "Settings", route: "/niranx/settings", description: "App settings and preferences", category: "Core", accessLevel: "Authenticated", icon: "Settings" },

  // AI Corner
  { name: "AI Hub", route: "/niranx/ai-corner", description: "Central AI tools hub", category: "AI Corner", accessLevel: "Authenticated", icon: "Sparkles" },
  { name: "AI Chat", route: "/niranx/ai-chat", description: "AI-powered study assistant", category: "AI Corner", accessLevel: "Authenticated", icon: "Brain" },
  { name: "AI Chat History", route: "/niranx/ai-chat-history", description: "View past AI conversations", category: "AI Corner", accessLevel: "Authenticated", icon: "ScrollText" },
  { name: "AI Scheduler", route: "/niranx/ai-scheduler", description: "AI-powered timetable generation", category: "AI Corner", accessLevel: "Authenticated", icon: "Calendar" },
  { name: "AI Solver", route: "/niranx/ai-solver", description: "AI homework solver with image support", category: "AI Corner", accessLevel: "Authenticated", icon: "Brain" },
  { name: "Groq Chat", route: "/niranx/groq-chat", description: "Fast AI chat with Groq models", category: "AI Corner", accessLevel: "Authenticated", icon: "Zap" },
  { name: "Groq Chat History", route: "/niranx/groq-chat-history", description: "Groq conversation history", category: "AI Corner", accessLevel: "Authenticated", icon: "ScrollText" },
  { name: "PDF Summarizer", route: "/niranx/pdf-summarizer", description: "AI-powered PDF summarization", category: "AI Corner", accessLevel: "Authenticated", icon: "FileText" },
  { name: "AI Library", route: "/niranx/ai-library", description: "Saved AI generations", category: "AI Corner", accessLevel: "Authenticated", icon: "Archive" },
  { name: "Topic Map Generator", route: "/niranx/ai-topic-map-generator", description: "Generate visual topic maps", category: "AI Corner", accessLevel: "Authenticated", icon: "Route" },
  { name: "AI Image Generator", route: "/niranx/lovable-image-gen", description: "Generate images with AI", category: "AI Corner", accessLevel: "Authenticated", icon: "Image" },
  { name: "DeepSeek Coder", route: "/niranx/deepseek-chat", description: "AI coding assistant", category: "AI Corner", accessLevel: "Authenticated", icon: "Brain" },

  // Study & Focus
  { name: "Tasks", route: "/niranx/tasks", description: "Task management system", category: "Study", accessLevel: "Authenticated", icon: "CheckSquare" },
  { name: "Focus Engine", route: "/niranx/focus-engine", description: "Focus modes including Pomodoro", category: "Study", accessLevel: "Guest Allowed", icon: "Timer" },
  { name: "Distraction Blocker", route: "/niranx/distraction-blocker", description: "Block distracting websites", category: "Study", accessLevel: "Authenticated", icon: "Shield" },
  { name: "Scheduler", route: "/niranx/scheduler", description: "Enhanced class scheduler", category: "Study", accessLevel: "Authenticated", icon: "Calendar" },
  { name: "Class Scheduler", route: "/niranx/class-scheduler", description: "Manage live classes and exams", category: "Study", accessLevel: "Authenticated", icon: "CalendarCheck" },
  { name: "Labs", route: "/niranx/labs", description: "Virtual science labs", category: "Study", accessLevel: "Authenticated", icon: "GraduationCap" },
  { name: "Chemistry Lab", route: "/niranx/labs/chemistry", description: "Virtual chemistry lab with periodic table", category: "Study", accessLevel: "Authenticated", icon: "Beaker" },
  { name: "Physics Lab", route: "/niranx/labs/physics", description: "Physics simulations and experiments", category: "Study", accessLevel: "Authenticated", icon: "Atom" },
  { name: "Biology Lab", route: "/niranx/labs/biology", description: "Biology virtual lab", category: "Study", accessLevel: "Authenticated", icon: "Leaf" },
  { name: "Math Lab", route: "/niranx/labs/math", description: "Calculator and trigonometry tools", category: "Study", accessLevel: "Authenticated", icon: "Calculator" },
  { name: "Exam Hub", route: "/niranx/exams", description: "Exam management and resources", category: "Study", accessLevel: "Authenticated", icon: "GraduationCap" },
  { name: "Whiteboard", route: "/niranx/whiteboard", description: "Collaborative whiteboard", category: "Study", accessLevel: "Authenticated", icon: "PenTool" },
  { name: "Study Groups", route: "/niranx/study-groups", description: "Collaborative study groups", category: "Study", accessLevel: "Authenticated", icon: "Users" },
  { name: "AI Study Path", route: "/niranx/study-path-generator", description: "Generate personalized study paths", category: "Study", accessLevel: "Authenticated", icon: "Route" },
  { name: "Note Summarizer", route: "/niranx/note-summarizer", description: "Summarize your notes with AI", category: "Study", accessLevel: "Authenticated", icon: "FileText" },
  { name: "YouTube Library", route: "/niranx/youtube-library", description: "Saved educational videos", category: "Study", accessLevel: "Authenticated", icon: "Youtube" },

  // Progress & Gamification
  { name: "Advanced Dashboard", route: "/niranx/advanced-dashboard", description: "Enhanced analytics and progress tracking", category: "Progress", accessLevel: "Authenticated", icon: "BarChart3" },
  { name: "Analytics", route: "/niranx/analytics", description: "Study analytics and statistics", category: "Progress", accessLevel: "Authenticated", icon: "TrendingUp" },
  { name: "Goals", route: "/niranx/goals", description: "Set and track study goals", category: "Progress", accessLevel: "Authenticated", icon: "Target" },
  { name: "Daily Challenges", route: "/niranx/daily-challenges", description: "Daily study challenges", category: "Progress", accessLevel: "Authenticated", icon: "Star" },
  { name: "Daily Rewards", route: "/niranx/daily-rewards", description: "Login rewards and streak system", category: "Progress", accessLevel: "Authenticated", icon: "Gift" },
  { name: "Study Streak Challenges", route: "/niranx/study-streak-challenges", description: "Streak-based challenges", category: "Progress", accessLevel: "Authenticated", icon: "Flame" },
  { name: "Leaderboard", route: "/niranx/leaderboard", description: "Global rankings and competitions", category: "Progress", accessLevel: "Authenticated", icon: "Trophy" },
  { name: "Reward Store", route: "/niranx/reward-store", description: "Redeem XP for rewards", category: "Progress", accessLevel: "Authenticated", icon: "ShoppingBag" },
  { name: "Games", route: "/niranx/games", description: "Educational games", category: "Progress", accessLevel: "Authenticated", icon: "Gamepad2" },

  // XVibe Music Platform
  { name: "XVibe Landing", route: "/xvibe", description: "XVibe music platform landing", category: "XVibe", accessLevel: "Public", icon: "Music" },
  { name: "XVibe Home", route: "/xvibe/home", description: "Browse music and discover artists", category: "XVibe", accessLevel: "Authenticated", icon: "Headphones" },
  { name: "XVibe Search", route: "/xvibe/search", description: "Search tracks, artists, albums", category: "XVibe", accessLevel: "Authenticated", icon: "Search" },
  { name: "XVibe Library", route: "/xvibe/library", description: "Your saved music and playlists", category: "XVibe", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "XVibe Artist Dashboard", route: "/xvibe/artist-dashboard", description: "Artist management dashboard", category: "XVibe", accessLevel: "Authenticated", icon: "Users" },
  { name: "XVibe Upload", route: "/xvibe/upload", description: "Upload tracks to XVibe", category: "XVibe", accessLevel: "Authenticated", icon: "Upload" },
  { name: "XVibe Artist Register", route: "/xvibe/artist-register", description: "Become an XVibe artist", category: "XVibe", accessLevel: "Authenticated", icon: "UserPlus" },

  // Media & Entertainment
  { name: "Video Player", route: "/niranx/video-player", description: "Video player for local files", category: "Media", accessLevel: "Authenticated", icon: "Video" },
  { name: "Video Library", route: "/niranx/video-library", description: "Saved video resources", category: "Media", accessLevel: "Authenticated", icon: "Video" },
  { name: "StreamSphere", route: "/niranx/stream-sphere", description: "YouTube video player", category: "Media", accessLevel: "Authenticated", icon: "Youtube" },

  // Files & Cloud
  { name: "File Hub", route: "/niranx/file-hub", description: "File storage and organization", category: "Files", accessLevel: "Authenticated", icon: "FolderOpen" },
  { name: "My Cloud", route: "/niranx/my-cloud", description: "Personal cloud storage", category: "Files", accessLevel: "Authenticated", icon: "Cloud" },
  { name: "Manage Drives", route: "/niranx/manage-drives", description: "Manage cloud drive connections", category: "Files", accessLevel: "Authenticated", icon: "HardDrive" },
  { name: "Backblaze Storage", route: "/niranx/backblaze-storage", description: "Backblaze B2 cloud storage", category: "Files", accessLevel: "Authenticated", icon: "Cloud" },
  { name: "Upload", route: "/niranx/upload", description: "Upload files to storage", category: "Files", accessLevel: "Authenticated", icon: "Upload" },
  { name: "PDF Viewer", route: "/niranx/pdf-viewer", description: "View and manage PDF files", category: "Files", accessLevel: "Authenticated", icon: "FileText" },

  // Xmail
  { name: "Xmail Inbox", route: "/niranx/xmail", description: "Internal email system", category: "Xmail", accessLevel: "Authenticated", icon: "Mail" },
  { name: "Xmail Profile", route: "/niranx/xmail-profile", description: "Manage Xmail profile", category: "Xmail", accessLevel: "Authenticated", icon: "User" },

  // Communication & Social
  { name: "Messages", route: "/niranx/messages", description: "Direct messaging system", category: "Social", accessLevel: "Authenticated", icon: "MessageCircle" },
  { name: "Community", route: "/niranx/community", description: "Chat rooms and social features", category: "Social", accessLevel: "Authenticated", icon: "MessagesSquare" },
  { name: "Study Guilds", route: "/niranx/guilds", description: "Create or join study guilds", category: "Social", accessLevel: "Authenticated", icon: "Shield" },
  { name: "Blogs", route: "/niranx/blogs", description: "Community blogs and articles", category: "Social", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Picture Share", route: "/niranx/picture-share", description: "Share images with community", category: "Social", accessLevel: "Authenticated", icon: "Image" },
  { name: "Video Share", route: "/niranx/video-share", description: "Share videos with community", category: "Social", accessLevel: "Authenticated", icon: "Play" },

  // Debate Platform
  { name: "Debate Hub", route: "/niranx/debates", description: "Main debate platform", category: "Debates", accessLevel: "Authenticated", icon: "MessageCircle" },
  { name: "My Debates", route: "/niranx/debates/mine", description: "Your debates and arguments", category: "Debates", accessLevel: "Authenticated", icon: "User" },
  { name: "Debate Bookmarks", route: "/niranx/debates/bookmarks", description: "Bookmarked debates", category: "Debates", accessLevel: "Authenticated", icon: "Star" },
  { name: "Debate Categories", route: "/niranx/debates/categories", description: "Browse debate categories", category: "Debates", accessLevel: "Authenticated", icon: "Target" },
  { name: "Debate Leaderboard", route: "/niranx/debates/leaderboard", description: "Top debaters rankings", category: "Debates", accessLevel: "Authenticated", icon: "Trophy" },
  { name: "Debate Tournaments", route: "/niranx/debates/tournaments", description: "Debate competitions", category: "Debates", accessLevel: "Authenticated", icon: "Trophy" },
  { name: "Live Debate Rooms", route: "/niranx/debates/live", description: "Live debate sessions", category: "Debates", accessLevel: "Authenticated", icon: "Zap" },

  // XFlow Social
  { name: "XFlow Home", route: "/niranx/xflow", description: "XFlow social platform login", category: "XFlow", accessLevel: "Authenticated", icon: "Users" },
  { name: "XFlow Feed", route: "/niranx/xflow/feed", description: "Social media feed", category: "XFlow", accessLevel: "Authenticated", icon: "Play" },
  { name: "XFlow Messages", route: "/niranx/xflow/messages", description: "XFlow direct messages", category: "XFlow", accessLevel: "Authenticated", icon: "MessageCircle" },

  // Tools & Utilities
  { name: "AI Website Generator", route: "/niranx/ai-website-generator", description: "Generate websites with AI", category: "Tools", accessLevel: "Authenticated", icon: "Sparkles" },
  { name: "Website Embedder", route: "/niranx/website", description: "Embed external websites", category: "Tools", accessLevel: "Authenticated", icon: "Globe" },
  { name: "Study Platforms", route: "/niranx/website/study-platforms", description: "Links to study platforms", category: "Tools", accessLevel: "Authenticated", icon: "GraduationCap" },
  { name: "Infinite Chain", route: "/niranx/infinite-chain", description: "Chain management tool", category: "Tools", accessLevel: "Authenticated", icon: "Infinity" },
  { name: "Website Manager", route: "/niranx/website-manager", description: "Manage generated websites", category: "Tools", accessLevel: "Authenticated", icon: "Globe" },
  { name: "Web Search", route: "/niranx/web-search", description: "Global search with Google", category: "Tools", accessLevel: "Authenticated", icon: "Search" },
  { name: "Weather", route: "/niranx/weather", description: "Weather information", category: "Tools", accessLevel: "Authenticated", icon: "Cloud" },
  { name: "PWA Download", route: "/niranx/pwa-download", description: "Install as PWA app", category: "Tools", accessLevel: "Authenticated", icon: "Smartphone" },
  { name: "Kiosk Mode", route: "/niranx/kiosk-mode", description: "Locked focus mode", category: "Tools", accessLevel: "Authenticated", icon: "Lock" },

  // Teacher Portal
  { name: "Teacher Dashboard", route: "/niranx/teacher/dashboard", description: "Teacher management portal", category: "Teacher", accessLevel: "Teacher", icon: "GraduationCap" },
  { name: "Classroom Detail", route: "/niranx/teacher/classroom/:id", description: "Individual classroom management", category: "Teacher", accessLevel: "Teacher", icon: "BookOpen" },
  { name: "Live Classroom", route: "/niranx/live-classroom", description: "Join live classroom sessions", category: "Teacher", accessLevel: "Authenticated", icon: "Video" },
  { name: "Join Classroom", route: "/niranx/classrooms", description: "Browse and join classrooms", category: "Teacher", accessLevel: "Authenticated", icon: "BookOpen" },

  // Guardian
  { name: "Guardian Dashboard", route: "/niranx/guardian-dashboard", description: "Parent/teacher monitoring dashboard", category: "Guardian", accessLevel: "Guardian", icon: "Users" },
  { name: "Guardian Settings", route: "/niranx/guardian-settings", description: "Manage guardian access requests", category: "Guardian", accessLevel: "Authenticated", icon: "ShieldCheck" },

  // Admin
  { name: "Admin Dashboard", route: "/niranx/admin", description: "Platform administration", category: "Admin", accessLevel: "Admin", icon: "UserCog" },
  { name: "User Controls", route: "/niranx/admin/user-controls", description: "Manage user settings", category: "Admin", accessLevel: "Admin", icon: "Settings" },
  { name: "Space Limits", route: "/niranx/admin/space-limits", description: "Manage space limits", category: "Admin", accessLevel: "Admin", icon: "Layers" },
  { name: "Music Moderation", route: "/niranx/admin/music-moderation", description: "Moderate music uploads", category: "Admin", accessLevel: "Admin", icon: "Music" },
  { name: "XFlow Moderation", route: "/niranx/admin/xflow-moderation", description: "Moderate XFlow content", category: "Admin", accessLevel: "Admin", icon: "Users" },
  { name: "XVibe Moderation", route: "/xvibe/moderation", description: "Moderate XVibe content", category: "Admin", accessLevel: "Admin", icon: "Music" },
  { name: "Template Manager", route: "/niranx/admin/templates", description: "Manage study templates", category: "Admin", accessLevel: "Admin", icon: "BookOpen" },
  { name: "Feedback List", route: "/niranx/admin/feedback-list", description: "Review user feedback", category: "Admin", accessLevel: "Moderator", icon: "MessagesSquare" },
  { name: "What's New Manager", route: "/niranx/admin/whats-new", description: "Manage announcements", category: "Admin", accessLevel: "Admin", icon: "Sparkles" },
  { name: "Custom Notifications", route: "/niranx/admin/custom-notifications", description: "Send custom notifications", category: "Admin", accessLevel: "Admin", icon: "Bell" },
  { name: "Role Management", route: "/niranx/admin/roles", description: "Manage user roles", category: "Admin", accessLevel: "Admin", icon: "ShieldCheck" },
  { name: "Xstellar", route: "/stellar", description: "Developer & Infrastructure Platform", category: "Admin", accessLevel: "Admin", icon: "Globe" },

  // Settings & System
  { name: "Explore Spaces", route: "/niranx/explore-spaces", description: "Browse public spaces", category: "System", accessLevel: "Authenticated", icon: "Layers" },
  { name: "Widget Settings", route: "/niranx/widget-settings", description: "Customize dashboard widgets", category: "System", accessLevel: "Authenticated", icon: "Layout" },
  { name: "Notification Settings", route: "/niranx/notification-settings", description: "Notification preferences", category: "System", accessLevel: "Authenticated", icon: "Bell" },
  { name: "Smart Notifications", route: "/niranx/smart-notifications", description: "AI-powered notification timing", category: "System", accessLevel: "Authenticated", icon: "Zap" },
  { name: "Accessibility Settings", route: "/niranx/accessibility-settings", description: "Accessibility preferences", category: "System", accessLevel: "Authenticated", icon: "Eye" },
  { name: "Theme Customization", route: "/niranx/theme-customization", description: "Create and customize themes", category: "System", accessLevel: "Authenticated", icon: "Palette" },
  { name: "OAuth Settings", route: "/niranx/oauth-settings", description: "Manage linked accounts", category: "System", accessLevel: "Authenticated", icon: "Link2" },
  { name: "Persona Setup", route: "/niranx/persona-setup", description: "Set up study persona", category: "System", accessLevel: "Authenticated", icon: "User" },
  { name: "Study Templates", route: "/niranx/study-templates", description: "Browse study templates", category: "System", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Activity Log", route: "/niranx/security/activity-log", description: "View activity history", category: "System", accessLevel: "Authenticated", icon: "Eye" },
  { name: "Feedback & Suggestions", route: "/niranx/feedback", description: "Submit feedback to admins", category: "System", accessLevel: "Authenticated", icon: "MessagesSquare" },
  { name: "Feature Suggestions", route: "/niranx/feature-suggestions", description: "Suggest new features", category: "System", accessLevel: "Authenticated", icon: "Sparkles" },
  { name: "Android TWA Setup", route: "/niranx/twa-setup", description: "Setup for Android app", category: "System", accessLevel: "Authenticated", icon: "Smartphone" },
  { name: "Become Admin", route: "/niranx/become-admin", description: "Request admin access", category: "System", accessLevel: "Authenticated", icon: "UserPlus" },

  // Security
  { name: "Two Factor Auth", route: "/niranx/security/2fa", description: "Enable 2FA security", category: "Security", accessLevel: "Authenticated", icon: "Shield" },
  { name: "Session Manager", route: "/niranx/security/sessions", description: "Manage active sessions", category: "Security", accessLevel: "Authenticated", icon: "Key" },
  { name: "Privacy Settings", route: "/niranx/security/privacy", description: "Privacy preferences", category: "Security", accessLevel: "Authenticated", icon: "Lock" },
  { name: "Data Export", route: "/niranx/security/export", description: "Export your data", category: "Security", accessLevel: "Authenticated", icon: "Download" },
  { name: "Audit Log", route: "/niranx/security/audit", description: "Security audit log", category: "Security", accessLevel: "Authenticated", icon: "FileText" },

  // Archive
  { name: "Global Search", route: "/niranx/search", description: "Search across the app", category: "Archive", accessLevel: "Authenticated", icon: "Search" },
  { name: "Pomodoro", route: "/niranx/pomodoro", description: "Legacy pomodoro timer", category: "Archive", accessLevel: "Authenticated", icon: "Timer" },
  { name: "Smart Timetable", route: "/niranx/smart-timetable", description: "AI timetable generator", category: "Archive", accessLevel: "Authenticated", icon: "Calendar" },
  { name: "Library", route: "/niranx/library", description: "Study resources library", category: "Archive", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Listed Songs", route: "/niranx/music/listed-songs", description: "Browse listed songs", category: "Archive", accessLevel: "Authenticated", icon: "FileMusic" },
  { name: "Old Music Hub", route: "/niranx/music-hub", description: "Legacy music hub", category: "Archive", accessLevel: "Authenticated", icon: "FileMusic" },
  { name: "Old Music Library", route: "/niranx/music/library", description: "Legacy music library", category: "Archive", accessLevel: "Authenticated", icon: "Headphones" },
  { name: "Listening Library", route: "/niranx/listening-library", description: "Listening history", category: "Archive", accessLevel: "Authenticated", icon: "Headphones" },
  { name: "Old Pages", route: "/niranx/old-pages", description: "Archive of legacy pages", category: "Archive", accessLevel: "Authenticated", icon: "Archive" },

  // More
  { name: "Website Guide", route: "/niranx/guide", description: "Complete page directory", category: "More", accessLevel: "Moderator", icon: "BookOpen" },
  { name: "Sitemap", route: "/niranx/sitemap", description: "Site map overview", category: "More", accessLevel: "Authenticated", icon: "Map" },
];

export const pageCategories = [
  "Core",
  "AI Corner", 
  "Study",
  "Progress",
  "XVibe",
  "Media",
  "Files",
  "Xmail",
  "Social",
  "Debates",
  "XFlow",
  "Tools",
  "Teacher",
  "Guardian",
  "Admin",
  "System",
  "Security",
  "Archive",
  "More"
];

export const accessLevelColors: Record<PageInfo["accessLevel"], string> = {
  Public: "bg-green-500/20 text-green-700 dark:text-green-300",
  Authenticated: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  Admin: "bg-red-500/20 text-red-700 dark:text-red-300",
  Moderator: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  Teacher: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  Guardian: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  "Guest Allowed": "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
};
