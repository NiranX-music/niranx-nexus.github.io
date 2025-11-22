-- Phase 4: Accessibility Preferences Table
CREATE TABLE public.accessibility_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Visual
  high_contrast_mode boolean DEFAULT false,
  font_size_multiplier numeric DEFAULT 1.0 CHECK (font_size_multiplier >= 0.8 AND font_size_multiplier <= 2.0),
  reduce_motion boolean DEFAULT false,
  
  -- Audio
  text_to_speech_enabled boolean DEFAULT false,
  tts_rate numeric DEFAULT 1.0 CHECK (tts_rate >= 0.5 AND tts_rate <= 2.0),
  tts_voice text,
  
  -- Navigation
  keyboard_shortcuts_enhanced boolean DEFAULT false,
  focus_indicators_enhanced boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own accessibility preferences
CREATE POLICY "Users manage their accessibility preferences" 
ON public.accessibility_preferences
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_accessibility_user_id ON public.accessibility_preferences(user_id);