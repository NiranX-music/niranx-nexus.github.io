-- Add recurring functionality to live_classes table
ALTER TABLE public.live_classes
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_pattern TEXT CHECK (recurring_pattern IN ('daily', 'weekly', 'custom')),
ADD COLUMN IF NOT EXISTS recurring_days INTEGER[] DEFAULT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
ADD COLUMN IF NOT EXISTS recurring_end_date DATE DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.live_classes.recurring_days IS 'Array of weekday numbers (0=Sunday, 1=Monday, ..., 6=Saturday) for custom recurring classes';
COMMENT ON COLUMN public.live_classes.recurring_pattern IS 'Pattern: daily (every day), weekly (same day each week), custom (specific days)';

-- Create index for efficient recurring class queries
CREATE INDEX IF NOT EXISTS idx_live_classes_recurring ON public.live_classes(user_id, is_recurring) WHERE is_recurring = true;