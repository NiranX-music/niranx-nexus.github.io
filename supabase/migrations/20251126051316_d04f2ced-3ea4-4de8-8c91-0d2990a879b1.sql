-- Drop credit-related functions and table
DROP FUNCTION IF EXISTS public.deduct_credits(uuid, integer);
DROP FUNCTION IF EXISTS public.ensure_user_credits(uuid);
DROP FUNCTION IF EXISTS public.get_user_credit_limit(uuid);
DROP TABLE IF EXISTS public.user_credits;

-- Remove unlimited_credits_enabled setting from admin_settings
DELETE FROM public.admin_settings WHERE setting_key = 'unlimited_credits_enabled';