-- Add sync trigger for scheduler classes to live_classes
-- This ensures scheduled classes appear in the class manager

-- Function to sync scheduler classes to live_classes
CREATE OR REPLACE FUNCTION sync_scheduler_to_live_classes()
RETURNS TRIGGER AS $$
DECLARE
  start_datetime TIMESTAMP WITH TIME ZONE;
  end_datetime TIMESTAMP WITH TIME ZONE;
  next_occurrence DATE;
BEGIN
  -- Calculate next occurrence based on day_of_week
  next_occurrence := CASE NEW.day_of_week
    WHEN 'Monday' THEN CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)
    WHEN 'Tuesday' THEN CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)
    WHEN 'Wednesday' THEN CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)
    WHEN 'Thursday' THEN CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)
    WHEN 'Friday' THEN CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)
    WHEN 'Saturday' THEN CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)
    WHEN 'Sunday' THEN CURRENT_DATE + ((0 - EXTRACT(DOW FROM CURRENT_DATE)::INT + 7) % 7)
  END;

  -- Combine date with time
  start_datetime := (next_occurrence || ' ' || NEW.start_time)::TIMESTAMP WITH TIME ZONE;
  end_datetime := (next_occurrence || ' ' || NEW.end_time)::TIMESTAMP WITH TIME ZONE;

  -- Insert or update in live_classes
  INSERT INTO live_classes (
    user_id,
    title,
    subject,
    start_time,
    end_time,
    class_link,
    notes,
    status,
    is_recurring,
    scheduler_task_id
  ) VALUES (
    NEW.user_id,
    NEW.task_name,
    NEW.subject,
    start_datetime,
    end_datetime,
    NEW.class_link,
    NEW.notes,
    'scheduled',
    NEW.is_recurring,
    NEW.id
  )
  ON CONFLICT (scheduler_task_id) 
  DO UPDATE SET
    title = NEW.task_name,
    subject = NEW.subject,
    start_time = start_datetime,
    end_time = end_datetime,
    class_link = NEW.class_link,
    notes = NEW.notes,
    is_recurring = NEW.is_recurring,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add scheduler_task_id column to live_classes if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'live_classes' AND column_name = 'scheduler_task_id'
  ) THEN
    ALTER TABLE live_classes ADD COLUMN scheduler_task_id UUID UNIQUE;
    CREATE INDEX idx_live_classes_scheduler_task ON live_classes(scheduler_task_id);
  END IF;
END $$;

-- Create trigger
DROP TRIGGER IF EXISTS sync_scheduler_classes ON schedule_tasks;
CREATE TRIGGER sync_scheduler_classes
  AFTER INSERT OR UPDATE ON schedule_tasks
  FOR EACH ROW
  WHEN (NEW.task_type = 'main' OR NEW.task_type = 'optional')
  EXECUTE FUNCTION sync_scheduler_to_live_classes();

-- Add visible_columns to user_preferences for column customization
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'scheduler_columns'
  ) THEN
    ALTER TABLE profiles ADD COLUMN scheduler_columns JSONB DEFAULT '["subject", "time", "duration", "type", "professor", "room"]'::jsonb;
  END IF;
END $$;