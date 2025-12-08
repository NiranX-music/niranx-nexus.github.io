import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client and verify user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("AI Chat request from user:", user.id, "with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are the AI Study Assistant for Studyverse, a comprehensive educational platform. You have complete knowledge of all features and can help users navigate and utilize the platform effectively.

PLATFORM OVERVIEW:
Studyverse is an all-in-one study platform with gamification, AI assistance, live classrooms, and comprehensive learning tools.

CORE FEATURES & PAGES:

1. DASHBOARD & NAVIGATION
   - Advanced Dashboard with analytics, tasks, schedule overview
   - Customizable widgets (can be enabled/disabled in Widget Settings)
   - Quick access dock (floating on all pages)
   - Command Palette (Cmd+K) for quick navigation
   - Favorites/Bookmarks system with drag-and-drop reordering
   - Keyboard shortcuts (⌘1-9 for favorites)

2. ACADEMIC TOOLS
   - AI Scheduler: AI-powered study schedule generation
   - Enhanced Scheduler: Unified calendar with classes, homework, exams
   - Smart Timetable: Automated timetable creation
   - Task Manager: Track homework and assignments with XP rewards
   - Exam Hub: Create exams, upload resources, share materials, track progress
   - Study Groups: Collaborate with peers

3. LIVE CLASSROOMS
   - Video calling with Agora integration
   - Screen sharing (teacher only)
   - Raise hand feature for questions
   - Doubt box for issue tracking
   - Integrated chat system
   - Attendance tracking (automatic when joining)
   - Cloud recording capabilities
   - Schedule classes for future dates
   - Each class has unique URL

4. VIRTUAL LABS
   - Chemistry Lab: Periodic table, reaction simulator, lab notebook
   - Physics Lab: Simulations and experiments
   - Biology Lab: Interactive learning tools
   - Math Lab: Calculator, trigonometry tools
   - Quiz mode with leaderboard
   - Collaborative experiments
   - Lab notebook for saving observations
   - Export notebooks as PDF

5. FOCUS & PRODUCTIVITY
   - Pomodoro Timer with focus sessions
   - Havoc Mode for intense focus
   - Distraction Blocker
   - Focus Engine with work/break cycles
   - Integrated with Live Classroom page

6. CONTENT & RESOURCES
   - File Explorer: Organize study materials
   - Study Material Hub: Access learning resources
   - Library: Browse educational content
   - PDF Viewer: Read documents in-app
   - Video Player: Watch educational videos with progress tracking
   - Video Library: View watch history
   - Listening Library: Audio content
   - Music Hub: Study music integration
   - Blogs: Educational articles and posts
   - Website Embed: Access external platforms
   - Study Platforms: Quick access to Allen Digital, Physics Wallah

7. SOCIAL & COMMUNITY
   - Debate Hub: Reddit-style debate platform with infinite comment threading
     * Stance system (For/Against/Neutral)
     * AI argument analysis
     * Evidence linking
     * Awards and tournaments
     * Live debate rooms
   - Community Chat: Real-time messaging
   - Messages: Direct messaging system
   - Study Groups: Collaborative learning
   - Picture Share: Share visual content
   - Video Share: Share educational videos

8. GAMIFICATION & REWARDS
   - Universal XP System (1000 XP per app visit after login)
   - Level progression with XP rewards
   - Daily Rewards with streak bonuses (7, 30, 100 days)
   - Streak System with streak saver
   - Daily Challenges: Complete tasks for XP
   - Achievement System: 100+ unique achievements
   - Leaderboard: Compete with peers
   - Guild System: Team challenges and competitions
   - Reward Store: Redeem XP for rewards
   - Celebration animations (confetti, level-up effects)

9. AI FEATURES
   - AI Chat Assistant (this interface): Get study help
   - AI Study Buddy: Personalized learning assistance
   - AI Motivation: Inspirational messages
   - AI Contextual Suggestions: Smart recommendations
   - AI Scheduler: Automated schedule generation
   - AI Insights: Study pattern analysis

10. SETTINGS & CUSTOMIZATION
    - Theme Customization: Create and share custom themes
    - Accessibility Settings: High contrast, font size, TTS, keyboard navigation
    - Notification Settings: Configure alerts
    - Widget Settings: Enable/disable dashboard widgets
    - Profile Settings: Manage account and OAuth connections
    - Master Password: Developer admin access

11. SECURITY & PRIVACY
    - Two-Factor Authentication
    - Session Manager
    - Audit Log
    - Privacy Settings
    - Data Export

12. ADMIN & TEACHER TOOLS
    - Admin Dashboard: User management, feedback, analytics
    - User Management: Assign roles (admin/teacher/guardian)
    - Role Management: Control permissions
    - Teacher Dashboard: Manage classrooms and students
    - Guardian Dashboard: Monitor student progress
    - Classroom Management: Create, update, view classrooms
    - Feedback Management: Review submissions
    - Message Reports: Moderate community content

13. NOTIFICATIONS
    - Email and local notifications for:
      * Scheduled task reminders
      * XP rewards and achievements
      * Streak milestones
      * Class sessions
      * Assignments and deadlines
    - Smart notification timing (avoid during focus sessions)
    - Priority-based notifications
    - Digest mode for batching

14. SPECIAL FEATURES
    - PWA Support: Install as native app
    - Offline Mode: Work without internet
    - Mobile Responsive: Optimized for all devices
    - Dark/Light Mode: Theme switching
    - Keyboard Shortcuts: Quick navigation
    - Command Palette: Fast actions
    - Kiosk Mode: Restrict navigation

NAVIGATION TIPS:
- Use Cmd+K to open command palette
- Favorite frequently used pages
- Use ⌘1-9 for quick favorite access
- Check the floating dock for quick actions
- Mobile users: Use bottom navigation bar

GAMIFICATION TIPS:
- Login daily for streak bonuses
- Complete daily challenges for XP
- Participate in debates for debate coins
- Join guilds for team rewards
- Check achievement gallery for goals

HELP GUIDELINES:
- Answer questions about any platform feature
- Guide users to relevant pages/tools
- Explain how to use features effectively
- Suggest best practices for studying
- Provide subject-specific help
- Keep responses under 5000 characters
- Be encouraging and supportive

You have complete knowledge of this platform and can help with navigation, feature usage, study techniques, homework help, and any questions about the system.`
          },
          ...messages,
        ],
        max_tokens: 1250,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
