-- Create widget preferences table
CREATE TABLE public.widget_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, widget_name)
);

-- Enable RLS
ALTER TABLE public.widget_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own widget preferences"
ON public.widget_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget preferences"
ON public.widget_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget preferences"
ON public.widget_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget preferences"
ON public.widget_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_widget_preferences_updated_at
BEFORE UPDATE ON public.widget_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();