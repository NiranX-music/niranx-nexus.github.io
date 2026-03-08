import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationListener } from "@/components/NotificationListener";
import { GlobalRealtimeSync } from "@/components/GlobalRealtimeSync";
import { ThemeProvider } from "./contexts/ThemeContext";
import { XPProvider } from "./contexts/XPContext";
import { MoodProvider } from "./contexts/MoodContext";
import { FocusProvider } from "./contexts/FocusContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NowPlayingProvider } from "./contexts/NowPlayingContext";
import { GuestModeProvider } from "./contexts/GuestModeContext";
import { BeepSoundProvider } from "./contexts/BeepSoundContext";
import { AdminEditProvider } from "./contexts/AdminEditContext";
import { AppLayout } from "./components/layout/AppLayout";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { PageLoadProgress } from "./components/PageLoadProgress";
import { OfflineBanner } from "./components/OfflineBanner";
import { BackToTop } from "./components/BackToTop";
import { PageSkeleton } from "./components/PageSkeleton";
import VoiceCommand from "./components/VoiceCommand";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import UniversalMusicPlayer from "./components/music/UniversalMusicPlayer";
import { AdminRoute } from "./components/AdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ModeratorRoute } from "./components/ModeratorRoute";
import { TeacherRoute } from "./components/TeacherRoute";
import NiranxRedirect from "./components/NiranxRedirect";
import FloatingAIChat from "./components/FloatingAIChat";

// Critical pages loaded eagerly (landing, auth, dashboard)
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// All other pages lazy-loaded for performance
const Nexus = lazy(() => import("./pages/Nexus"));
const Songs = lazy(() => import("./pages/Songs"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const ChatRoom = lazy(() => import("./pages/ChatRoom"));
const TaskScheduler = lazy(() => import("./pages/TaskScheduler"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ExamHub = lazy(() => import("./pages/ExamHub"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const PomodoroPage = lazy(() => import("./pages/PomodoroPage"));
const SmartTimetable = lazy(() => import("./pages/SmartTimetable"));
const Library = lazy(() => import("./pages/Library"));
const MusicPage = lazy(() => import("./pages/MusicPage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
const Allen = lazy(() => import("./pages/Allen"));
const PW = lazy(() => import("./pages/PW"));
const Settings = lazy(() => import("./pages/Settings"));
const WebsiteEmbed = lazy(() => import("./pages/WebsiteEmbed"));
const EnhancedScheduler = lazy(() => import("./pages/EnhancedScheduler"));
const InfiniteChainManager = lazy(() => import("./pages/InfiniteChainManager"));
const FileHub = lazy(() => import("./pages/FileHub"));
const MusicHub = lazy(() => import("./pages/MusicHub"));
const MusicLibrary = lazy(() => import("./pages/MusicLibrary"));
const UploadTrack = lazy(() => import("./pages/UploadTrack"));
const TrackDetail = lazy(() => import("./pages/TrackDetail"));
const EditTrack = lazy(() => import("./pages/EditTrack"));
const CreateArtist = lazy(() => import("./pages/CreateArtist"));
const EditArtist = lazy(() => import("./pages/EditArtist"));
const ArtistPage = lazy(() => import("./pages/ArtistPage"));
const ExploreArtists = lazy(() => import("./pages/ExploreArtists"));
const ArtistStudio = lazy(() => import("./pages/ArtistStudio"));
const CreateAlbum = lazy(() => import("./pages/CreateAlbum"));
const AlbumDetail = lazy(() => import("./pages/AlbumDetail"));
const PlaylistPage = lazy(() => import("./pages/PlaylistPage"));
const PlaylistCreate = lazy(() => import("./pages/PlaylistCreate"));
const MusicModeration = lazy(() => import("./pages/admin/MusicModeration"));
const Upload = lazy(() => import("./pages/Upload"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const StudyPlatforms = lazy(() => import("./pages/StudyPlatforms"));
const WebsiteManager = lazy(() => import("./pages/WebsiteManager"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const GlobalSearch = lazy(() => import("./pages/GlobalSearch"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const AIChat = lazy(() => import("./pages/AIChat"));
const AIChatHistory = lazy(() => import("./pages/AIChatHistory"));
const AIScheduler = lazy(() => import("./pages/AIScheduler"));
const Notifications = lazy(() => import("./pages/Notifications"));
const WhatsNewPage = lazy(() => import("./pages/WhatsNewPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const VideoShare = lazy(() => import("./pages/VideoShare"));
const VideoLibrary = lazy(() => import("./pages/VideoLibrary"));
const PictureShare = lazy(() => import("./pages/PictureShare"));
const StreamSphere = lazy(() => import("./pages/StreamSphere"));
const WebSearch = lazy(() => import("./pages/WebSearch"));
const Community = lazy(() => import("./pages/Community"));
const BlogSettings = lazy(() => import("./pages/settings/BlogSettings"));
const FocusEngine = lazy(() => import("./pages/FocusEngine"));
const MyCloudDrives = lazy(() => import("./pages/MyCloudDrives"));
const MyCloudFolder = lazy(() => import("./pages/MyCloudFolder"));
const BackblazeStorage = lazy(() => import("./pages/BackblazeStorage"));
const GoogleDrive = lazy(() => import("./pages/GoogleDrive"));
const GoogleDriveCallback = lazy(() => import("./pages/GoogleDriveCallback"));
const FluxAPIImageGen = lazy(() => import("./pages/FluxAPIImageGen"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MagicLink = lazy(() => import("./pages/MagicLink"));
const ConfirmSignup = lazy(() => import("./pages/ConfirmSignup"));
const InviteUser = lazy(() => import("./pages/InviteUser"));
const Reauthentication = lazy(() => import("./pages/Reauthentication"));
const ManageDrives = lazy(() => import("./pages/ManageDrives"));
const PWADownload = lazy(() => import("./pages/PWADownload"));
const TWASetup = lazy(() => import("./pages/TWASetup"));
const TwoFactorAuth = lazy(() => import("./pages/security/TwoFactorAuth"));
const SessionManager = lazy(() => import("./pages/security/SessionManager"));
const PrivacySettings = lazy(() => import("./pages/security/PrivacySettings"));
const DataExport = lazy(() => import("./pages/security/DataExport"));
const AuditLog = lazy(() => import("./pages/security/AuditLog"));
const Whiteboard = lazy(() => import("./pages/Whiteboard"));
const StudyGroups = lazy(() => import("./pages/StudyGroups"));
const DailyChallenges = lazy(() => import("./pages/DailyChallenges"));
const Goals = lazy(() => import("./pages/Goals"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const RewardStore = lazy(() => import("./pages/RewardStore"));
const ListeningLibrary = lazy(() => import("./pages/ListeningLibrary"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const KioskMode = lazy(() => import("./pages/KioskMode"));
const FeatureSuggestions = lazy(() => import("./pages/FeatureSuggestions"));
const DistractionBlocker = lazy(() => import("./pages/DistractionBlocker"));
const AdvancedDashboard = lazy(() => import("./pages/AdvancedDashboard"));
const StudyStreakChallenges = lazy(() => import("./pages/StudyStreakChallenges"));
const SharedResource = lazy(() => import("./pages/SharedResource"));
const OldPageArchive = lazy(() => import("./pages/OldPageArchive"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const BecomeAdmin = lazy(() => import("./pages/BecomeAdmin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const WhatsNewManager = lazy(() => import("./pages/admin/WhatsNewManager"));
const CustomNotificationsManager = lazy(() => import("./pages/admin/CustomNotificationsManager"));
const AdminRequestAnalytics = lazy(() => import("./pages/AdminRequestAnalytics"));
const AdminMessageReports = lazy(() => import("./pages/AdminMessageReports"));
const OAuthSettings = lazy(() => import("./pages/OAuthSettings"));
const ClassScheduler = lazy(() => import("./pages/ClassScheduler"));
const Labs = lazy(() => import("./pages/Labs"));
const Chemistry = lazy(() => import("./pages/labs/Chemistry"));
const Biology = lazy(() => import("./pages/labs/Biology"));
const Physics = lazy(() => import("./pages/labs/Physics"));
const Math = lazy(() => import("./pages/labs/Math"));
const GuardianDashboard = lazy(() => import("./pages/GuardianDashboard"));
const StudentGuardianSettings = lazy(() => import("./pages/StudentGuardianSettings"));
const AccessibilitySettings = lazy(() => import("./pages/AccessibilitySettings").then(m => ({ default: m.AccessibilitySettings })));
const LiveClassroom = lazy(() => import("./pages/LiveClassroom"));
const Guide = lazy(() => import("./pages/Guide"));
const DailyRewards = lazy(() => import("./pages/DailyRewards"));
const ThemeCustomization = lazy(() => import("./pages/ThemeCustomization"));
const Guilds = lazy(() => import("./pages/Guilds"));
const WidgetSettings = lazy(() => import("./pages/WidgetSettings"));
const SmartNotifications = lazy(() => import("./pages/SmartNotifications"));
const DebateHub = lazy(() => import("./pages/debates/DebateHub"));
const DebateDetail = lazy(() => import("./pages/debates/DebateDetail"));
const MyDebates = lazy(() => import("./pages/debates/MyDebates"));
const DebateBookmarks = lazy(() => import("./pages/debates/Bookmarks"));
const DebateCategories = lazy(() => import("./pages/debates/Categories"));
const DebateLeaderboard = lazy(() => import("./pages/debates/Leaderboard"));
const DebateTournaments = lazy(() => import("./pages/debates/Tournaments"));
const LiveDebateRooms = lazy(() => import("./pages/debates/LiveRooms"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const ClassroomDetail = lazy(() => import("./pages/teacher/ClassroomDetail"));
const JoinClassroom = lazy(() => import("./pages/teacher/JoinClassroom"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const FeedbackSubmission = lazy(() => import("./pages/FeedbackSubmission"));
const FeedbackList = lazy(() => import("./pages/admin/FeedbackList"));
const ManageUserControls = lazy(() => import("./pages/ManageUserControls"));
const LiveClassSession = lazy(() => import("./pages/teacher/LiveClassSession"));
const AIWebsiteGenerator = lazy(() => import("./pages/AIWebsiteGenerator"));
const GeneratedWebsite = lazy(() => import("./pages/GeneratedWebsite"));
const PublishedWebsite = lazy(() => import("./pages/PublishedWebsite"));
const StudyPathGenerator = lazy(() => import("./pages/StudyPathGenerator"));
const NoteSummarizer = lazy(() => import("./pages/NoteSummarizer"));
const YouTubeLibrary = lazy(() => import("./pages/YouTubeLibrary"));
const AICorner = lazy(() => import("./pages/AICorner"));
const Xvibing = lazy(() => import("./pages/Xvibing"));
const AISongGenerator = lazy(() => import("./pages/AISongGenerator"));
const AIPresentationGenerator = lazy(() => import("./pages/AIPresentationGenerator"));
const AIImageGenerator = lazy(() => import("./pages/AIImageGenerator"));
const AILibrary = lazy(() => import("./pages/AILibrary"));
const OpenRouterChat = lazy(() => import("./pages/OpenRouterChat"));
const Weather = lazy(() => import("./pages/Weather"));
const PDFSummarizer = lazy(() => import("./pages/PDFSummarizer"));
const PDFViewer = lazy(() => import("./pages/PDFViewer"));
const AITopicMapGenerator = lazy(() => import("./pages/AITopicMapGenerator"));
const AISolver = lazy(() => import("./pages/AISolver"));
const GroqChat = lazy(() => import("./pages/GroqChat"));
const GroqChatHistory = lazy(() => import("./pages/GroqChatHistory"));
const DeepSeekChat = lazy(() => import("./pages/DeepSeekChat"));
const LovableImageGen = lazy(() => import("./pages/LovableImageGen"));
const PublishedContent = lazy(() => import("./pages/PublishedContent"));
const ListedSongs = lazy(() => import("./pages/ListedSongs"));
const Mailbox = lazy(() => import("./pages/Mailbox"));
const XmailProfile = lazy(() => import("./pages/XmailProfile"));
const XmailView = lazy(() => import("./pages/XmailView"));
const PersonaSetup = lazy(() => import("./pages/PersonaSetup"));
const StudyTemplates = lazy(() => import("./pages/StudyTemplates"));
const TemplateManager = lazy(() => import("./pages/admin/TemplateManager"));
const ActivityLog = lazy(() => import("./pages/security/ActivityLog"));
const ExploreSpaces = lazy(() => import("./pages/ExploreSpaces"));
const PasswordManager = lazy(() => import("./pages/PasswordManager"));
const AIQuizGenerator = lazy(() => import("./pages/AIQuizGenerator"));
const AIDocSummarizer = lazy(() => import("./pages/AIDocSummarizer"));
const ActivityFeed = lazy(() => import("./pages/ActivityFeed"));
const CommunityForums = lazy(() => import("./pages/CommunityForums"));
const SpaceLimitsManager = lazy(() => import("./pages/admin/SpaceLimitsManager"));
const XFlowLogin = lazy(() => import("./pages/xflow/XFlowLogin"));
const XFlowFeed = lazy(() => import("./pages/xflow/XFlowFeed"));
const XFlowProfile = lazy(() => import("./pages/xflow/XFlowProfile"));
const XFlowMessages = lazy(() => import("./pages/xflow/XFlowMessages"));
const XFlowPostView = lazy(() => import("./pages/xflow/XFlowPostView"));
const XFlowModeration = lazy(() => import("./pages/admin/XFlowModeration"));
const XOrbit = lazy(() => import("./pages/XOrbit"));
const XOrbitCallback = lazy(() => import("./pages/XOrbitCallback"));
const ShareTarget = lazy(() => import("./pages/ShareTarget"));
const FileHandler = lazy(() => import("./pages/FileHandler"));
const ProtocolHandler = lazy(() => import("./pages/ProtocolHandler"));
const LocalServerSaves = lazy(() => import("./pages/LocalServerSaves"));
const RecycleBin = lazy(() => import("./pages/RecycleBin"));
const AdminArtistAccounts = lazy(() => import("./pages/admin/AdminArtistAccounts"));
const FerqX = lazy(() => import("./pages/FerqX"));
const Integrations = lazy(() => import("./pages/Integrations"));
const BytezAI = lazy(() => import("./pages/BytezAI"));
const XNexusAI = lazy(() => import("./pages/XNexusAI"));
const CustomPage = lazy(() => import("./pages/CustomPage"));
const UserAppLibrary = lazy(() => import("./pages/UserAppLibrary"));
const SubmitApp = lazy(() => import("./pages/SubmitApp"));
const WelcomeSetup = lazy(() => import("./pages/WelcomeSetup"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const PersonalAppLibrary = lazy(() => import("./pages/PersonalAppLibrary"));
const XstellarDashboard = lazy(() => import("./pages/xstellar/XstellarDashboard"));
const PublishedPage = lazy(() => import("./pages/PublishedPage"));
const StudyTimerDashboard = lazy(() => import("./pages/StudyTimerDashboard"));
const KnowledgeBaseWiki = lazy(() => import("./pages/KnowledgeBaseWiki"));
const StudyPlannerCalendar = lazy(() => import("./pages/StudyPlannerCalendar"));
const PomodoroStatsDashboard = lazy(() => import("./pages/PomodoroStatsDashboard"));
const FocusModeAmbient = lazy(() => import("./pages/FocusModeAmbient"));
const QuickCheatsheets = lazy(() => import("./pages/QuickCheatsheets"));
const CornellNotes = lazy(() => import("./pages/CornellNotes"));
const StudySessionPlanner = lazy(() => import("./pages/StudySessionPlanner"));
const TypingSpeedTest = lazy(() => import("./pages/TypingSpeedTest"));
const XForge = lazy(() => import("./pages/XForge"));
const XBoard = lazy(() => import("./pages/XBoard"));
const XVault = lazy(() => import("./pages/XVault"));
const XLink = lazy(() => import("./pages/XLink"));
const XPulse = lazy(() => import("./pages/XPulse"));
const XSync = lazy(() => import("./pages/XSync"));
const XRadar = lazy(() => import("./pages/XRadar"));

const AboutUs = lazy(() => import("./pages/support/AboutUs"));
const Careers = lazy(() => import("./pages/support/Careers"));
const Press = lazy(() => import("./pages/support/Press"));
const Documentation = lazy(() => import("./pages/support/Documentation"));
const DocsHub = lazy(() => import("./pages/DocsHub"));
const APIReference = lazy(() => import("./pages/support/APIReference"));
const CookiePolicy = lazy(() => import("./pages/support/CookiePolicy"));
const GDPR = lazy(() => import("./pages/support/GDPR"));

const TestHub = lazy(() => import("./pages/tests/TestHub"));
const TestBuilder = lazy(() => import("./pages/tests/TestBuilder"));
const AITestGenerator = lazy(() => import("./pages/tests/AITestGenerator"));
const TestAttempt = lazy(() => import("./pages/tests/TestAttempt"));
const TestDetail = lazy(() => import("./pages/tests/TestDetail"));
const UploadTest = lazy(() => import("./pages/tests/UploadTest"));
const TestAnalytics = lazy(() => import("./pages/tests/TestAnalytics"));

// Flashcard System
const Flashcards = lazy(() => import("./pages/Flashcards"));
const FlashcardDeck = lazy(() => import("./pages/FlashcardDeck"));
const FlashcardStudy = lazy(() => import("./pages/FlashcardStudy"));
const FlashcardCreate = lazy(() => import("./pages/FlashcardCreate"));
const StudyAnalytics = lazy(() => import("./pages/StudyAnalytics"));

// Phase 2 & 3 Features
const HabitTracker = lazy(() => import("./pages/HabitTracker"));
const SmartBookmarks = lazy(() => import("./pages/SmartBookmarks"));
const CourseGenerator = lazy(() => import("./pages/CourseGenerator"));
const CourseViewer = lazy(() => import("./pages/CourseViewer"));
const StudyRooms = lazy(() => import("./pages/StudyRooms"));
const StudyRoom = lazy(() => import("./pages/StudyRoom"));
const DocumentScanner = lazy(() => import("./pages/DocumentScanner"));
const FocusSounds = lazy(() => import("./pages/FocusSounds"));
const EmailReports = lazy(() => import("./pages/settings/EmailReports"));

// Phase 1: AI Voice & Interactive Learning
const AIVoiceTutor = lazy(() => import("./pages/AIVoiceTutor"));
const LearningStyleAnalyzer = lazy(() => import("./pages/LearningStyleAnalyzer"));
const EssayGrader = lazy(() => import("./pages/EssayGrader"));

// Phase 2: Immersive & Interactive Learning
const VirtualLabs = lazy(() => import("./pages/VirtualLabs"));
const ARFlashcards = lazy(() => import("./pages/ARFlashcards"));
const MindMapBuilder = lazy(() => import("./pages/MindMapBuilder"));

// Phase 3: Smart Document Features
const SmartPDFChat = lazy(() => import("./pages/SmartPDFChat"));
const AIMeetingMinutes = lazy(() => import("./pages/AIMeetingMinutes"));
const AutoStudyPlanner = lazy(() => import("./pages/AutoStudyPlanner"));
const BrowserExtensionSync = lazy(() => import("./pages/BrowserExtensionSync"));

// Phase 4 & 5: Advanced Features
const AIWritingAssistant = lazy(() => import("./pages/AIWritingAssistant"));
const CollaborativeWhiteboard = lazy(() => import("./pages/CollaborativeWhiteboard"));
const IntegrationHub = lazy(() => import("./pages/IntegrationHub"));
const SpacedRepetition = lazy(() => import("./pages/SpacedRepetition"));
const QuickNotes = lazy(() => import("./pages/QuickNotes"));

// Additional Features
const QuizGenerator = lazy(() => import("./pages/QuizGenerator"));
const CitationGenerator = lazy(() => import("./pages/CitationGenerator"));
const ResearchAssistant = lazy(() => import("./pages/ResearchAssistant"));
const CodePlayground = lazy(() => import("./pages/CodePlayground"));
const VocabularyBuilder = lazy(() => import("./pages/VocabularyBuilder"));
const ProgressJournal = lazy(() => import("./pages/ProgressJournal"));
const StudyTimerAnalytics = lazy(() => import("./pages/StudyTimerAnalytics"));
const MathSolver = lazy(() => import("./pages/MathSolver"));
const LectureTranscriber = lazy(() => import("./pages/LectureTranscriber"));
const FlashcardGenerator = lazy(() => import("./pages/FlashcardGenerator"));
const GradeCalculator = lazy(() => import("./pages/GradeCalculator"));
const ReadingTrainer = lazy(() => import("./pages/ReadingTrainer"));
const ExamSimulator = lazy(() => import("./pages/ExamSimulator"));
const ConceptExplainer = lazy(() => import("./pages/ConceptExplainer"));
const ExtensionDownload = lazy(() => import("./pages/ExtensionDownload"));

// Phase 8: Social & Knowledge
const SocialChatDashboard = lazy(() => import("./pages/SocialChatDashboard"));
const StudyDiary = lazy(() => import("./pages/StudyDiary"));
const KnowledgeGraph = lazy(() => import("./pages/KnowledgeGraph"));

// Phase 9-10
const PeerStudyMatching = lazy(() => import("./pages/PeerStudyMatching"));
const StudyAccountabilityPartners = lazy(() => import("./pages/StudyAccountabilityPartners"));
const CollaborativeNotes = lazy(() => import("./pages/CollaborativeNotes"));
const StudyBuddy = lazy(() => import("./pages/StudyBuddy"));
const AdvancedAnalyticsDashboard = lazy(() => import("./pages/AdvancedAnalyticsDashboard"));
const APIConsole = lazy(() => import("./pages/APIConsole"));

const Contact = lazy(() => import("./pages/support/Contact"));
const HelpCentre = lazy(() => import("./pages/support/HelpCentre"));
const PrivacyPolicy = lazy(() => import("./pages/support/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/support/TermsConditions"));

// XVibe Music Platform
const XVibeLanding = lazy(() => import("./xvibe/pages/XVibeLanding"));
const XVibeAuth = lazy(() => import("./xvibe/pages/XVibeAuth"));
const XVibeOnboarding = lazy(() => import("./xvibe/pages/XVibeOnboarding"));
const XVibeHome = lazy(() => import("./xvibe/pages/XVibeHome"));
const XVibeSearch = lazy(() => import("./xvibe/pages/XVibeSearch"));
const XVibeLibrary = lazy(() => import("./xvibe/pages/XVibeLibrary"));
const XVibeArtistPage = lazy(() => import("./xvibe/pages/XVibeArtistPage"));
const XVibeAlbumPage = lazy(() => import("./xvibe/pages/XVibeAlbumPage"));
const XVibePlaylistPage = lazy(() => import("./xvibe/pages/XVibePlaylistPage"));
const XVibeArtistDashboard = lazy(() => import("./xvibe/pages/XVibeArtistDashboard"));
const XVibeUpload = lazy(() => import("./xvibe/pages/XVibeUpload"));
const XVibeArtistRegister = lazy(() => import("./xvibe/pages/XVibeArtistRegister"));
const XVibeModeration = lazy(() => import("./xvibe/pages/XVibeModeration"));
const XVibeReleaseDashboard = lazy(() => import("./xvibe/pages/XVibeReleaseDashboard"));
const XVibeReleaseEditor = lazy(() => import("./xvibe/pages/XVibeReleaseEditor"));
const XVibeAdminDashboard = lazy(() => import("./xvibe/pages/XVibeAdminDashboard"));
const XWaveSongPage = lazy(() => import("./xvibe/pages/XWaveSongPage"));
const XWaveBlogEditor = lazy(() => import("./xvibe/pages/XWaveBlogEditor"));
const XWaveEditorDashboard = lazy(() => import("./xvibe/pages/XWaveEditorDashboard"));
import { XVibeLayout } from "./xvibe/components/layout/XVibeLayout";

// Xstage Music Collaboration Platform
import { XstageLayout } from "./xstage/components/layout/XstageLayout";
const XstageLanding = lazy(() => import("./xstage/pages/XstageLanding").then(m => ({ default: m.XstageLanding })));
const XstageDashboard = lazy(() => import("./xstage/pages/XstageDashboard").then(m => ({ default: m.XstageDashboard })));
const XstageCalendar = lazy(() => import("./xstage/pages/XstageCalendar").then(m => ({ default: m.XstageCalendar })));
const XstageChat = lazy(() => import("./xstage/pages/XstageChat").then(m => ({ default: m.XstageChat })));
const XstageFiles = lazy(() => import("./xstage/pages/XstageFiles").then(m => ({ default: m.XstageFiles })));
const XstageTeam = lazy(() => import("./xstage/pages/XstageTeam").then(m => ({ default: m.XstageTeam })));
const XstageProjectSettings = lazy(() => import("./xstage/pages/XstageProjectSettings").then(m => ({ default: m.XstageProjectSettings })));
const XstagePlaceholders = lazy(() => import("./xstage/pages/XstagePlaceholders").then(m => ({ default: m.XstageSongs })));
const XstageSoundLabLazy = lazy(() => import("./xstage/pages/XstagePlaceholders").then(m => ({ default: m.XstageSoundLab })));
const XstageSettingsLazy = lazy(() => import("./xstage/pages/XstagePlaceholders").then(m => ({ default: m.XstageSettings })));

const queryClient = new QueryClient();

// Suspense wrapper for lazy routes
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

const App = () => (
  <GlobalErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BeepSoundProvider>
      <GuestModeProvider>
        <XPProvider>
          <MoodProvider>
            <FocusProvider>
                <NowPlayingProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <PageLoadProgress />
                    <OfflineBanner />
                    <BackToTop />
                    <MusicPlayerProvider>
                    <AuthProvider>
                      <AdminEditProvider>
                      <NotificationListener />
                      <GlobalRealtimeSync />
                      <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/nexus" element={<Nexus />} />
                        <Route path="/songs" element={<Songs />} />
                        <Route path="/p/:slug" element={<CustomPage />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/welcome-setup" element={<WelcomeSetup />} />
                        <Route path="/user/:username" element={<PublicProfile />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/magic-link" element={<MagicLink />} />
                        <Route path="/confirm-signup" element={<ConfirmSignup />} />
                        <Route path="/invite-user" element={<InviteUser />} />
                        <Route path="/reauthentication" element={<Reauthentication />} />
                        <Route
                          path="/backblaze-storage"
                          element={
                            <AppLayout>
                              <BackblazeStorage />
                            </AppLayout>
                          }
                        />
                        <Route
                          path="/fluxapi-image"
                          element={
                            <AppLayout>
                              <FluxAPIImageGen />
                            </AppLayout>
                          }
                        />
                        <Route
                          path="/deepseek-chat"
                          element={
                            <AppLayout>
                              <DeepSeekChat />
                            </AppLayout>
                          }
                        />
                        <Route
                          path="/lovable-image-gen"
                          element={
                            <AppLayout>
                              <LovableImageGen />
                            </AppLayout>
                          }
                        />
                        <Route
                          path="/*"
                          element={
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
                          <Route path="/google-drive" element={<GoogleDrive />} />
                          <Route path="/google-drive/account/:accountId" element={<GoogleDrive />} />
                          <Route path="/google-drive/callback" element={<GoogleDriveCallback />} />
                          <Route path="xorbit" element={<XOrbit />} />
                          <Route path="xorbit/callback" element={<XOrbitCallback />} />
                          <Route path="/music-hub" element={<MusicHub />} />
                          <Route path="/music/library" element={<MusicLibrary />} />
                          <Route path="/music/upload" element={<UploadTrack />} />
                          <Route path="/music/track/:trackId" element={<TrackDetail />} />
                          <Route path="/music/track/:trackId/edit" element={<EditTrack />} />
                          <Route path="/music/artists" element={<ExploreArtists />} />
                          <Route path="/music/artist/create" element={<CreateArtist />} />
                          <Route path="/music/artist/:artistId" element={<ArtistPage />} />
                          <Route path="/music/artist/:artistId/edit" element={<EditArtist />} />
                          <Route path="/music/artist/:artistId/studio" element={<ArtistStudio />} />
                          <Route path="/music/artist/:artistId/edit" element={<EditArtist />} />
                          <Route path="/music/album/create" element={<CreateAlbum />} />
                          <Route path="/music/album/:albumId" element={<AlbumDetail />} />
                          <Route path="/music/playlist/:playlistId" element={<PlaylistPage />} />
                          <Route path="/music/playlists/create" element={<PlaylistCreate />} />
                          <Route path="/music/listed-songs" element={<ListedSongs />} />
                          <Route path="/upload" element={<Upload />} />
                          <Route path="/pdf-viewer" element={<PDFViewer />} />
                          <Route path="/video-player" element={<VideoPlayer />} />
                          <Route path="/website-manager" element={<WebsiteManager />} />
                          <Route path="/blogs" element={<Blogs />} />
                          <Route path="/blogs/:id" element={<BlogPost />} />
                          <Route path="/blogs/settings" element={<BlogSettings />} />
                          <Route path="/search" element={<GlobalSearch />} />
                          <Route path="/search-results" element={<SearchResults />} />
                          <Route path="/ai-chat" element={<AIChat />} />
                          <Route path="/ai-chat-history" element={<AIChatHistory />} />
                          <Route path="/ai-scheduler" element={<AIScheduler />} />
                          <Route path="/whats-new" element={<WhatsNewPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
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
                          <Route path="backblaze-storage" element={<BackblazeStorage />} />
                          <Route path="/pwa-download" element={<PWADownload />} />
                          <Route path="/extension-download" element={<ExtensionDownload />} />
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
                          <Route path="/persona-setup" element={<PersonaSetup />} />
                          <Route path="/study-templates" element={<StudyTemplates />} />
                          <Route path="/security/activity-log" element={<ActivityLog />} />
                          <Route path="/explore-spaces" element={<ExploreSpaces />} />
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
                          <Route path="/groq-chat-history" element={<GroqChatHistory />} />
                          <Route path="/password-manager" element={<PasswordManager />} />
                          
                          {/* Phase 2: AI Intelligence Layer */}
                          <Route path="/ai-quiz-generator" element={<AIQuizGenerator />} />
                          <Route path="/ai-doc-summarizer" element={<AIDocSummarizer />} />
                          
                          {/* Phase 5: Education & Learning */}
                          <Route path="/study-timer-dashboard" element={<StudyTimerDashboard />} />
                          <Route path="/knowledge-base" element={<KnowledgeBaseWiki />} />
                          <Route path="/study-planner-calendar" element={<StudyPlannerCalendar />} />
                          
                          {/* Phase 6: Productivity & Utilities */}
                          <Route path="/pomodoro-stats" element={<PomodoroStatsDashboard />} />
                          <Route path="/focus-ambient" element={<FocusModeAmbient />} />
                          <Route path="/cheatsheets" element={<QuickCheatsheets />} />
                          
                          {/* Phase 7: Advanced Tools */}
                          <Route path="/cornell-notes" element={<CornellNotes />} />
                          <Route path="/session-planner" element={<StudySessionPlanner />} />
                          <Route path="/typing-test" element={<TypingSpeedTest />} />

                          {/* Phase 4: Social & Communication */}
                          <Route path="/activity-feed" element={<ActivityFeed />} />
                          <Route path="/forums" element={<CommunityForums />} />
                          
                          {/* Flashcard System */}
                          <Route path="/flashcards" element={<Flashcards />} />
                          <Route path="/flashcards/deck/:deckId" element={<FlashcardDeck />} />
                          <Route path="/flashcards/study/:deckId" element={<FlashcardStudy />} />
                          <Route path="/flashcards/create" element={<FlashcardCreate />} />
                          <Route path="/study-analytics" element={<StudyAnalytics />} />
                          
                          {/* Phase 2 & 3 Features */}
                          <Route path="/habit-tracker" element={<HabitTracker />} />
                          <Route path="/smart-bookmarks" element={<SmartBookmarks />} />
                          <Route path="/course-generator" element={<CourseGenerator />} />
                          <Route path="/course/:courseId" element={<CourseViewer />} />
                          <Route path="/study-rooms" element={<StudyRooms />} />
                          <Route path="/study-room/:roomId" element={<StudyRoom />} />
                          <Route path="/document-scanner" element={<DocumentScanner />} />
                          <Route path="/focus-sounds" element={<FocusSounds />} />
                          <Route path="/settings/email-reports" element={<EmailReports />} />
                          
                          {/* Phase 1: AI Voice & Interactive Learning */}
                          <Route path="/ai-voice-tutor" element={<AIVoiceTutor />} />
                          <Route path="/learning-style" element={<LearningStyleAnalyzer />} />
                          <Route path="/essay-grader" element={<EssayGrader />} />
                          
                          {/* Phase 2: Immersive & Interactive Learning */}
                          <Route path="/virtual-labs" element={<VirtualLabs />} />
                          <Route path="/ar-flashcards" element={<ARFlashcards />} />
                          <Route path="/mind-maps" element={<MindMapBuilder />} />
                          
                          {/* Phase 3: Smart Document Features */}
                          <Route path="/smart-pdf-chat" element={<SmartPDFChat />} />
                          <Route path="/ai-meeting-minutes" element={<AIMeetingMinutes />} />
                          <Route path="/auto-study-planner" element={<AutoStudyPlanner />} />
                          <Route path="/browser-extension-sync" element={<BrowserExtensionSync />} />
                          
                          {/* Phase 4 & 5: Advanced Features */}
                          <Route path="/ai-writing-assistant" element={<AIWritingAssistant />} />
                          <Route path="/collaborative-whiteboard" element={<CollaborativeWhiteboard />} />
                          <Route path="/integration-hub" element={<IntegrationHub />} />
                          <Route path="/spaced-repetition" element={<SpacedRepetition />} />
                          <Route path="/quick-notes" element={<QuickNotes />} />
                          
                          {/* Additional Phase 1-4 Features */}
                          <Route path="/quiz-generator" element={<QuizGenerator />} />
                          <Route path="/citation-generator" element={<CitationGenerator />} />
                          <Route path="/research-assistant" element={<ResearchAssistant />} />
                          <Route path="/code-playground" element={<CodePlayground />} />
                          <Route path="/vocabulary-builder" element={<VocabularyBuilder />} />
                          <Route path="/progress-journal" element={<ProgressJournal />} />
                          <Route path="/study-timer" element={<StudyTimerAnalytics />} />
                          <Route path="/math-solver" element={<MathSolver />} />
                          <Route path="/lecture-transcriber" element={<LectureTranscriber />} />
                          <Route path="/flashcard-generator" element={<FlashcardGenerator />} />
                          <Route path="/grade-calculator" element={<GradeCalculator />} />
                          <Route path="/reading-trainer" element={<ReadingTrainer />} />
                          <Route path="/exam-simulator" element={<ExamSimulator />} />
                          <Route path="/concept-explainer" element={<ConceptExplainer />} />
                          
                          <Route path="/ferqx" element={<FerqX />} />
                          <Route path="/integrations" element={<Integrations />} />
                          <Route path="/bytez-ai" element={<BytezAI />} />
                          <Route path="/xvibing" element={<Xvibing />} />
                          <Route path="/xnexus-ai" element={<XNexusAI />} />
                          <Route path="/app-library" element={<UserAppLibrary />} />
                          <Route path="/personal-apps" element={<PersonalAppLibrary />} />
                          <Route path="/submit-app" element={<SubmitApp />} />
                          
                          <Route path="/mailbox" element={<Mailbox />} />
                          <Route path="/xmail" element={<Mailbox />} />
                          <Route path="/xmail/profile/:slug" element={<XmailProfile />} />
                          <Route path="/xmail/view/:slug" element={<XmailView />} />
                          
                          {/* Phase 8 */}
                          <Route path="/social-chat" element={<SocialChatDashboard />} />
                          <Route path="/study-diary" element={<StudyDiary />} />
                          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
                          
                          {/* Phase 9-10: Collaboration & Analytics */}
                          <Route path="/peer-study-matching" element={<PeerStudyMatching />} />
                          <Route path="/accountability-partners" element={<StudyAccountabilityPartners />} />
                          <Route path="/collaborative-notes" element={<CollaborativeNotes />} />
                          <Route path="/study-buddy" element={<StudyBuddy />} />
                          <Route path="/advanced-analytics" element={<AdvancedAnalyticsDashboard />} />
                          <Route path="/api-console" element={<APIConsole />} />
                          <Route path="/xforge" element={<XForge />} />
                          <Route path="/xboard" element={<XBoard />} />
                          <Route path="/xvault" element={<XVault />} />
                          <Route path="/xlink" element={<XLink />} />
                          <Route path="/xpulse" element={<XPulse />} />
                          <Route path="/xsync" element={<XSync />} />
                          <Route path="/xradar" element={<XRadar />} />
                          
                          {/* Support Pages */}
                          <Route path="/about" element={<AboutUs />} />
                          <Route path="/careers" element={<Careers />} />
                          <Route path="/press" element={<Press />} />
                          <Route path="/docs" element={<DocsHub />} />
                          <Route path="/api" element={<APIReference />} />
                          <Route path="/cookies" element={<CookiePolicy />} />
                          <Route path="/gdpr" element={<GDPR />} />
                          
                          {/* XFlow Social Platform */}
                          <Route path="/xflow" element={<XFlowLogin />} />
                          <Route path="/xflow/feed" element={<XFlowFeed />} />
                          <Route path="/xflow/profile/:username" element={<XFlowProfile />} />
                          <Route path="/xflow/messages" element={<XFlowMessages />} />
                          <Route path="/xflow/post/:postId" element={<XFlowPostView />} />
                          
                          {/* Test Platform */}
                          <Route path="/tests" element={<TestHub />} />
                          <Route path="/tests/create" element={<TestBuilder />} />
                          <Route path="/tests/ai-generate" element={<AITestGenerator />} />
                          <Route path="/tests/upload" element={<UploadTest />} />
                          <Route path="/tests/:testId" element={<TestDetail />} />
                          <Route path="/tests/:testId/attempt/:attemptId" element={<TestAttempt />} />
                          <Route path="/tests/:testId/results" element={<TestAnalytics />} />
                          <Route path="/tests/analytics" element={<TestAnalytics />} />
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
                          <Route path="/admin/whats-new" element={
                            <AdminRoute>
                              <WhatsNewManager />
                            </AdminRoute>
                          } />
                          <Route path="/admin/templates" element={
                            <AdminRoute>
                              <TemplateManager />
                            </AdminRoute>
                          } />
                          <Route path="/admin/custom-notifications" element={
                            <AdminRoute>
                              <CustomNotificationsManager />
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
                          <Route path="/admin/space-limits" element={
                            <AdminRoute>
                              <SpaceLimitsManager />
                            </AdminRoute>
                          } />
                          <Route path="/admin/music-moderation" element={
                            <AdminRoute>
                              <MusicModeration />
                            </AdminRoute>
                          } />
                          <Route path="/admin/xflow-moderation" element={
                            <AdminRoute>
                              <XFlowModeration />
                            </AdminRoute>
                          } />
                          <Route path="/admin/artist-accounts" element={
                            <AdminRoute>
                              <AdminArtistAccounts />
                            </AdminRoute>
                          } />
                          <Route path="/stellar" element={
                            <AdminRoute>
                              <XstellarDashboard />
                            </AdminRoute>
                          } />
                          <Route path="local-server-saves" element={
                            <ProtectedRoute>
                              <LocalServerSaves />
                            </ProtectedRoute>
                          } />
                          <Route path="recycle-bin" element={
                            <ProtectedRoute>
                              <RecycleBin />
                            </ProtectedRoute>
                          } />
                          <Route path="share-target" element={<ShareTarget />} />
                          <Route path="file-handler" element={<FileHandler />} />
                          <Route path="protocol-handler" element={<ProtocolHandler />} />
                          <Route path="/x/:slug" element={<PublishedPage />} />
                          <Route path="/xstellar" element={<Navigate to="/stellar" replace />} />
                          <Route path="*" element={<NotFound />} />
                          </Routes>
                          <VoiceCommand />
                        </AppLayout>
                      } />
                    
                    {/* XVibe Music Platform Routes */}
                    <Route path="/xvibe" element={<XVibeLayout><XVibeLanding /></XVibeLayout>} />
                    <Route path="/xvibe/auth" element={<XVibeLayout><XVibeAuth /></XVibeLayout>} />
                    <Route path="/xvibe/onboarding" element={<XVibeLayout><XVibeOnboarding /></XVibeLayout>} />
                    <Route path="/xvibe/home" element={<XVibeLayout><XVibeHome /></XVibeLayout>} />
                    <Route path="/xvibe/search" element={<XVibeLayout><XVibeSearch /></XVibeLayout>} />
                    <Route path="/xvibe/library" element={<XVibeLayout><XVibeLibrary /></XVibeLayout>} />
                    <Route path="/xvibe/artist/:artistId" element={<XVibeLayout><XVibeArtistPage /></XVibeLayout>} />
                    <Route path="/xvibe/album/:albumId" element={<XVibeLayout><XVibeAlbumPage /></XVibeLayout>} />
                    <Route path="/xvibe/playlist/:playlistId" element={<XVibeLayout><XVibePlaylistPage /></XVibeLayout>} />
                    <Route path="/xvibe/artist-dashboard" element={<XVibeLayout><XVibeArtistDashboard /></XVibeLayout>} />
                    <Route path="/xvibe/upload" element={<XVibeLayout><XVibeUpload /></XVibeLayout>} />
                    <Route path="/xvibe/artist-register" element={<XVibeLayout><XVibeArtistRegister /></XVibeLayout>} />
                    <Route path="/xvibe/moderation" element={<XVibeLayout><XVibeModeration /></XVibeLayout>} />
                    <Route path="/xvibe/releases" element={<XVibeLayout><XVibeReleaseDashboard /></XVibeLayout>} />
                    <Route path="/xvibe/releases/:releaseId" element={<XVibeLayout><XVibeReleaseEditor /></XVibeLayout>} />
                    <Route path="/xvibe/admin" element={<XVibeLayout><XVibeAdminDashboard /></XVibeLayout>} />
                    <Route path="/xvibe/song/:songId" element={<XVibeLayout><XWaveSongPage /></XVibeLayout>} />
                    <Route path="/xvibe/blog/new" element={<XVibeLayout><XWaveBlogEditor /></XVibeLayout>} />
                    <Route path="/xvibe/blog/:blogId" element={<XVibeLayout><XWaveBlogEditor /></XVibeLayout>} />
                    <Route path="/xvibe/editor" element={<XVibeLayout><XWaveEditorDashboard /></XVibeLayout>} />
                    
                    {/* Xstage Music Collaboration Platform Routes */}
                    <Route path="/xstage" element={<XstageLanding />} />
                    <Route path="/xstage/*" element={<XstageLayout />}>
                      <Route path="app" element={<XstageDashboard />} />
                      <Route path="app/calendar" element={<XstageCalendar />} />
                      <Route path="app/chat" element={<XstageChat />} />
                      <Route path="app/files" element={<XstageFiles />} />
                      <Route path="app/songs" element={<XstagePlaceholders />} />
                      <Route path="app/soundlab" element={<XstageSoundLabLazy />} />
                      <Route path="app/team" element={<XstageTeam />} />
                      <Route path="app/settings" element={<XstageSettingsLazy />} />
                      <Route path="app/project-settings" element={<XstageProjectSettings />} />
                    </Route>
                    
                    {/* Support Pages */}
                    <Route path="/support/contact" element={<Contact />} />
                    <Route path="/support/help" element={<HelpCentre />} />
                    <Route path="/support/privacy" element={<PrivacyPolicy />} />
                    <Route path="/support/terms" element={<TermsConditions />} />
                    
                    <Route path="/shared/resource/:token" element={<SharedResource />} />
                    <Route path="/w/:slug" element={<PublishedWebsite />} />
                    <Route path="/published/:slug" element={<PublishedContent />} />
                    
                    {/* Dual routing: /niranx/* redirects to /* */}
                    <Route path="/niranx/*" element={<NiranxRedirect />} />
                    
                    <Route path="*" element={<Landing />} />
                    </Routes>
                    </Suspense>
                    <FloatingAIChat />
                  </AdminEditProvider>
                  </AuthProvider>
                  <UniversalMusicPlayer />
                  </MusicPlayerProvider>
                </BrowserRouter>
                </TooltipProvider>
              </NowPlayingProvider>
          </FocusProvider>
        </MoodProvider>
      </XPProvider>
    </GuestModeProvider>
    </BeepSoundProvider>
  </ThemeProvider>
</QueryClientProvider>
</GlobalErrorBoundary>
);

export default App;
