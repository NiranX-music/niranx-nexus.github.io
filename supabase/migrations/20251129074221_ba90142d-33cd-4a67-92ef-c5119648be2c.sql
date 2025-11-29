-- Backfill missing profiles for users in auth.users
-- This ensures all existing users have a profile record

INSERT INTO public.profiles (
  user_id,
  username,
  display_name,
  full_name,
  avatar_url,
  bio,
  created_at,
  updated_at,
  xp,
  level,
  last_login_reward
)
SELECT 
  au.id as user_id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)) as username,
  COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as display_name,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
  COALESCE(au.raw_user_meta_data->>'avatar_url', '') as avatar_url,
  COALESCE(au.raw_user_meta_data->>'bio', '') as bio,
  au.created_at,
  NOW() as updated_at,
  0 as xp,
  1 as level,
  au.last_sign_in_at as last_login_reward
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;