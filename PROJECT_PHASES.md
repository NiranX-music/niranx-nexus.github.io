# NiranX Study Platform - 20 Phase Development Plan

## Phase Overview
This document outlines the complete development roadmap for NiranX Study Platform, broken into 20 incremental phases. Each phase builds upon previous phases and includes detailed frontend, backend, and infrastructure requirements.

---

## Phase 1: Foundation & Authentication
**Timeline**: Week 1-2 | **Complexity**: Medium

### Objective
Establish core infrastructure, authentication system, and basic user management.

### Frontend Work
- [ ] Project setup with Vite + React + TypeScript
- [ ] Tailwind CSS configuration with semantic tokens
- [ ] Design system setup (index.css, tailwind.config.ts)
- [ ] Auth page (Login/Signup forms)
- [ ] Basic routing setup (React Router)
- [ ] AuthContext implementation
- [ ] Protected route component
- [ ] Landing page with feature showcase

### Backend Work
**Database Tables:**
- `profiles` - User profile data (user_id, username, display_name, avatar_url, bio, xp, level)
- `user_roles` - Role assignments (user_id, role: admin/teacher/moderator/guardian)
- `audit_log` - Security audit trail (user_id, action, details, ip_address, user_agent)

**RLS Policies:**
- `profiles`: Users can view all profiles, update own profile
- `user_roles`: Read-only for users, admin can manage
- `audit_log`: Insert-only for system, admin can read

**Edge Functions:**
- None (using Supabase Auth directly)

**Storage Buckets:**
- `avatars` (public) - Profile pictures

### Other Components
- OAuth setup (Google, Spotify providers)
- Email templates for auth
- Session management logic
- Auto-confirm email configuration

### Key Deliverables
✓ Users can sign up/login with email/password  
✓ OAuth integration working (Google, Spotify)  
✓ Profile creation on signup  
✓ Role-based access control foundation  
✓ Audit logging for security

---

## Phase 2: Dashboard & Navigation
**Timeline**: Week 2-3 | **Complexity**: Medium

### Objective
Build core navigation structure, dashboard, and theming system.

### Frontend Work
- [ ] AppLayout component with sidebar
- [ ] AppSidebar with collapsible sections
- [ ] Dashboard page with widget grid
- [ ] Mobile bottom navigation (MacDock)
- [ ] ThemeContext implementation
- [ ] Theme toggle (light/dark mode)
- [ ] User profile page
- [ ] Settings page structure
- [ ] Command Palette (⌘K)

### Backend Work
**Database Tables:**
- `recent_pages` - Track visited pages (user_id, page_url, page_title, visited_at, visit_count)
- `workspaces` - Save workspace states (user_id, name, description, icon, favorites, is_active)
- `custom_themes` - User themes (user_id, theme_name, colors, is_public, share_token)
- `page_theme_overrides` - Per-page themes (user_id, page_path, theme_id)

**RLS Policies:**
- All tables: Users can CRUD their own data only

### Other Components
- Keyboard shortcuts handler (useKeyboardShortcuts hook)
- Recent pages tracking
- Workspace switching logic
- Responsive design for mobile/tablet

### Key Deliverables
✓ Fully functional sidebar navigation  
✓ Responsive mobile dock  
✓ Dashboard with quick stats  
✓ Command palette for quick actions  
✓ Theme customization working  
✓ User profile management

---

## Phase 3: XP & Gamification Core
**Timeline**: Week 3-4 | **Complexity**: Medium

### Objective
Implement universal XP system, leveling, and basic gamification.

### Frontend Work
- [ ] XPContext implementation
- [ ] XP display widget
- [ ] Level progress bar
- [ ] Celebration animations (confetti, particles)
- [ ] Achievement notification toasts
- [ ] Leaderboard page (basic)
- [ ] Profile XP showcase

### Backend Work
**Database Tables:**
- `user_currency` - Coins and XP tracking (user_id, coins, total_xp, created_at)
- `achievements` - Achievement definitions (name, description, icon, category, rarity, reward_xp, reward_currency, requirement_value)
- `user_achievements` - Unlocked achievements (user_id, achievement_id, unlocked_at, progress)
- `leaderboard_entries` - Cached leaderboard (user_id, leaderboard_type, period_start, period_end, score, rank)

**RLS Policies:**
- `user_currency`: Users can read own, system can update
- `achievements`: Public read, admin can manage
- `user_achievements`: Users can read own, system can insert
- `leaderboard_entries`: Public read, system can manage

**Database Functions:**
- `calculate_level(xp_amount)` - XP to level conversion
- `update_leaderboard_entries(start_date, end_date)` - Refresh leaderboards

### Other Components
- XP calculation logic for various actions
- Level-up detection and rewards
- Leaderboard refresh cron job
- Achievement unlock trigger system

### Key Deliverables
✓ Universal XP system working across app  
✓ Level progression with visual feedback  
✓ Achievement system functional  
✓ Real-time leaderboards  
✓ Celebration animations on milestones

---

## Phase 4: Task Management
**Timeline**: Week 4-5 | **Complexity**: Medium

### Objective
Build comprehensive task management system with gamification.

### Frontend Work
- [ ] Tasks page with list/grid views
- [ ] Task creation dialog
- [ ] Task filters (subject, priority, status)
- [ ] Task editing and deletion
- [ ] Drag-and-drop reordering
- [ ] Task completion celebration
- [ ] Recurring task setup
- [ ] Task dependency visualization

### Backend Work
**Database Tables:**
- `tasks` - Task entries (user_id, title, description, subject, priority, due_date, completed, completed_at, recurring, parent_task_id, order_index)

**RLS Policies:**
- `tasks`: Users can CRUD their own tasks

**Triggers:**
- Award XP on task completion (10-50 XP based on priority)
- Update user_achievements for task milestones

### Other Components
- Task sorting and filtering logic
- Recurring task generation
- Overdue task notifications
- Integration with calendar (Phase 6)

### Key Deliverables
✓ Full task CRUD functionality  
✓ Task organization and filtering  
✓ Recurring tasks working  
✓ XP rewards on completion  
✓ Task dependency chains

---

## Phase 5: Focus Engine (Pomodoro)
**Timeline**: Week 5-6 | **Complexity**: Medium

### Objective
Implement Pomodoro timer, focus sessions, and Havoc Mode.

### Frontend Work
- [ ] Focus Engine page
- [ ] Pomodoro timer component
- [ ] Session configuration (work/break durations)
- [ ] Timer controls (start, pause, reset)
- [ ] Session history view
- [ ] Havoc Mode ultra-focus timer
- [ ] Focus stats dashboard
- [ ] Mood selector integration

### Backend Work
**Database Tables:**
- `focus_sessions` - Pomodoro sessions (user_id, duration_minutes, started_at, completed_at, completed, subject, mood, interruptions, session_type, xp_earned)

**RLS Policies:**
- `focus_sessions`: Users can CRUD their own sessions

**Triggers:**
- Award XP on session completion (25 XP per session)
- Update analytics snapshots

### Other Components
- FocusContext for session management
- MoodContext for mood tracking
- Timer notification sounds
- Browser notification integration
- Do Not Disturb mode during sessions

### Key Deliverables
✓ Fully functional Pomodoro timer  
✓ Session tracking and history  
✓ Havoc Mode for intense focus  
✓ Mood tracking per session  
✓ Focus statistics and streaks

---

## Phase 6: Enhanced Scheduler & Calendar
**Timeline**: Week 6-7 | **Complexity**: High

### Objective
Build unified calendar with smart scheduling and conflict detection.

### Frontend Work
- [ ] Enhanced Scheduler page
- [ ] Unified calendar component (week/month views)
- [ ] Event creation dialog
- [ ] Drag-and-drop rescheduling
- [ ] AI conflict detection alerts
- [ ] Workload meter visualization
- [ ] Natural language input parser
- [ ] Recurring event setup
- [ ] Calendar filters and views

### Backend Work
**Database Tables:**
- `schedule_events` - Calendar events (user_id, title, description, event_type, start_time, end_time, subject, priority, recurring_rule, related_task_id, related_exam_id)
- `schedule_conflicts` - Detected conflicts (user_id, event_id_1, event_id_2, conflict_type, resolved)

**RLS Policies:**
- Both tables: Users can CRUD their own data

**Database Functions:**
- `detect_schedule_conflicts(user_id)` - Find overlapping events

### Other Components
- Natural language date parser
- Workload calculation algorithm
- Integration with tasks and exams
- Google Calendar sync (optional)

### Key Deliverables
✓ Visual calendar with week/month views  
✓ Drag-and-drop event management  
✓ Smart conflict detection  
✓ Workload stress meter  
✓ Integration with tasks/exams

---

## Phase 7: Exam Hub & Resource Management
**Timeline**: Week 7-8 | **Complexity**: High

### Objective
Create exam management system with file storage and sharing.

### Frontend Work
- [ ] Exam Hub page
- [ ] Exam creation form
- [ ] Exam detail view with syllabus tracker
- [ ] Progress tracking checkboxes
- [ ] Resource upload component
- [ ] Resource sharing dialog (permissions, password, expiration)
- [ ] Shared resource viewer page
- [ ] Exam calendar view
- [ ] Study plan generator

### Backend Work
**Database Tables:**
- `exams` - Exam entries (user_id, name, subject, exam_date, exam_time, duration, syllabus[], preparation_progress, notes, priority)
- `exam_resources` - Uploaded resources (exam_id, user_id, title, type, file_path, file_size, is_shared, share_token, password_hash, shared_until, permission_level, view_count, download_count, last_accessed_at)

**RLS Policies:**
- `exams`: Users can CRUD their own exams
- `exam_resources`: Users can CRUD their own, others can view if shared

**Storage Buckets:**
- `exam-resources` (private) - Exam files with RLS

**Edge Functions:**
- None (using Supabase Storage directly)

**Triggers:**
- Notify on resource access (view/download tracking)
- Send exam reminders (7, 3, 1 day before)

### Other Components
- File upload with progress
- Share link generation
- Password protection for shares
- Access analytics tracking
- Exam reminder notifications

### Key Deliverables
✓ Complete exam management  
✓ File upload and storage  
✓ Secure resource sharing  
✓ Access analytics  
✓ Exam reminders

---

## Phase 8: AI Integration (Chat & Scheduler)
**Timeline**: Week 8-9 | **Complexity**: High

### Objective
Integrate AI for contextual chat assistance and auto-scheduling.

### Frontend Work
- [ ] AI Chat page with conversation UI
- [ ] Chat history page (archive, search)
- [ ] AI Scheduler page
- [ ] Timetable generation form
- [ ] AI contextual suggestions component (for every page)
- [ ] AI motivation widget
- [ ] Conversation management (create, archive, delete)

### Backend Work
**Database Tables:**
- `ai_conversations` - Chat sessions (user_id, title, subject, is_archived, last_activity)
- `ai_messages` - Messages (conversation_id, role, content, category, rating)

**RLS Policies:**
- Both tables: Users can CRUD their own data

**Edge Functions:**
- `ai-chat` - Proxy to Lovable AI models (Gemini, GPT)
- `secure-ai-chat` - Authenticated AI requests
- `timetable-ai` - Generate study schedules

### Other Components
- AI model selection (Gemini 2.5 Pro/Flash, GPT-5)
- Context injection for page-specific help
- Conversation rating system
- AI suggestion algorithm
- Token usage tracking

### Key Deliverables
✓ AI chat assistant working  
✓ Conversation history management  
✓ AI-generated timetables  
✓ Contextual suggestions on pages  
✓ Multi-model support

---

## Phase 9: Community & Messaging
**Timeline**: Week 9-10 | **Complexity**: High

### Objective
Build real-time chat rooms and direct messaging system.

### Frontend Work
- [ ] Community page with room list
- [ ] Chat room interface
- [ ] Direct messaging page
- [ ] Message composer with file upload
- [ ] Message actions (edit, delete, forward, report)
- [ ] User presence indicators
- [ ] Real-time message updates
- [ ] Message search and filters

### Backend Work
**Database Tables:**
- `chat_rooms` - Room definitions (created_by, name, description, is_group)
- `chat_room_members` - Room participants (room_id, user_id, role, joined_at)
- `messages` - Chat messages (room_id, user_id, content, attachments, reply_to_message_id)
- `message_edits` - Edit history (message_id, previous_content, edited_at)
- `reported_messages` - Flagged content (message_id, reporter_id, reason, status, reviewed_by, reviewed_at)

**RLS Policies:**
- `chat_rooms`: Users can create, read if member
- `chat_room_members`: Members can read, room creator can manage
- `messages`: Members can read, author can edit/delete
- `reported_messages`: Reporter can create, moderators can manage

**Storage Buckets:**
- `chat-files` (private) - Chat attachments

**Database Functions:**
- `is_member_of_chat_room(room_id)` - Check membership

### Other Components
- Supabase Realtime for instant messages
- File upload in chat
- Message editing/deletion tracking
- Report moderation system
- Online/offline presence

### Key Deliverables
✓ Real-time chat rooms  
✓ Direct messaging  
✓ File sharing in chat  
✓ Message moderation  
✓ User presence tracking

---

## Phase 10: Study Groups & Collaboration
**Timeline**: Week 10-11 | **Complexity**: Medium

### Objective
Enable collaborative study features and group resource sharing.

### Frontend Work
- [ ] Study Groups page
- [ ] Group creation dialog
- [ ] Group detail view with members
- [ ] Collaborative notes editor
- [ ] Shared resource library
- [ ] Group chat integration
- [ ] Study session scheduler
- [ ] Member management (invite, remove)

### Backend Work
**Database Tables:**
- `study_groups` - Group definitions (created_by, name, description, subject, is_private, member_limit)
- `study_group_members` - Participants (group_id, user_id, role, joined_at)
- `study_group_resources` - Shared files (group_id, uploaded_by, title, file_path, file_type)
- `study_group_notes` - Collaborative notes (group_id, title, content, last_edited_by, last_edited_at)
- `study_group_sessions` - Scheduled sessions (group_id, scheduled_by, start_time, duration, topic)

**RLS Policies:**
- All tables: Members can read, specific roles can manage

**Storage Buckets:**
- `study-group-files` (private) - Group resources

### Other Components
- Group invitation system
- Collaborative editing (Realtime)
- Session reminders
- Group analytics (participation tracking)

### Key Deliverables
✓ Study group creation and management  
✓ Collaborative note-taking  
✓ Resource pooling  
✓ Group study sessions  
✓ Member coordination

---

## Phase 11: Debate Platform (Core)
**Timeline**: Week 11-13 | **Complexity**: Very High

### Objective
Build Reddit-style debate platform with voting, threading, and stances.

### Frontend Work
- [ ] Debate Hub page with topic list
- [ ] Debate creation modal with rich text editor
- [ ] Debate detail page with infinite comment threading
- [ ] Voting buttons (upvote/downvote)
- [ ] Stance selector (For, Against, Neutral)
- [ ] Comment composer with evidence linker
- [ ] Sorting options (Hot, New, Top, Controversial)
- [ ] User debate profile page
- [ ] Bookmarks page
- [ ] Categories page

### Backend Work
**Database Tables:**
- `debate_categories` - Topic categories (name, description, icon, color, debate_count)
- `debate_topics` - Debates (user_id, category_id, title, description, tags[], upvotes, downvotes, comment_count, view_count, stance_for_count, stance_against_count, stance_neutral_count, hotness_score, controversy_score, is_locked, is_pinned, voting_ends_at, winning_stance)
- `debate_comments` - Responses (debate_id, user_id, parent_comment_id, content, stance, upvotes, downvotes, depth_level, ai_argument_score, has_evidence, is_edited)
- `debate_votes` - Vote records (user_id, target_id, target_type, vote_type)
- `debate_user_stances` - User positions (user_id, debate_id, stance)
- `debate_evidence` - Linked sources (comment_id, source_type, source_url, title, description, credibility_score)
- `debate_subscriptions` - Follow debates (user_id, debate_id, notify_on_comment)
- `debate_bookmarks` - Saved debates (user_id, debate_id)

**RLS Policies:**
- Most tables: Public read, authenticated users can create/vote
- User-specific tables: Users manage their own data

**Database Functions:**
- `calculate_hotness_score()` - Reddit-style hot ranking
- `calculate_controversy_score()` - Balance of votes
- `update_vote_counts()` - Trigger on vote changes
- `update_stance_counts()` - Trigger on stance changes

**Triggers:**
- Update debate stats on comment/vote
- Calculate hotness/controversy scores
- Award XP for participation

### Other Components
- Supabase Realtime for live vote updates
- Rich text editor (markdown support)
- Infinite scroll pagination
- Vote debouncing
- Comment threading algorithm

### Key Deliverables
✓ Full debate creation and browsing  
✓ Infinite comment threading  
✓ Real-time voting  
✓ Stance system  
✓ Evidence linking  
✓ Multiple sorting algorithms

---

## Phase 12: Debate Platform (Advanced)
**Timeline**: Week 13-14 | **Complexity**: High

### Objective
Add AI analysis, awards, tournaments, and moderation to debates.

### Frontend Work
- [ ] AI argument analysis panel (strength, fallacies)
- [ ] Award giving interface
- [ ] Tournaments page
- [ ] Live debate rooms page
- [ ] Leaderboard (debate-specific)
- [ ] Report debate/comment modal
- [ ] Moderator tools (lock, delete, ban)
- [ ] User debate stats widget

### Backend Work
**Database Tables:**
- `debate_awards` - Award types (name, icon, description, cost_coins, xp_value, rarity)
- `debate_awards_given` - Given awards (award_id, given_by, given_to, target_id, target_type)
- `debate_reports` - Flagged content (reporter_id, target_id, target_type, reason, category, status, reviewed_by, reviewed_at)
- `user_debate_stats` - User rankings (user_id, debates_created, comments_posted, total_karma, rank, awards_received)
- `debate_tournaments` - Competition events (name, start_date, end_date, rules, prize_pool, status)
- `tournament_participants` - Entrants (tournament_id, user_id, score, rank)

**RLS Policies:**
- Awards: Public read, users can give if enough coins
- Reports: Reporter can create, moderators can review
- Tournaments: Public read, admin can manage

**Edge Functions:**
- `analyze-argument` - AI argument quality scoring
- `detect-fallacies` - Logical fallacy detection

**Triggers:**
- Award XP when debate awards received
- Update user_debate_stats on activity
- Calculate debate rank based on karma

### Other Components
- AI integration for argument analysis
- Award marketplace (spend coins)
- Tournament scoring system
- Moderation queue for reports
- Rank progression (Novice → Grandmaster)

### Key Deliverables
✓ AI argument quality scoring  
✓ Fallacy detection  
✓ Award system  
✓ Tournaments  
✓ Advanced moderation tools  
✓ Debate ranking system

---

## Phase 13: Teacher Portal (Classrooms)
**Timeline**: Week 14-15 | **Complexity**: High

### Objective
Build teacher dashboard and classroom management system.

### Frontend Work
- [ ] Teacher Dashboard page
- [ ] Create Classroom modal
- [ ] Join Classroom page (for students)
- [ ] Classroom Detail page (tabs: Overview, Live Class, Video Library, Assignments, Grades)
- [ ] Student roster table
- [ ] Announcement creation
- [ ] Video library management
- [ ] Grading rubric builder
- [ ] Class analytics dashboard

### Backend Work
**Database Tables:**
- `classrooms` - Classroom definitions (teacher_id, name, subject, description, grade_level, class_code, academic_year, is_active, max_students, meeting_schedule, syllabus, settings)
- `classroom_members` - Enrollments (classroom_id, student_id, role, enrollment_status, joined_at, attendance_rate, participation_score)
- `classroom_announcements` - Posts (classroom_id, teacher_id, title, content, is_pinned, priority, notify_students, attachments)
- `classroom_videos` - Video library (classroom_id, added_by, video_url, video_title, video_description, order_index)
- `classroom_debates` - Debate assignments (classroom_id, debate_topic_id, assignment_type, due_date, points_possible, rubric_id, instructions, min_word_count, required_evidence_count, peer_review_enabled, is_published)
- `grading_rubrics` - Grading criteria (teacher_id, name, subject, criteria[], total_points, is_template)

**RLS Policies:**
- `classrooms`: Teacher can CRUD own classrooms, students can read joined classrooms
- `classroom_members`: Teacher can manage, students can read
- Teacher role required for creating classrooms

**Database Functions:**
- `generate_class_code()` - Unique 8-char code
- `set_class_code()` - Trigger on classroom insert

**Triggers:**
- Set class code on creation
- Update classroom updated_at timestamp

### Other Components
- Class code generation and validation
- Student enrollment workflow
- Announcement notifications
- YouTube video embedding
- Classroom analytics calculations

### Key Deliverables
✓ Teacher dashboard  
✓ Classroom creation and management  
✓ Student roster and enrollment  
✓ Announcements system  
✓ Video library  
✓ Grading rubrics

---

## Phase 14: Live Classroom (Video Calling)
**Timeline**: Week 15-16 | **Complexity**: Very High

### Objective
Integrate Agora video calling for live classroom sessions.

### Frontend Work
- [ ] Live Class tab in Classroom Detail
- [ ] Video grid component (teacher + students)
- [ ] Video controls (mute, camera, screen share)
- [ ] Raise hand button
- [ ] Doubt box (Q&A tracker)
- [ ] Integrated chat during class
- [ ] Attendance auto-tracking
- [ ] Screen sharing for teachers
- [ ] Speaking permissions management

### Backend Work
**Database Tables:**
- `live_classes` - Session records (classroom_id, started_by, started_at, ended_at, status, participant_count, recording_url)
- `attendance_records` - Auto-tracking (classroom_id, student_id, date, status, recorded_by, auto_detected, notes)
- `live_class_doubts` - Q&A (live_class_id, student_id, question, answered_by, answer, resolved, created_at)
- `raised_hands` - Hand raising (live_class_id, student_id, raised_at, granted_speaking, granted_at)

**RLS Policies:**
- `live_classes`: Teacher can manage, students can read
- `attendance_records`: Teacher can manage, students can read own
- `live_class_doubts`: Students can create, teacher can answer
- `raised_hands`: Students can create, teacher can grant

**Edge Functions:**
- `generate-agora-token` - Video calling authentication

**Secrets:**
- `AGORA_APP_ID` - Agora project ID
- `AGORA_APP_CERTIFICATE` - Agora app certificate

### Other Components
- Agora SDK integration
- Real-time communication via Supabase
- Audio/video device management
- Network quality indicators
- Screen sharing capture
- Hand raise notification
- Doubt box real-time updates

### Key Deliverables
✓ Live video calling  
✓ Screen sharing  
✓ Raise hand system  
✓ Doubt box Q&A  
✓ Integrated chat  
✓ Auto attendance tracking

---

## Phase 15: Guardian Dashboard
**Timeline**: Week 16-17 | **Complexity**: Medium

### Objective
Create parent/guardian monitoring and goal-setting features.

### Frontend Work
- [ ] Guardian Dashboard page
- [ ] Student selector component
- [ ] Student performance widget
- [ ] Weekly summary view
- [ ] Study goals management
- [ ] Access request form
- [ ] Student approval interface (for students)
- [ ] Progress charts and graphs

### Backend Work
**Database Tables:**
- `guardian_access_requests` - Requests (guardian_id, student_email, student_id, relationship_type, status, message)
- `student_guardians` - Approved links (student_id, guardian_id, relationship_type, approved_at)
- `guardian_study_goals` - Goals (guardian_id, student_id, goal_type, target_value, current_value, week_start, week_end, status)

**RLS Policies:**
- `guardian_access_requests`: Guardian can create, student can approve
- `student_guardians`: Both parties can read
- `guardian_study_goals`: Guardian can manage, student can read

**Database Functions:**
- `get_student_weekly_stats(student_id, week_start)` - Aggregate student data
- `update_guardian_updated_at()` - Trigger for timestamp updates

### Other Components
- Email notifications for access requests
- Weekly summary email generation
- Progress calculation algorithms
- Multi-student support for guardians
- Goal tracking and notifications

### Key Deliverables
✓ Guardian access request system  
✓ Student performance monitoring  
✓ Weekly summaries  
✓ Study goal setting  
✓ Multi-student dashboard

---

## Phase 16: Virtual Labs
**Timeline**: Week 17-18 | **Complexity**: High

### Objective
Build interactive science and math lab simulations.

### Frontend Work
- [ ] Labs landing page
- [ ] Chemistry Lab:
  - [ ] Interactive periodic table
  - [ ] Element detail modal
  - [ ] Reaction simulator
  - [ ] Virtual equipment (beakers, test tubes)
- [ ] Physics Lab:
  - [ ] Physics simulations
  - [ ] Experiment tools
- [ ] Biology Lab:
  - [ ] Biology experiments
- [ ] Math Lab:
  - [ ] Scientific calculator (normal + scientific modes)
  - [ ] Trigonometric ratios page
- [ ] Lab Notebook (cross-lab)
- [ ] Lab Quiz system
- [ ] Quiz Leaderboard

### Backend Work
**Database Tables:**
- `collaborative_experiments` - Shared experiments (owner_id, lab_type, experiment_name, description, data, is_public)
- `experiment_collaborators` - Participants (experiment_id, user_id, role, joined_at)
- `lab_notebooks` - Notes (user_id, lab_type, title, content, observations, results, created_at, updated_at)
- `quiz_scores` - Quiz results (user_id, lab_type, quiz_id, score, total_questions, correct_answers, completed_at)

**RLS Policies:**
- `collaborative_experiments`: Owner can manage, collaborators can edit, public can view if is_public
- `lab_notebooks`: Users can CRUD their own
- `quiz_scores`: Users can create, public read for leaderboard

**Edge Functions:**
- `export-notebook-pdf` - Generate PDF lab reports

**Triggers:**
- Award XP for completing quizzes (20 XP)
- Award XP for completing experiments (30 XP)

### Other Components
- Periodic table data JSON
- Chemistry reaction equations database
- Physics simulation engines
- Calculator logic (scientific functions)
- Quiz question database (src/data/quizQuestions.ts)
- PDF generation for lab reports
- Collaborative editing for experiments

### Key Deliverables
✓ Interactive periodic table  
✓ Chemistry reaction simulator  
✓ Virtual lab equipment  
✓ Scientific calculator  
✓ Lab notebook with PDF export  
✓ Quiz system with leaderboard  
✓ Collaborative experiments

---

## Phase 17: Admin Panel & Moderation
**Timeline**: Week 18-19 | **Complexity**: Medium

### Objective
Build comprehensive admin tools for user, content, and platform management.

### Frontend Work
- [ ] Admin Dashboard overview
- [ ] User Management page (role assignment)
- [ ] Feedback List page (spreadsheet view)
- [ ] Admin Request Analytics page
- [ ] Message Reports page (moderation queue)
- [ ] Become Admin page (request form)
- [ ] Role history viewer
- [ ] Platform analytics

### Backend Work
**Database Tables:**
- `admin_requests` - Become admin requests (user_id, email, full_name, reason, status, reviewed_by, reviewed_at)
- `admin_role_assignments` - Role history (granted_by, granted_to, role_granted, reason, granted_at, revoked_at, revoked_by, expiration_date)
- `feedback_submissions` - User feedback (user_id, user_name, user_class, rating, issues_faced, feature_suggestions, status, reviewed_by, reviewed_at, admin_notes)
- `feedback_suggestions` - Feature requests (user_id, type, title, description, category, priority, status, upvotes, attachments)

**RLS Policies:**
- `admin_requests`: User can create own, admin can review
- `admin_role_assignments`: Admin-only read
- `feedback_submissions`: User can create, admin/moderator can review
- `feedback_suggestions`: Public read, authenticated create, admin manage

**Edge Functions:**
- `send-admin-request-email` - Notify admin of new requests
- `send-admin-decision-email` - Notify user of decision

**Database Functions:**
- `has_role(user_id, role)` - Check user role

**Triggers:**
- `notify_role_change()` - Alert users on role assignment/revocation
- `notify_feedback_update()` - Alert users on feedback status change

### Other Components
- Email integration (Resend API)
- Admin notification system
- Role management UI
- Feedback filtering and search
- Request analytics dashboard
- Master password feature (dev/testing only)

### Key Deliverables
✓ Complete admin dashboard  
✓ User role management  
✓ Feedback review system  
✓ Admin request workflow  
✓ Message moderation tools  
✓ Platform analytics

---

## Phase 18: Rewards & Achievements
**Timeline**: Week 19-20 | **Complexity**: Medium

### Objective
Expand gamification with daily rewards, challenges, guilds, and reward store.

### Frontend Work
- [ ] Daily Rewards page (streak calendar)
- [ ] Reward Store page (spend XP/coins)
- [ ] Daily Challenges page
- [ ] Study Streak Challenges page
- [ ] Guilds page (create, join, manage)
- [ ] Guild leaderboard
- [ ] Achievement gallery
- [ ] Profile achievement showcase

### Backend Work
**Database Tables:**
- `reward_tiers` - Daily reward levels (streak_days, xp_reward, coins_reward, bonus_items)
- `claimed_daily_rewards` - Claim history (user_id, claim_date, streak_count, xp_earned, reward_tier_id, is_random_bonus, bonus_items)
- `daily_challenges` - Challenge definitions (challenge_date, challenge_type, title, description, target_value, xp_reward)
- `user_challenge_progress` - Progress tracking (user_id, challenge_id, progress_value, completed, completed_at)
- `study_streaks` - Streak tracking (user_id, study_date, minutes_studied, activities_completed)
- `guilds` - Team definitions (created_by, name, description, icon, is_private, member_limit, total_xp)
- `guild_members` - Membership (guild_id, user_id, role, joined_at, contribution_xp)
- `guild_challenges` - Team competitions (guild_id, challenge_type, target_value, start_date, end_date, reward_xp, status)
- `guild_challenge_progress` - Team progress (challenge_id, guild_id, current_value, completed)
- `guild_messages` - Guild chat (guild_id, user_id, content, created_at)
- `reward_store_items` - Purchasable items (name, description, cost_coins, cost_xp, category, rarity, image_url, stock)
- `user_inventory` - Purchased items (user_id, item_id, quantity, purchased_at)

**RLS Policies:**
- `claimed_daily_rewards`: Users can claim own
- `guilds`: Public read, creator can manage
- `guild_members`: Members can read, admins can manage
- `reward_store_items`: Public read, admin can manage
- `user_inventory`: Users can read own

**Triggers:**
- Award XP on daily login (10 XP)
- Award XP on challenge completion (25-100 XP)
- Update guild total_xp on member contributions
- Award guild bonuses on guild challenge completion

### Other Components
- Daily reward claim logic (midnight reset)
- Streak calculation algorithm
- Challenge progress tracking
- Guild invitation system
- Guild chat integration
- Reward store purchase flow
- Random bonus item generator

### Key Deliverables
✓ Daily login rewards with streaks  
✓ Daily challenges system  
✓ Study streak tracking  
✓ Guild/team system  
✓ Guild competitions  
✓ Reward store  
✓ User inventory

---

## Phase 19: Notifications & Accessibility
**Timeline**: Week 20-21 | **Complexity**: Medium

### Objective
Implement smart notifications and comprehensive accessibility features.

### Frontend Work
- [ ] Notifications page (all notifications)
- [ ] Notification center widget
- [ ] Notification settings page
- [ ] Accessibility Settings page
- [ ] High contrast mode toggle
- [ ] Font size controls
- [ ] Text-to-speech controls
- [ ] Reduced motion toggle
- [ ] Keyboard navigation improvements
- [ ] Screen reader optimizations

### Backend Work
**Database Tables:**
- `notifications` - Notification records (user_id, title, type, message, data, read, created_at)
- `notification_preferences` - User settings (user_id, resource_access, feedback_responses, exam_reminders, role_changes, email_notifications, push_notifications, digest_mode, quiet_hours_start, quiet_hours_end)
- `notification_queue` - Scheduled notifications (user_id, notification_id, scheduled_for, sent, priority)
- `accessibility_preferences` - A11y settings (user_id, high_contrast_mode, font_size_multiplier, reduce_motion, text_to_speech_enabled, tts_voice, tts_rate, keyboard_shortcuts_enhanced, focus_indicators_enhanced)

**RLS Policies:**
- All tables: Users can CRUD their own data

**Database Functions:**
- `notify_user(user_id, title, type, message, data)` - Create notification with preference checking
- `send_exam_reminders()` - Cron job for exam alerts

**Edge Functions:**
- `send-notification-email` - Email notifications via Resend
- `smart-notification-dispatcher` - AI-powered timing

**Triggers:**
- `notify_resource_access()` - On resource view/download
- `notify_feedback_update()` - On feedback status change

### Other Components
- Browser push notifications (Web Push API)
- Email notification templates
- Smart timing algorithm (avoid focus sessions)
- Priority-based queuing
- Digest mode batching
- Cross-device sync via Supabase Realtime
- Web Speech API for TTS
- ARIA labels throughout app
- Keyboard shortcuts help modal

### Key Deliverables
✓ Comprehensive notification system  
✓ Smart notification timing  
✓ Email notifications  
✓ Push notifications  
✓ Notification preferences  
✓ Full accessibility support  
✓ Screen reader optimization  
✓ TTS for study materials

---

## Phase 20: Polish, PWA & Deployment
**Timeline**: Week 21-22 | **Complexity**: Medium

### Objective
Final polish, PWA setup, performance optimization, and production deployment.

### Frontend Work
- [ ] PWA manifest configuration
- [ ] Service worker setup
- [ ] Offline mode support
- [ ] App install prompts
- [ ] Loading states and skeletons
- [ ] Error boundaries
- [ ] Toast notifications refinement
- [ ] Animation polish (Framer Motion)
- [ ] Mobile responsiveness final pass
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Analytics integration

### Backend Work
**Database Work:**
- [ ] Database indexing for performance
- [ ] Query optimization
- [ ] RLS policy review and testing
- [ ] Data migration scripts (if needed)
- [ ] Backup and restore procedures

**Edge Functions:**
- [ ] Error handling improvements
- [ ] Rate limiting
- [ ] Logging and monitoring

**Storage:**
- [ ] Storage bucket optimization
- [ ] CDN configuration
- [ ] Image optimization

### Other Components
- Vite PWA plugin configuration
- Service worker caching strategies
- Offline data sync
- App icons (192x192, 512x512)
- Splash screens
- TWA (Trusted Web Activity) setup for Android
- Performance monitoring
- Error tracking (Sentry setup)
- Analytics (Posthog/GA4)
- robots.txt and sitemap.xml
- Custom domain setup
- SSL certificate
- Production environment variables

### Key Deliverables
✓ Installable PWA  
✓ Offline functionality  
✓ Optimized performance  
✓ Complete SEO setup  
✓ Error monitoring  
✓ Analytics tracking  
✓ Production deployment  
✓ Custom domain configured  
✓ Backup procedures in place

---

## Post-Launch (Continuous)
**Ongoing** | **Complexity**: Variable

### Maintenance Tasks
- [ ] Monitor error logs
- [ ] Review user feedback
- [ ] Database performance tuning
- [ ] Security audits
- [ ] Dependency updates
- [ ] Bug fixes
- [ ] Feature iterations based on analytics

### Future Enhancements
- [ ] Two-Factor Authentication (2FA)
- [ ] Video recording for live classes
- [ ] Advanced AI tutoring features
- [ ] Flashcard system with spaced repetition
- [ ] Mind mapping tools
- [ ] Multi-language support (i18n)
- [ ] LMS integration (Canvas, Moodle, Google Classroom)
- [ ] Blockchain-based achievement certificates
- [ ] VR/AR lab experiences
- [ ] Native mobile apps (iOS/Android)
- [ ] Desktop apps (Electron)
- [ ] Advanced data visualizations
- [ ] Machine learning for personalized recommendations
- [ ] Social media integrations
- [ ] Payment integration for premium features

---

## Dependencies Matrix

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| 1 | - | All phases |
| 2 | 1 | All features |
| 3 | 1, 2 | 4, 5, 6, 7, 18 |
| 4 | 1, 2, 3 | 6 |
| 5 | 1, 2, 3 | 19 |
| 6 | 1, 2, 3, 4 | 7 |
| 7 | 1, 2, 3, 6 | - |
| 8 | 1, 2 | - |
| 9 | 1, 2 | 10 |
| 10 | 1, 2, 9 | 11 |
| 11 | 1, 2, 3 | 12 |
| 12 | 1, 2, 3, 11 | 13 |
| 13 | 1, 2 | 14 |
| 14 | 1, 2, 13 | - |
| 15 | 1, 2, 3 | - |
| 16 | 1, 2, 3 | - |
| 17 | 1, 2 | - |
| 18 | 1, 2, 3 | - |
| 19 | 1, 2 | - |
| 20 | All above | Production |

---

## Resource Requirements

### Development Team (Recommended)
- **1 Full-Stack Developer** (React + Supabase expertise)
- **1 UI/UX Designer** (for custom components and flows)
- **1 DevOps Engineer** (for deployment and monitoring)
- **1 QA Tester** (for comprehensive testing)

### Third-Party Services
- **Lovable Cloud** - Backend (Supabase)
- **Agora** - Video calling (free tier: 10,000 mins/month)
- **Resend** - Email notifications (free tier: 100 emails/day)
- **Lovable AI** - AI models (usage-based pricing)
- **Domain Provider** - Custom domain (optional)
- **CDN** - Content delivery (optional, Supabase includes)

### Estimated Timeline
- **Solo Developer**: 20-24 weeks (6 months)
- **Small Team (2-3)**: 12-16 weeks (4 months)
- **Full Team (4+)**: 8-12 weeks (3 months)

### Budget Estimate (Monthly Recurring)
- **Lovable Cloud**: $0-50/month (usage-based)
- **Agora**: $0-100/month (based on usage)
- **Resend**: $0-20/month (based on volume)
- **Domain**: $10-15/year
- **Total**: ~$50-200/month

---

## Testing Strategy

### Phase Testing
Each phase should include:
1. **Unit Tests** - Component and function testing
2. **Integration Tests** - Feature workflow testing
3. **E2E Tests** - User journey testing
4. **Security Tests** - RLS policy validation
5. **Performance Tests** - Load and stress testing

### Pre-Production Checklist
- [ ] All RLS policies tested
- [ ] Authentication flows validated
- [ ] File upload/download verified
- [ ] Real-time features stress-tested
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility audit passed
- [ ] SEO metadata complete
- [ ] Error handling comprehensive
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Backup/restore tested
- [ ] Documentation complete

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average session duration
- Feature adoption rates
- Retention rate (7-day, 30-day)

### Academic Performance
- Tasks completed per user
- Study time per user
- Focus session completion rate
- Exam preparation progress
- Debate participation rate

### Platform Health
- API response times (<200ms p95)
- Error rate (<0.1%)
- Uptime (>99.9%)
- User-reported bugs
- Customer satisfaction score

### Business Metrics
- User growth rate
- Churn rate
- Feature usage distribution
- Support ticket volume
- Community engagement (debates, study groups)

---

## Risk Management

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Supabase RLS complexity | Thorough testing, peer review |
| Real-time performance | Load testing, scaling plan |
| Video calling reliability | Agora fallback, network checks |
| AI API costs | Usage limits, caching, rate limiting |
| Data loss | Automated backups, point-in-time recovery |

### Product Risks
| Risk | Mitigation |
|------|-----------|
| Feature scope creep | Strict phase adherence, MVP focus |
| User adoption | Beta testing, feedback loops |
| Competition | Unique features (debates, labs, AI) |
| Scalability | Cloud-native architecture, CDN |
| Security vulnerabilities | Regular audits, penetration testing |

---

## Conclusion

This 20-phase development plan provides a comprehensive roadmap for building the complete NiranX Study Platform. Each phase is designed to be incremental, testable, and production-ready, allowing for early deployment and iterative improvements based on user feedback.

**Key Success Factors:**
✅ Clear phase dependencies  
✅ Balanced complexity distribution  
✅ Early value delivery (MVP by Phase 7)  
✅ Scalable architecture  
✅ Security-first approach  
✅ User-centric design

**Recommended Approach:**
1. Start with Phases 1-7 (Core MVP)
2. Deploy to beta users for feedback
3. Iterate based on usage data
4. Complete Phases 8-20 based on priorities
5. Continuous improvement post-launch

Good luck building NiranX! 🚀📚
