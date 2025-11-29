import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationListener } from "@/components/NotificationListener";
import { ThemeProvider } from "./contexts/ThemeContext";
import { XPProvider } from "./contexts/XPContext";
import { MoodProvider } from "./contexts/MoodContext";
import { FocusProvider } from "./contexts/FocusContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NowPlayingProvider } from "./contexts/NowPlayingContext";
import { GuestModeProvider } from "./contexts/GuestModeContext";
import { AppLayout } from "./components/layout/AppLayout";
import VoiceCommand from "./components/VoiceCommand";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ChatRoom from "./pages/ChatRoom";
import TaskScheduler from "./pages/TaskScheduler";
import Analytics from "./pages/Analytics";
import ExamHub from "./pages/ExamHub";
import TasksPage from "./pages/TasksPage";
import PomodoroPage from "./pages/PomodoroPage";
import SmartTimetable from "./pages/SmartTimetable";
import Library from "./pages/Library";
import MusicPage from "./pages/MusicPage";
import GamesPage from "./pages/GamesPage";
import Allen from "./pages/Allen";
import PW from "./pages/PW";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WebsiteEmbed from "./pages/WebsiteEmbed";
import EnhancedScheduler from "./pages/EnhancedScheduler";
import InfiniteChainManager from "./pages/InfiniteChainManager";
import FileHub from "./pages/FileHub";
import MusicHub from "./pages/MusicHub";
import Upload from "./pages/Upload";
import PDFViewer from "./pages/PDFViewer";
import VideoPlayer from "./pages/VideoPlayer";
import StudyPlatforms from "./pages/StudyPlatforms";
import WebsiteManager from "./pages/WebsiteManager";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import GlobalSearch from "./pages/GlobalSearch";
import AIChat from "./pages/AIChat";
import AIChatHistory from "./pages/AIChatHistory";
import AIScheduler from "./pages/AIScheduler";
import Notifications from "./pages/Notifications";

import VideoShare from "./pages/VideoShare";
import VideoLibrary from "./pages/VideoLibrary";
import PictureShare from "./pages/PictureShare";
import StreamSphere from "./pages/StreamSphere";
import WebSearch from "./pages/WebSearch";
import Community from "./pages/Community";
import BlogSettings from "./pages/settings/BlogSettings";
import FocusEngine from "./pages/FocusEngine";
import MyCloudDrives from "./pages/MyCloudDrives";
import MyCloudFolder from "./pages/MyCloudFolder";
import ResetPassword from "./pages/ResetPassword";
import MagicLink from "./pages/MagicLink";
import ConfirmSignup from "./pages/ConfirmSignup";
import InviteUser from "./pages/InviteUser";
import Reauthentication from "./pages/Reauthentication";

import ManageDrives from "./pages/ManageDrives";
import PWADownload from "./pages/PWADownload";
import TWASetup from "./pages/TWASetup";
import TwoFactorAuth from "./pages/security/TwoFactorAuth";
import SessionManager from "./pages/security/SessionManager";
import PrivacySettings from "./pages/security/PrivacySettings";
import DataExport from "./pages/security/DataExport";
import AuditLog from "./pages/security/AuditLog";
import Whiteboard from "./pages/Whiteboard";
import StudyGroups from "./pages/StudyGroups";
import DailyChallenges from "./pages/DailyChallenges";
import Goals from "./pages/Goals";
import Leaderboard from "./pages/Leaderboard";
import RewardStore from "./pages/RewardStore";
import ListeningLibrary from "./pages/ListeningLibrary";
import Sitemap from "./pages/Sitemap";
import KioskMode from "./pages/KioskMode";
import FeatureSuggestions from "./pages/FeatureSuggestions";
import DistractionBlocker from "./pages/DistractionBlocker";
import AdvancedDashboard from "./pages/AdvancedDashboard";
import StudyStreakChallenges from "./pages/StudyStreakChallenges";
import SharedResource from "./pages/SharedResource";
import OldPageArchive from "./pages/OldPageArchive";
import NotificationSettings from "./pages/NotificationSettings";
import BecomeAdmin from "./pages/BecomeAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequestAnalytics from "./pages/AdminRequestAnalytics";
import AdminMessageReports from "./pages/AdminMessageReports";
import OAuthSettings from "./pages/OAuthSettings";
import ClassScheduler from "./pages/ClassScheduler";
import Labs from "./pages/Labs";
import Chemistry from "./pages/labs/Chemistry";
import Biology from "./pages/labs/Biology";
import Physics from "./pages/labs/Physics";
import Math from "./pages/labs/Math";
import GuardianDashboard from "./pages/GuardianDashboard";
import StudentGuardianSettings from "./pages/StudentGuardianSettings";
import { AdminRoute } from "./components/AdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ModeratorRoute } from "./components/ModeratorRoute";
import { AccessibilitySettings } from "./pages/AccessibilitySettings";
import LiveClassroom from "@/pages/LiveClassroom";
import Guide from "./pages/Guide";
import DailyRewards from "./pages/DailyRewards";
import ThemeCustomization from "./pages/ThemeCustomization";
import Guilds from "./pages/Guilds";
import WidgetSettings from "./pages/WidgetSettings";
import SmartNotifications from "./pages/SmartNotifications";
import DebateHub from "./pages/debates/DebateHub";
import DebateDetail from "./pages/debates/DebateDetail";
import MyDebates from "./pages/debates/MyDebates";
import DebateBookmarks from "./pages/debates/Bookmarks";
import DebateCategories from "./pages/debates/Categories";
import DebateLeaderboard from "./pages/debates/Leaderboard";
import DebateTournaments from "./pages/debates/Tournaments";
import LiveDebateRooms from "./pages/debates/LiveRooms";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ClassroomDetail from "./pages/teacher/ClassroomDetail";
import JoinClassroom from "./pages/teacher/JoinClassroom";
import RoleManagement from "./pages/admin/RoleManagement";
import FeedbackSubmission from "./pages/FeedbackSubmission";
import FeedbackList from "./pages/admin/FeedbackList";
import ManageUserControls from "./pages/ManageUserControls";
import LiveClassSession from "./pages/teacher/LiveClassSession";
import AIWebsiteGenerator from "./pages/AIWebsiteGenerator";
import GeneratedWebsite from "./pages/GeneratedWebsite";
import PublishedWebsite from "./pages/PublishedWebsite";
import StudyPathGenerator from "./pages/StudyPathGenerator";
import NoteSummarizer from "./pages/NoteSummarizer";
import YouTubeLibrary from "./pages/YouTubeLibrary";
import AICorner from "./pages/AICorner";
import AISongGenerator from "./pages/AISongGenerator";
import AIPresentationGenerator from "./pages/AIPresentationGenerator";
import AIImageGenerator from "./pages/AIImageGenerator";
import AILibrary from "./pages/AILibrary";
import OpenRouterChat from "./pages/OpenRouterChat";
import Weather from "./pages/Weather";
import PDFSummarizer from "./pages/PDFSummarizer";
import AITopicMapGenerator from "./pages/AITopicMapGenerator";
import AISolver from "./pages/AISolver";
import GroqChat from "./pages/GroqChat";
import { TeacherRoute } from "./components/TeacherRoute";
import PublishedContent from "./pages/PublishedContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <GuestModeProvider>
        <XPProvider>
          <MoodProvider>
            <FocusProvider>
              <NowPlayingProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AuthProvider>
                      <NotificationListener />
                      <Routes>
                        <Route path="/" element={<Landing />} />
                      <Route path="/niranx/auth" element={<Auth />} />
                      <Route path="/niranx/reset-password" element={<ResetPassword />} />
                      <Route path="/niranx/magic-link" element={<MagicLink />} />
                      <Route path="/niranx/confirm-signup" element={<ConfirmSignup />} />
                      <Route path="/niranx/invite-user" element={<InviteUser />} />
                      <Route path="/niranx/reauthentication" element={<Reauthentication />} />
                      <Route path="/niranx/*" element={
                      <AppLayout>
                        <Routes>
                          <Route index element={<Index />} />
                          <Route path="/dashboard" element={<Index />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/messages" element={<Messages />} />
                          <Route path="/messages/:chatId" element={<ChatRoom />} />
                          <Route path="/chat-room/:chatId" element={<ChatRoom />} />
                          <Route path="/tasks" element={<TasksPage />} />
                          <Route path="/focus-engine" element={<FocusEngine />} />
                          <Route path="/distraction-blocker" element={<DistractionBlocker />} />
                          <Route path="/music" element={<MusicPage />} />
                          <Route path="/games" element={<GamesPage />} />
                          
                          {/* Old Pages Archive */}
                          <Route path="/old-pages" element={<OldPageArchive />} />
                          <Route path="/pomodoro" element={<PomodoroPage />} />
                          <Route path="/timetable" element={<SmartTimetable />} />
                          <Route path="/library" element={<Library />} />
                          
                          <Route path="/scheduler" element={<EnhancedScheduler />} />
                          <Route path="/class-scheduler" element={<ClassScheduler />} />
                          <Route path="/allen" element={<Allen />} />
                          <Route path="/pw" element={<PW />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/accessibility-settings" element={<AccessibilitySettings />} />
                          <Route path="/oauth-settings" element={<OAuthSettings />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/advanced-dashboard" element={<AdvancedDashboard />} />
                          <Route path="/study-streak-challenges" element={<StudyStreakChallenges />} />
                          <Route path="/exams" element={<ExamHub />} />
                          <Route path="/website" element={<WebsiteEmbed />} />
                          <Route path="/website/study-platforms" element={<StudyPlatforms />} />
                          <Route path="/infinite-chain" element={<InfiniteChainManager />} />
                          <Route path="/file-hub" element={<FileHub />} />
                          <Route path="/music-hub" element={<MusicHub />} />
                          <Route path="/upload" element={<Upload />} />
                          <Route path="/pdf-viewer" element={<PDFViewer />} />
                          <Route path="/video-player" element={<VideoPlayer />} />
                          <Route path="/website-manager" element={<WebsiteManager />} />
                          <Route path="/blogs" element={<Blogs />} />
                          <Route path="/blogs/:id" element={<BlogPost />} />
                          <Route path="/blogs/settings" element={<BlogSettings />} />
                          <Route path="/search" element={<GlobalSearch />} />
                          <Route path="/ai-chat" element={<AIChat />} />
                          <Route path="/ai-chat-history" element={<AIChatHistory />} />
                          <Route path="/ai-scheduler" element={<AIScheduler />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/notification-settings" element={<NotificationSettings />} />
                          <Route path="/become-admin" element={<BecomeAdmin />} />
                          <Route path="/video-share" element={<VideoShare />} />
                          <Route path="/video-library" element={<VideoLibrary />} />
                          <Route path="/picture-share" element={<PictureShare />} />
                          <Route path="/stream-sphere" element={<StreamSphere />} />
                          <Route path="/web-search" element={<WebSearch />} />
                          <Route path="/community" element={<Community />} />
                          <Route path="/my-cloud" element={<MyCloudDrives />} />
                          <Route path="/my-cloud/:driveId/*" element={<MyCloudFolder />} />
                          <Route path="/manage-drives" element={<ManageDrives />} />
                          <Route path="/pwa-download" element={<PWADownload />} />
                          <Route path="/twa-setup" element={<TWASetup />} />
                          <Route path="/security/2fa" element={<TwoFactorAuth />} />
                          <Route path="/security/sessions" element={<SessionManager />} />
                          <Route path="/security/privacy" element={<PrivacySettings />} />
                          <Route path="/security/export" element={<DataExport />} />
                          <Route path="/security/audit" element={<AuditLog />} />
                          <Route path="/whiteboard" element={<Whiteboard />} />
                          <Route path="/study-groups" element={<StudyGroups />} />
                          <Route path="/daily-challenges" element={<DailyChallenges />} />
                          <Route path="/goals" element={<Goals />} />
                          <Route path="/leaderboard" element={<Leaderboard />} />
                          <Route path="/reward-store" element={<RewardStore />} />
                          <Route path="/listening-library" element={<ListeningLibrary />} />
                          <Route path="/sitemap" element={<Sitemap />} />
                          <Route path="/kiosk-mode" element={<KioskMode />} />
                          <Route path="/feature-suggestions" element={<FeatureSuggestions />} />
                          <Route path="/feedback" element={<FeedbackSubmission />} />
                          <Route path="/notification-settings" element={<NotificationSettings />} />
                          <Route path="/labs" element={<Labs />} />
                          <Route path="/labs/chemistry" element={<Chemistry />} />
                          <Route path="/labs/biology" element={<Biology />} />
                          <Route path="/labs/physics" element={<Physics />} />
                          <Route path="/labs/math" element={<Math />} />
                          <Route path="/guardian-dashboard" element={<GuardianDashboard />} />
                          <Route path="/guardian-settings" element={<StudentGuardianSettings />} />
                          <Route path="/guide" element={<Guide />} />
                          <Route path="/daily-rewards" element={<DailyRewards />} />
                          <Route path="/theme-customization" element={<ThemeCustomization />} />
                          <Route path="/guilds" element={<Guilds />} />
                          <Route path="/widget-settings" element={<WidgetSettings />} />
                          <Route path="/smart-notifications" element={<SmartNotifications />} />
                          <Route path="/debates" element={<DebateHub />} />
                          <Route path="/debates/:id" element={<DebateDetail />} />
                          <Route path="/debates/mine" element={<MyDebates />} />
                          <Route path="/debates/bookmarks" element={<DebateBookmarks />} />
                          <Route path="/debates/categories" element={<DebateCategories />} />
                          <Route path="/debates/leaderboard" element={<DebateLeaderboard />} />
                          <Route path="/debates/tournaments" element={<DebateTournaments />} />
                          <Route path="/debates/live" element={<LiveDebateRooms />} />
                          <Route path="/ai-website-generator" element={<AIWebsiteGenerator />} />
                          <Route path="/generated-website/:id" element={<GeneratedWebsite />} />
                          <Route path="/study-path-generator" element={<StudyPathGenerator />} />
                          <Route path="/note-summarizer" element={<NoteSummarizer />} />
                          <Route path="/youtube-library" element={<YouTubeLibrary />} />
                          <Route path="/ai-corner" element={<AICorner />} />
                          <Route path="/ai-song-generator" element={<AISongGenerator />} />
                          <Route path="/ai-presentation-generator" element={<AIPresentationGenerator />} />
                          <Route path="/ai-image-generator" element={<AIImageGenerator />} />
                          <Route path="/ai-topic-map-generator" element={<AITopicMapGenerator />} />
                          <Route path="/ai-solver" element={<AISolver />} />
                          <Route path="/pdf-summarizer" element={<PDFSummarizer />} />
                          <Route path="/ai-library" element={<AILibrary />} />
                          <Route path="/openrouter-chat" element={<OpenRouterChat />} />
                          <Route path="/weather" element={<Weather />} />
                          <Route path="/groq-chat" element={<GroqChat />} />
                          <Route path="/admin" element={
                            <AdminRoute>
                              <AdminDashboard />
                            </AdminRoute>
                          } />
                          <Route path="/admin-request-analytics" element={
                            <AdminRoute>
                              <AdminRequestAnalytics />
                            </AdminRoute>
                          } />
                          <Route path="/admin-message-reports" element={
                            <AdminRoute>
                              <AdminMessageReports />
                            </AdminRoute>
                          } />
                          <Route path="/admin/roles" element={
                            <AdminRoute>
                              <RoleManagement />
                            </AdminRoute>
                          } />
                          <Route path="/admin/user-controls" element={
                            <AdminRoute>
                              <ManageUserControls />
                            </AdminRoute>
                          } />
                          <Route path="teacher/dashboard" element={
                            <TeacherRoute>
                              <TeacherDashboard />
                            </TeacherRoute>
                          } />
          <Route path="teacher/classrooms/:id" element={
            <ProtectedRoute>
              <ClassroomDetail />
            </ProtectedRoute>
          } />
          <Route path="classrooms" element={
            <ProtectedRoute>
              <JoinClassroom />
            </ProtectedRoute>
          } />
          <Route path="teacher/live-class/:classId" element={
            <ProtectedRoute>
              <LiveClassSession />
            </ProtectedRoute>
          } />
          <Route path="live-classroom" element={
            <ProtectedRoute>
              <LiveClassroom />
            </ProtectedRoute>
          } />
          <Route path="ai-website-generator" element={
            <ProtectedRoute>
              <AIWebsiteGenerator />
            </ProtectedRoute>
          } />
          <Route path="generated-website/:id" element={
            <ProtectedRoute>
              <GeneratedWebsite />
            </ProtectedRoute>
          } />
                          <Route path="/admin/feedback-list" element={
                            <ModeratorRoute>
                              <FeedbackList />
                            </ModeratorRoute>
                          } />
                          <Route path="*" element={<NotFound />} />
                          </Routes>
                          <VoiceCommand />
                        </AppLayout>
                      } />
                    <Route path="/shared/resource/:token" element={<SharedResource />} />
                    <Route path="/w/:slug" element={<PublishedWebsite />} />
                    <Route path="/published/:slug" element={<PublishedContent />} />
                    <Route path="*" element={<Landing />} />
                    </Routes>
                  </AuthProvider>
                </BrowserRouter>
              </TooltipProvider>
            </NowPlayingProvider>
          </FocusProvider>
        </MoodProvider>
      </XPProvider>
    </GuestModeProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;