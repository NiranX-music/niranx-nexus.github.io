-- Study Personas table
CREATE TABLE public.study_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  persona_type TEXT NOT NULL CHECK (persona_type IN ('exam_prep', 'daily_learner', 'night_owl', 'quick_sessions')),
  custom_preferences JSONB DEFAULT '{}',
  widgets_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Study Templates table
CREATE TABLE public.study_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Activity Log table
CREATE TABLE public.user_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address TEXT,
  location TEXT,
  user_agent TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Parental Controls table
CREATE TABLE public.parental_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL,
  student_id UUID NOT NULL,
  daily_study_limit_minutes INTEGER DEFAULT 480,
  daily_break_reminder_minutes INTEGER DEFAULT 45,
  allowed_start_time TIME DEFAULT '06:00',
  allowed_end_time TIME DEFAULT '22:00',
  blocked_features TEXT[] DEFAULT '{}',
  enforce_focus_sessions BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guardian_id, student_id)
);

-- Study Heatmap Data table
CREATE TABLE public.study_heatmap_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_minutes INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  focus_score INTEGER DEFAULT 0,
  subjects_studied TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, study_date)
);

-- Offline Notes Sync table
CREATE TABLE public.offline_notes_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  note_id UUID NOT NULL,
  content TEXT,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict')),
  local_updated_at TIMESTAMP WITH TIME ZONE,
  server_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Push Notification Subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT,
  auth_key TEXT,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS on all tables
ALTER TABLE public.study_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_notes_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Study Personas policies
CREATE POLICY "Users can view their own persona" ON public.study_personas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own persona" ON public.study_personas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own persona" ON public.study_personas FOR UPDATE USING (auth.uid() = user_id);

-- Study Templates policies (public read, admin write)
CREATE POLICY "Anyone can view active templates" ON public.study_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage templates" ON public.study_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- User Activity Log policies
CREATE POLICY "Users can view their own activity" ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity logs" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Parental Controls policies
CREATE POLICY "Guardians can manage their controls" ON public.parental_controls FOR ALL USING (auth.uid() = guardian_id);
CREATE POLICY "Students can view their controls" ON public.parental_controls FOR SELECT USING (auth.uid() = student_id);

-- Study Heatmap policies
CREATE POLICY "Users can view their own heatmap" ON public.study_heatmap_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own heatmap" ON public.study_heatmap_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own heatmap" ON public.study_heatmap_data FOR UPDATE USING (auth.uid() = user_id);

-- Offline Notes Sync policies
CREATE POLICY "Users can manage their offline sync" ON public.offline_notes_sync FOR ALL USING (auth.uid() = user_id);

-- Push Subscriptions policies
CREATE POLICY "Users can manage their subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Insert default study templates
INSERT INTO public.study_templates (name, description, category, template_data, created_by) VALUES
('IELTS Preparation', 'Complete 8-week IELTS preparation plan with focus on all 4 modules', 'language', '{"weeks": 8, "daily_hours": 3, "modules": ["Reading", "Writing", "Listening", "Speaking"], "tasks": [{"week": 1, "focus": "Vocabulary Building"}, {"week": 2, "focus": "Reading Techniques"}]}', '00000000-0000-0000-0000-000000000000'),
('JEE/NEET Preparation', 'Intensive preparation for competitive exams with subject-wise breakdown', 'competitive', '{"weeks": 24, "daily_hours": 6, "subjects": ["Physics", "Chemistry", "Mathematics/Biology"], "revision_cycles": 3}', '00000000-0000-0000-0000-000000000000'),
('College Finals', '4-week intensive revision plan for semester finals', 'academic', '{"weeks": 4, "daily_hours": 5, "phases": ["Review", "Practice", "Mock Tests", "Final Revision"]}', '00000000-0000-0000-0000-000000000000'),
('Board Exams 10th/12th', 'Comprehensive board exam preparation with NCERT focus', 'academic', '{"weeks": 16, "daily_hours": 4, "focus": "NCERT", "subjects": ["All Core Subjects"]}', '00000000-0000-0000-0000-000000000000'),
('Daily Learning Habit', 'Build consistent study habits with 1-hour daily sessions', 'habit', '{"weeks": 12, "daily_hours": 1, "focus": "Consistency over intensity"}', '00000000-0000-0000-0000-000000000000');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_study_personas_updated_at BEFORE UPDATE ON public.study_personas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_templates_updated_at BEFORE UPDATE ON public.study_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parental_controls_updated_at BEFORE UPDATE ON public.parental_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_heatmap_data_updated_at BEFORE UPDATE ON public.study_heatmap_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();