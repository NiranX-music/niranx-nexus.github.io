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
  { name: "Scitely AI", route: "/niranx/scitely-ai", description: "50+ free AI models — chat, image, video, audio", category: "AI Corner", accessLevel: "Authenticated", icon: "Sparkles" },
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
  { name: "Study Diary", route: "/niranx/study-diary", description: "Daily study journal with mood tracking and reflections", category: "Progress", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Knowledge Graph", route: "/niranx/knowledge-graph", description: "Interactive topic connection visualization", category: "Study", accessLevel: "Authenticated", icon: "Brain" },

  // Phase 9-10: Collaboration & Peer Features
  { name: "Peer Study Matching", route: "/niranx/peer-study-matching", description: "Find compatible study partners based on subjects and goals", category: "Social", accessLevel: "Authenticated", icon: "Users" },
  { name: "Accountability Partners", route: "/niranx/accountability-partners", description: "Stay accountable with study partners and shared goals", category: "Social", accessLevel: "Authenticated", icon: "Handshake" },
  { name: "Collaborative Notes", route: "/niranx/collaborative-notes", description: "Create and edit notes together with study partners", category: "Study", accessLevel: "Authenticated", icon: "FileText" },
  { name: "Study Buddy", route: "/niranx/study-buddy", description: "AI companion that studies alongside you with animations", category: "Study", accessLevel: "Authenticated", icon: "Bot" },
  { name: "Advanced Analytics", route: "/niranx/advanced-analytics", description: "Deep analytics dashboard with study metrics", category: "Progress", accessLevel: "Authenticated", icon: "TrendingUp" },
  { name: "API Console", route: "/niranx/api-console", description: "Test and explore platform API endpoints", category: "Tools", accessLevel: "Authenticated", icon: "Code" },

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
  { name: "Social Chat", route: "/niranx/social-chat", description: "Instagram-style chat dashboard with stories and reactions", category: "Social", accessLevel: "Authenticated", icon: "MessageCircle" },
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
  { name: "Docs Hub", route: "/docs", description: "Complete platform documentation, page guide, restrictions & limitations", category: "More", accessLevel: "Public", icon: "BookOpen" },
  { name: "Website Guide", route: "/niranx/guide", description: "Complete page directory", category: "More", accessLevel: "Moderator", icon: "BookOpen" },
  { name: "Sitemap", route: "/niranx/sitemap", description: "Site map overview", category: "More", accessLevel: "Authenticated", icon: "Map" },
  { name: "XForge", route: "/xforge", description: "Visual micro-app & widget builder with AI assist, templates, and drag canvas", category: "Tools", accessLevel: "Authenticated", icon: "Hammer" },
  { name: "XBoard", route: "/xboard", description: "Kanban board for task and project management with drag-and-drop cards", category: "Tools", accessLevel: "Authenticated", icon: "LayoutGrid" },
  { name: "XVault", route: "/xvault", description: "PIN-protected encrypted notes and private journal", category: "Tools", accessLevel: "Authenticated", icon: "Lock" },
  { name: "XLink", route: "/xlink", description: "Customizable link-in-bio page builder with themes and analytics", category: "Tools", accessLevel: "Authenticated", icon: "Link2" },
  { name: "XPulse", route: "/xpulse", description: "Live activity feed showing real-time platform events", category: "Social", accessLevel: "Authenticated", icon: "Activity" },
  { name: "XSync", route: "/xsync", description: "Cross-device sync status and data management", category: "Tools", accessLevel: "Authenticated", icon: "Cloud" },
  { name: "XRadar", route: "/xradar", description: "Personal analytics dashboard with AI insights", category: "Tools", accessLevel: "Authenticated", icon: "Activity" },
  { name: "XDrop", route: "/xdrop", description: "Quick file sharing & drop zone", category: "Tools", accessLevel: "Authenticated", icon: "Upload" },
  { name: "XMemo", route: "/xmemo", description: "Spaced repetition memory system with SM-2 algorithm", category: "Tools", accessLevel: "Authenticated", icon: "Brain" },
  { name: "XFeed", route: "/xfeed", description: "Curated news and RSS feed reader", category: "Tools", accessLevel: "Authenticated", icon: "Rss" },
  { name: "XClip", route: "/xclip", description: "Clipboard manager with history, pins, and snippets", category: "Tools", accessLevel: "Authenticated", icon: "Clipboard" },
  { name: "XMap", route: "/xmap", description: "Visual mind mapping with drag-and-drop nodes", category: "Tools", accessLevel: "Authenticated", icon: "GitBranch" },
  { name: "XBot", route: "/xbot", description: "Create and chat with custom AI agents", category: "Tools", accessLevel: "Authenticated", icon: "Bot" },

  // AI Hub Extended Tools
  { name: "AI Writing Assistant", route: "/niranx/ai-writing-assistant", description: "AI-powered writing helper", category: "AI Corner", accessLevel: "Authenticated", icon: "PenTool" },
  { name: "AI Quiz Generator", route: "/niranx/ai-quiz-generator", description: "Generate quizzes from content", category: "AI Corner", accessLevel: "Authenticated", icon: "HelpCircle" },
  { name: "AI Doc Summarizer", route: "/niranx/ai-doc-summarizer", description: "Summarize documents with AI", category: "AI Corner", accessLevel: "Authenticated", icon: "FileText" },
  { name: "AI Song Generator", route: "/niranx/ai-song-generator", description: "Generate songs with AI", category: "AI Corner", accessLevel: "Authenticated", icon: "Music" },
  { name: "AI Presentation", route: "/niranx/ai-presentation-generator", description: "Generate presentations", category: "AI Corner", accessLevel: "Authenticated", icon: "Presentation" },
  { name: "AI Voice Tutor", route: "/niranx/ai-voice-tutor", description: "Voice-based AI tutor", category: "AI Corner", accessLevel: "Authenticated", icon: "Mic" },
  { name: "AI Meeting Minutes", route: "/niranx/ai-meeting-minutes", description: "Auto-generate meeting notes", category: "AI Corner", accessLevel: "Authenticated", icon: "FileText" },
  { name: "Smart PDF Chat", route: "/niranx/smart-pdf-chat", description: "Chat with PDF documents", category: "AI Corner", accessLevel: "Authenticated", icon: "MessageCircle" },
  { name: "Concept Explainer", route: "/niranx/concept-explainer", description: "AI concept explanations", category: "AI Corner", accessLevel: "Authenticated", icon: "Lightbulb" },
  { name: "Exam Simulator", route: "/niranx/exam-simulator", description: "AI-powered exam practice", category: "AI Corner", accessLevel: "Authenticated", icon: "GraduationCap" },
  { name: "Math Solver", route: "/niranx/math-solver", description: "Step-by-step math solutions", category: "AI Corner", accessLevel: "Authenticated", icon: "Calculator" },
  { name: "Essay Grader", route: "/niranx/essay-grader", description: "AI essay grading and feedback", category: "AI Corner", accessLevel: "Authenticated", icon: "FileText" },
  { name: "Research Assistant", route: "/niranx/research-assistant", description: "AI research with Perplexity", category: "AI Corner", accessLevel: "Authenticated", icon: "Search" },
  { name: "XNexus AI", route: "/niranx/xnexus-ai", description: "Multi-model AI chat with BYTEZ", category: "AI Corner", accessLevel: "Authenticated", icon: "Brain" },
  { name: "Xvibing", route: "/niranx/xvibing", description: "AI coding assistant with Blackbox", category: "AI Corner", accessLevel: "Authenticated", icon: "Code" },
  { name: "Bytez AI", route: "/niranx/bytez-ai", description: "Multi-model AI with BYTEZ API", category: "AI Corner", accessLevel: "Authenticated", icon: "Sparkles" },
  { name: "OpenRouter Chat", route: "/niranx/openrouter-chat", description: "Multi-model chat via OpenRouter", category: "AI Corner", accessLevel: "Authenticated", icon: "MessageCircle" },
  { name: "Auto Study Planner", route: "/niranx/auto-study-planner", description: "AI auto-generated study plans", category: "AI Corner", accessLevel: "Authenticated", icon: "Calendar" },
  { name: "Lovable Image Gen", route: "/niranx/lovable-image-gen", description: "Generate images with AI", category: "AI Corner", accessLevel: "Authenticated", icon: "Image" },
  { name: "AI Image Generator", route: "/niranx/ai-image-generator", description: "FluxAPI image generation", category: "AI Corner", accessLevel: "Authenticated", icon: "Image" },

  // Study Tools Extended
  { name: "Flashcards", route: "/niranx/flashcards", description: "Flashcard system with spaced repetition", category: "Study", accessLevel: "Authenticated", icon: "CreditCard" },
  { name: "Flashcard Generator", route: "/niranx/flashcard-generator", description: "AI flashcard generation", category: "Study", accessLevel: "Authenticated", icon: "CreditCard" },
  { name: "Cornell Notes", route: "/niranx/cornell-notes", description: "Cornell note-taking method", category: "Study", accessLevel: "Authenticated", icon: "FileText" },
  { name: "Session Planner", route: "/niranx/session-planner", description: "Plan study sessions", category: "Study", accessLevel: "Authenticated", icon: "Calendar" },
  { name: "Habit Tracker", route: "/niranx/habit-tracker", description: "Track daily habits", category: "Study", accessLevel: "Authenticated", icon: "CheckSquare" },
  { name: "Course Generator", route: "/niranx/course-generator", description: "AI course generation", category: "Study", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Study Rooms", route: "/niranx/study-rooms", description: "Virtual study rooms", category: "Study", accessLevel: "Authenticated", icon: "Users" },
  { name: "Learning Style", route: "/niranx/learning-style", description: "Analyze your learning style", category: "Study", accessLevel: "Authenticated", icon: "Brain" },
  { name: "Mind Maps", route: "/niranx/mind-maps", description: "Visual mind map builder", category: "Study", accessLevel: "Authenticated", icon: "GitBranch" },
  { name: "AR Flashcards", route: "/niranx/ar-flashcards", description: "Augmented reality flashcards", category: "Study", accessLevel: "Authenticated", icon: "Eye" },
  { name: "Virtual Labs", route: "/niranx/virtual-labs", description: "Interactive virtual labs", category: "Study", accessLevel: "Authenticated", icon: "Beaker" },
  { name: "Study Planner Calendar", route: "/niranx/study-planner-calendar", description: "Calendar-based study planner", category: "Study", accessLevel: "Authenticated", icon: "Calendar" },
  { name: "Quick Cheatsheets", route: "/niranx/cheatsheets", description: "Quick reference cheatsheets", category: "Study", accessLevel: "Authenticated", icon: "FileText" },
  { name: "Knowledge Base Wiki", route: "/niranx/knowledge-base", description: "Community knowledge wiki", category: "Study", accessLevel: "Authenticated", icon: "BookOpen" },

  // Productivity
  { name: "Typing Speed Test", route: "/niranx/typing-test", description: "Test and improve typing speed", category: "Tools", accessLevel: "Authenticated", icon: "Keyboard" },
  { name: "Smart Bookmarks", route: "/niranx/smart-bookmarks", description: "AI-organized bookmarks", category: "Tools", accessLevel: "Authenticated", icon: "Bookmark" },
  { name: "Code Playground", route: "/niranx/code-playground", description: "Online code editor", category: "Tools", accessLevel: "Authenticated", icon: "Code" },
  { name: "Citation Generator", route: "/niranx/citation-generator", description: "Generate citations", category: "Tools", accessLevel: "Authenticated", icon: "Quote" },
  { name: "Vocabulary Builder", route: "/niranx/vocabulary-builder", description: "Build vocabulary with AI", category: "Tools", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Grade Calculator", route: "/niranx/grade-calculator", description: "Calculate grades and GPA", category: "Tools", accessLevel: "Authenticated", icon: "Calculator" },
  { name: "Reading Trainer", route: "/niranx/reading-trainer", description: "Speed reading trainer", category: "Tools", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Lecture Transcriber", route: "/niranx/lecture-transcriber", description: "Transcribe lectures", category: "Tools", accessLevel: "Authenticated", icon: "Mic" },
  { name: "Document Scanner", route: "/niranx/document-scanner", description: "Scan and digitize documents", category: "Tools", accessLevel: "Authenticated", icon: "Camera" },
  { name: "Focus Sounds", route: "/niranx/focus-sounds", description: "Ambient sounds for focus", category: "Tools", accessLevel: "Authenticated", icon: "Volume2" },
  { name: "Quiz Generator", route: "/niranx/quiz-generator", description: "Generate quizzes from notes", category: "Tools", accessLevel: "Authenticated", icon: "HelpCircle" },
  { name: "Password Manager", route: "/niranx/password-manager", description: "Encrypted password vault", category: "Security", accessLevel: "Authenticated", icon: "Key" },
  { name: "FerqX Radio", route: "/niranx/ferqx", description: "Online radio streaming", category: "Media", accessLevel: "Authenticated", icon: "Radio" },

  // Progress Extended
  { name: "Pomodoro Stats", route: "/niranx/pomodoro-stats", description: "Pomodoro session statistics", category: "Progress", accessLevel: "Authenticated", icon: "BarChart3" },
  { name: "Focus Ambient", route: "/niranx/focus-ambient", description: "Ambient focus environment", category: "Progress", accessLevel: "Authenticated", icon: "Moon" },
  { name: "Progress Journal", route: "/niranx/progress-journal", description: "Track study progress", category: "Progress", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Study Timer Analytics", route: "/niranx/study-timer", description: "Detailed timer analytics", category: "Progress", accessLevel: "Authenticated", icon: "Timer" },
  { name: "Study Analytics", route: "/niranx/study-analytics", description: "Deep study analytics", category: "Progress", accessLevel: "Authenticated", icon: "TrendingUp" },

  // Social Extended
  { name: "Activity Feed", route: "/niranx/activity-feed", description: "Platform activity feed", category: "Social", accessLevel: "Authenticated", icon: "Activity" },
  { name: "Community Forums", route: "/niranx/forums", description: "Discussion forums", category: "Social", accessLevel: "Authenticated", icon: "MessagesSquare" },

  // Test Platform
  { name: "Test Hub", route: "/niranx/tests", description: "Browse and take tests", category: "Study", accessLevel: "Authenticated", icon: "ClipboardList" },
  { name: "Test Builder", route: "/niranx/tests/create", description: "Create custom tests", category: "Study", accessLevel: "Authenticated", icon: "Plus" },
  { name: "AI Test Generator", route: "/niranx/tests/ai-generate", description: "Generate tests with AI", category: "Study", accessLevel: "Authenticated", icon: "Sparkles" },

  // App Library
  { name: "App Library", route: "/niranx/app-library", description: "Browse community apps", category: "Tools", accessLevel: "Authenticated", icon: "Grid" },
  { name: "Personal Apps", route: "/niranx/personal-apps", description: "Your personal apps", category: "Tools", accessLevel: "Authenticated", icon: "User" },
  { name: "Submit App", route: "/niranx/submit-app", description: "Submit your app", category: "Tools", accessLevel: "Authenticated", icon: "Upload" },

  // Integrations
  { name: "Integrations", route: "/niranx/integrations", description: "Connect external services", category: "System", accessLevel: "Authenticated", icon: "Plug" },
  { name: "Google Drive", route: "/niranx/google-drive", description: "Google Drive integration", category: "Files", accessLevel: "Authenticated", icon: "HardDrive" },
  { name: "XOrbit", route: "/niranx/xorbit", description: "XOrbit cloud integration", category: "Files", accessLevel: "Authenticated", icon: "Cloud" },
  { name: "Email Reports", route: "/niranx/settings/email-reports", description: "Configure email reports", category: "System", accessLevel: "Authenticated", icon: "Mail" },
  { name: "Browser Extension Sync", route: "/niranx/browser-extension-sync", description: "Sync with browser extension", category: "System", accessLevel: "Authenticated", icon: "Plug" },

  // Xstage
  { name: "Xstage", route: "/xstage", description: "Music collaboration platform", category: "XVibe", accessLevel: "Authenticated", icon: "Music" },

  // Support Pages
  { name: "About Us", route: "/niranx/about", description: "About NiranX", category: "More", accessLevel: "Authenticated", icon: "Info" },
  { name: "Careers", route: "/niranx/careers", description: "Job opportunities", category: "More", accessLevel: "Authenticated", icon: "Briefcase" },
  { name: "Help Centre", route: "/support/help", description: "Help and support", category: "More", accessLevel: "Public", icon: "HelpCircle" },
  { name: "Contact", route: "/support/contact", description: "Contact support", category: "More", accessLevel: "Public", icon: "Mail" },
  { name: "Privacy Policy", route: "/support/privacy", description: "Privacy policy", category: "More", accessLevel: "Public", icon: "Shield" },
  { name: "Terms & Conditions", route: "/support/terms", description: "Terms of service", category: "More", accessLevel: "Public", icon: "FileText" },

  // Nexus Portal
  { name: "Nexus Portal", route: "/nexus", description: "Gateway to all NiranX portals and curated links", category: "Nexus", accessLevel: "Public", icon: "Globe" },
  { name: "Nexus Category", route: "/nexus/:categorySlug", description: "Individual Nexus category with curated links and guides", category: "Nexus", accessLevel: "Public", icon: "Folder" },

  // Developer Tools
  { name: "REST API Docs", route: "/niranx/rest-api-docs", description: "Complete REST API documentation with endpoints and examples", category: "Tools", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "Scryfall MTG Search", route: "/niranx/scryfall-search", description: "Search Magic: The Gathering cards via Scryfall API", category: "Tools", accessLevel: "Authenticated", icon: "Sparkles" },
  { name: "SpaceX Dashboard", route: "/niranx/spacex", description: "Real-time SpaceX launch, rocket, capsule, starlink and launchpad data", category: "Tools", accessLevel: "Authenticated", icon: "Rocket" },
  { name: "XGames", route: "/xgames", description: "Play HTML5 games powered by GameDistribution", category: "Progress", accessLevel: "Authenticated", icon: "Gamepad2" },
  { name: "Sunrise & Sunset", route: "/sunrise-sunset", description: "Real-time sunrise, sunset, dawn, dusk and golden hour data", category: "Tools", accessLevel: "Authenticated", icon: "Sun" },
  { name: "NASA NEO Explorer", route: "/nasa-neo", description: "Browse NASA near-earth asteroids with orbital data and close approaches", category: "Tools", accessLevel: "Authenticated", icon: "Rocket" },
  { name: "Genrenator", route: "/genrenator", description: "Random music genre and story generator powered by Binary Jazz API", category: "Tools", accessLevel: "Authenticated", icon: "Music" },
  { name: "XBoard Games", route: "/xboard-games", description: "Explore board games with hot rankings, search and details via BoardGameGeek API", category: "Tools", accessLevel: "Authenticated", icon: "Gamepad2" },
  { name: "XAPI Explorer", route: "/xapi-explorer", description: "Unified hub to browse and test 100+ free public APIs", category: "Tools", accessLevel: "Authenticated", icon: "Layers" },
  { name: "XAPI: Space & Science", route: "/xapi-space-science", description: "NASA, SpaceX, ISS, earthquakes and more", category: "Tools", accessLevel: "Authenticated", icon: "Rocket" },
  { name: "XAPI: Animals", route: "/xapi-animals", description: "Random dogs, cats, foxes, and bear images", category: "Tools", accessLevel: "Authenticated", icon: "Globe" },
  { name: "XAPI: Fun & Random", route: "/xapi-fun-random", description: "Jokes, trivia, advice, and random facts", category: "Tools", accessLevel: "Authenticated", icon: "Sparkles" },
  { name: "XAPI: Food & Drink", route: "/xapi-food-drink", description: "Meals, cocktails, breweries, and food data", category: "Tools", accessLevel: "Authenticated", icon: "Globe" },
  { name: "XAPI: Finance", route: "/xapi-finance", description: "Crypto prices, exchange rates, name predictions", category: "Tools", accessLevel: "Authenticated", icon: "TrendingUp" },
  { name: "XAPI: Weather & Geo", route: "/xapi-weather-geo", description: "Weather, geolocation, countries, timezones", category: "Tools", accessLevel: "Authenticated", icon: "Cloud" },
  { name: "XAPI: Music & Media", route: "/xapi-music-media", description: "iTunes, MusicBrainz, Deezer, radio stations", category: "Tools", accessLevel: "Authenticated", icon: "Music" },
  { name: "XAPI: Games", route: "/xapi-games", description: "Pokémon, D&D, trivia, chess, game deals", category: "Tools", accessLevel: "Authenticated", icon: "Gamepad2" },
  { name: "XAPI: Art & Culture", route: "/xapi-art-culture", description: "Museum collections, colors, placeholder images", category: "Tools", accessLevel: "Authenticated", icon: "Palette" },
  { name: "XAPI: Books & Education", route: "/xapi-books-education", description: "Books, dictionaries, Wikipedia, quotes", category: "Tools", accessLevel: "Authenticated", icon: "BookOpen" },
  { name: "XAPI: Tech & Dev", route: "/xapi-tech-dev", description: "GitHub, JSONPlaceholder, Hacker News, dev tools", category: "Tools", accessLevel: "Authenticated", icon: "Code" },
  { name: "XAPI: Sports", route: "/xapi-sports", description: "Football, F1, NBA, NHL, cricket data", category: "Tools", accessLevel: "Authenticated", icon: "Trophy" },
  { name: "XAPI: Government", route: "/xapi-government", description: "Census, FBI wanted, federal documents", category: "Tools", accessLevel: "Authenticated", icon: "Landmark" },
  { name: "XAPI: Health", route: "/xapi-health", description: "Disease tracking, FDA, WHO health data", category: "Tools", accessLevel: "Authenticated", icon: "Heart" },
  { name: "Your Classes", route: "/your-classes", description: "Live classes, study materials, and quick navigation shortcuts", category: "Study", accessLevel: "Authenticated", icon: "GraduationCap" },
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
  "Nexus",
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
