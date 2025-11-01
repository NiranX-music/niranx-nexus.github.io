import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { XPProvider } from "./contexts/XPContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <XPProvider>
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
                  <Route path="/niranx/*" element={
                  <AppLayout>
                    <Routes>
                      <Route index element={<Index />} />
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/messages/:chatId" element={<ChatRoom />} />
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/pomodoro" element={<PomodoroPage />} />
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
                      <Route path="/search" element={<GlobalSearch />} />
                      <Route path="/video-share" element={<VideoShare />} />
                      <Route path="/picture-share" element={<PictureShare />} />
                      <Route path="/stream-sphere" element={<StreamSphere />} />
                      <Route path="/web-search" element={<WebSearch />} />
                      <Route path="/community" element={<Community />} />
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
      </XPProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;