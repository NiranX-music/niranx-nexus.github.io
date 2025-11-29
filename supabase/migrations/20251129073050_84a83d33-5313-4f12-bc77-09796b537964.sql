-- Ensure profiles table has REPLICA IDENTITY FULL for real-time updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add profiles table to realtime publication if not already added
DO $$
BEGIN
  -- Check if table is already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- Create or replace function to update last_login_reward on profile
CREATE OR REPLACE FUNCTION public.update_profile_last_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_login_reward timestamp when user logs in
  UPDATE public.profiles
  SET last_login_reward = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for login tracking (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_profile_last_login();