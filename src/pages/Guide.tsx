import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PageInfo {
  name: string;
  route: string;
  description: string;
  accessLevel: "Public" | "Authenticated" | "Admin" | "Guardian" | "Guest Allowed";
}

const pages: PageInfo[] = [
  { name: "Landing", route: "/", description: "Welcome page with app overview", accessLevel: "Public" },
  { name: "Dashboard", route: "/niranx/dashboard", description: "Main user dashboard with widgets", accessLevel: "Authenticated" },
  { name: "Advanced Dashboard", route: "/niranx/advanced-dashboard", description: "Enhanced analytics and progress tracking", accessLevel: "Authenticated" },
  { name: "Focus Engine", route: "/niranx/focus", description: "Focus modes including Pomodoro and Havoc mode", accessLevel: "Guest Allowed" },
  { name: "AI Chat", route: "/niranx/ai-chat", description: "AI-powered study assistant", accessLevel: "Authenticated" },
  { name: "AI Chat History", route: "/niranx/ai-chat-history", description: "View past AI conversations", accessLevel: "Authenticated" },
  { name: "AI Scheduler", route: "/niranx/ai-scheduler", description: "AI-powered timetable generation", accessLevel: "Authenticated" },
  { name: "Class Scheduler", route: "/niranx/class-scheduler", description: "Manage live classes, homework, and exams", accessLevel: "Authenticated" },
  { name: "Tasks", route: "/niranx/tasks", description: "Task management system", accessLevel: "Authenticated" },
  { name: "Goals", route: "/niranx/goals", description: "Set and track study goals", accessLevel: "Authenticated" },
  { name: "Analytics", route: "/niranx/analytics", description: "Study analytics and statistics", accessLevel: "Authenticated" },
  { name: "Exam Hub", route: "/niranx/exams", description: "Exam management and resources", accessLevel: "Authenticated" },
  { name: "File Hub", route: "/niranx/file-hub", description: "File storage and organization", accessLevel: "Authenticated" },
  { name: "Labs - Chemistry", route: "/niranx/labs/chemistry", description: "Virtual chemistry lab with periodic table", accessLevel: "Authenticated" },
  { name: "Labs - Physics", route: "/niranx/labs/physics", description: "Physics simulations and experiments", accessLevel: "Authenticated" },
  { name: "Labs - Biology", route: "/niranx/labs/biology", description: "Biology virtual lab", accessLevel: "Authenticated" },
  { name: "Labs - Math", route: "/niranx/labs/math", description: "Calculator and trigonometry tools", accessLevel: "Authenticated" },
  { name: "Community", route: "/niranx/community", description: "Chat rooms and social features", accessLevel: "Authenticated" },
  { name: "Study Groups", route: "/niranx/study-groups", description: "Collaborative study groups", accessLevel: "Authenticated" },
  { name: "Messages", route: "/niranx/messages", description: "Direct messaging system", accessLevel: "Authenticated" },
  { name: "Leaderboard", route: "/niranx/leaderboard", description: "Global rankings and competitions", accessLevel: "Authenticated" },
  { name: "Daily Challenges", route: "/niranx/daily-challenges", description: "Daily study challenges", accessLevel: "Authenticated" },
  { name: "Study Streak Challenges", route: "/niranx/study-streak-challenges", description: "Streak-based challenges", accessLevel: "Authenticated" },
  { name: "Reward Store", route: "/niranx/reward-store", description: "Redeem XP for rewards", accessLevel: "Authenticated" },
  { name: "Music Hub", route: "/niranx/music-hub", description: "Study music player", accessLevel: "Authenticated" },
  { name: "Listening Library", route: "/niranx/listening-library", description: "Your music listening history", accessLevel: "Authenticated" },
  { name: "Video Library", route: "/niranx/video-library", description: "Saved video resources", accessLevel: "Authenticated" },
  { name: "StreamSphere", route: "/niranx/streamsphere", description: "YouTube video player", accessLevel: "Authenticated" },
  { name: "Blogs", route: "/niranx/blogs", description: "Community blogs and articles", accessLevel: "Authenticated" },
  { name: "Library", route: "/niranx/library", description: "Study resources library", accessLevel: "Authenticated" },
  { name: "Web Search", route: "/niranx/web-search", description: "Global search with Google integration", accessLevel: "Authenticated" },
  { name: "Whiteboard", route: "/niranx/whiteboard", description: "Collaborative whiteboard", accessLevel: "Authenticated" },
  { name: "Picture Share", route: "/niranx/picture-share", description: "Share images with community", accessLevel: "Authenticated" },
  { name: "Distraction Blocker", route: "/niranx/distraction-blocker", description: "Block distracting websites", accessLevel: "Authenticated" },
  { name: "Kiosk Mode", route: "/niranx/kiosk-mode", description: "Locked focus mode", accessLevel: "Authenticated" },
  { name: "Guardian Dashboard", route: "/guardian-dashboard", description: "Parent/teacher monitoring dashboard", accessLevel: "Guardian" },
  { name: "Guardian Settings", route: "/guardian-settings", description: "Manage guardian access requests", accessLevel: "Authenticated" },
  { name: "Admin Dashboard", route: "/admin", description: "Platform administration", accessLevel: "Admin" },
  { name: "Admin - Message Reports", route: "/admin/message-reports", description: "Review reported messages", accessLevel: "Admin" },
  { name: "Admin - Request Analytics", route: "/admin/request-analytics", description: "Admin request statistics", accessLevel: "Admin" },
  { name: "Profile", route: "/niranx/profile", description: "User profile management", accessLevel: "Authenticated" },
  { name: "Settings", route: "/niranx/settings", description: "App settings and preferences", accessLevel: "Authenticated" },
  { name: "Accessibility Settings", route: "/accessibility-settings", description: "Accessibility preferences", accessLevel: "Authenticated" },
  { name: "Notification Settings", route: "/notification-settings", description: "Notification preferences", accessLevel: "Authenticated" },
  { name: "OAuth Settings", route: "/oauth-settings", description: "Manage linked accounts", accessLevel: "Authenticated" },
  { name: "Privacy Settings", route: "/privacy-settings", description: "Privacy and security settings", accessLevel: "Authenticated" },
  { name: "Blog Settings", route: "/blog-settings", description: "Blog publishing preferences", accessLevel: "Authenticated" },
  { name: "Feedback & Suggestions", route: "/feedback-suggestions", description: "Submit feedback to admins", accessLevel: "Authenticated" },
  { name: "Become Admin", route: "/become-admin", description: "Request admin access", accessLevel: "Authenticated" },
  { name: "Old Page Archive", route: "/old-page-archive", description: "Legacy pages archive", accessLevel: "Authenticated" },
];

const accessLevelColors: Record<PageInfo["accessLevel"], string> = {
  Public: "bg-green-500/20 text-green-700 dark:text-green-300",
  Authenticated: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  Admin: "bg-red-500/20 text-red-700 dark:text-red-300",
  Guardian: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  "Guest Allowed": "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
};

export default function Guide() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Website Guide</h1>
        <p className="text-muted-foreground">
          Complete overview of all pages and their access restrictions
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableCaption>A comprehensive list of all pages in the application</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Page Name</TableHead>
              <TableHead className="w-[250px]">Route</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Access Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.route}>
                <TableCell className="font-medium">{page.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {page.route}
                </TableCell>
                <TableCell>{page.description}</TableCell>
                <TableCell>
                  <Badge className={accessLevelColors[page.accessLevel]}>
                    {page.accessLevel}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50">
        <h2 className="text-lg font-semibold mb-3">Access Level Legend</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <Badge className={accessLevelColors.Public}>Public</Badge>
            <span className="text-sm text-muted-foreground">Anyone can access</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={accessLevelColors["Guest Allowed"]}>Guest Allowed</Badge>
            <span className="text-sm text-muted-foreground">Guests can use</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={accessLevelColors.Authenticated}>Authenticated</Badge>
            <span className="text-sm text-muted-foreground">Login required</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={accessLevelColors.Guardian}>Guardian</Badge>
            <span className="text-sm text-muted-foreground">Parent/teacher only</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={accessLevelColors.Admin}>Admin</Badge>
            <span className="text-sm text-muted-foreground">Admin only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
