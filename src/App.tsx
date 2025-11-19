import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { XPProvider } from "./contexts/XPContext";
import { MoodProvider } from "./contexts/MoodContext";
import { FocusProvider } from "./contexts/FocusContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NowPlayingProvider } from "./contexts/NowPlayingContext";
import { AppLayout } from "./components/layout/AppLayout";
import ThemeToggle from "./components/ui/ThemeToggle";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ChatRoom from "./pages/ChatRoom";
import SmartTimetable from "./pages/SmartTimetable";
import TaskScheduler from "./pages/TaskScheduler";
import Analytics from "./pages/Analytics";
import ExamHub from "./pages/ExamHub";
import TasksPage from "./pages/TasksPage";
import PomodoroPage from "./pages/PomodoroPage";
import MusicPage from "./pages/MusicPage";
import GamesPage from "./pages/GamesPage";
import Library from "./pages/Library";
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

import VideoShare from "./pages/VideoShare";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <XPProvider>
        <MoodProvider>
          <FocusProvider>
            <NowPlayingProvider>
              <TooltipProvider>
                <ThemeToggle />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AuthProvider>
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
                          <Route path="/pomodoro" element={<PomodoroPage />} />
                          <Route path="/focus-engine" element={<FocusEngine />} />
                          <Route path="/music" element={<MusicPage />} />
                          <Route path="/games" element={<GamesPage />} />
                          <Route path="/timetable" element={<SmartTimetable />} />
                          <Route path="/scheduler" element={<EnhancedScheduler />} />
                          <Route path="/library" element={<Library />} />
                          <Route path="/allen" element={<Allen />} />
                          <Route path="/pw" element={<PW />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/analytics" element={<Analytics />} />
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
                          <Route path="/video-share" element={<VideoShare />} />
                          <Route path="/picture-share" element={<PictureShare />} />
                          <Route path="/stream-sphere" element={<StreamSphere />} />
                          <Route path="/web-search" element={<WebSearch />} />
                          <Route path="/community" element={<Community />} />
                          <Route path="/my-cloud" element={<MyCloudDrives />} />
                          <Route path="/my-cloud/:driveId/*" element={<MyCloudFolder />} />
                          <Route path="/manage-drives" element={<ManageDrives />} />
                          <Route path="/pwa-download" element={<PWADownload />} />
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
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    } />
                      <Route path="*" element={<Landing />} />
                    </Routes>
                  </AuthProvider>
                </BrowserRouter>
              </TooltipProvider>
            </NowPlayingProvider>
          </FocusProvider>
        </MoodProvider>
      </XPProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;