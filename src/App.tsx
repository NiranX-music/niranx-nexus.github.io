import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { XPProvider } from "./contexts/XPContext";
import { AppLayout } from "./components/layout/AppLayout";
import ThemeToggle from "./components/ui/ThemeToggle";
import Landing from "./pages/Landing";
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
import StudyPlatforms from "./pages/StudyPlatforms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <XPProvider>
          <TooltipProvider>
            <ThemeToggle />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/niranx/*" element={
                  <AppLayout>
                    <Routes>
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                } />
                <Route path="*" element={<Landing />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </XPProvider>
      </ThemeProvider>
  </QueryClientProvider>
);

export default App;