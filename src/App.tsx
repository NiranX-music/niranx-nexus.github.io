import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/niranx/login" element={<Login />} />
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
                  <Route path="/scheduler" element={<TaskScheduler />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/exams" element={<ExamHub />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            } />
            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
