-- Add user_name column to live_class_doubts
ALTER TABLE live_class_doubts ADD COLUMN IF NOT EXISTS user_name TEXT;