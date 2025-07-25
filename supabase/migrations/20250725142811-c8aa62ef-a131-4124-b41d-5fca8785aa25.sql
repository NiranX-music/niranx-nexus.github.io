-- Fix remaining database function security paths
-- Update calculate_level and xp_for_next_level functions

-- Update calculate_level function
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN xp_amount < 1000 THEN 1
    WHEN xp_amount < 2500 THEN 2
    WHEN xp_amount < 5000 THEN 3
    WHEN xp_amount < 10000 THEN 4
    WHEN xp_amount < 20000 THEN 5
    WHEN xp_amount < 35000 THEN 6
    WHEN xp_amount < 50000 THEN 7
    WHEN xp_amount < 75000 THEN 8
    WHEN xp_amount < 100000 THEN 9
    ELSE 10
  END;
$function$;

-- Update xp_for_next_level function
CREATE OR REPLACE FUNCTION public.xp_for_next_level(current_level integer)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE current_level
    WHEN 1 THEN 1000
    WHEN 2 THEN 2500
    WHEN 3 THEN 5000
    WHEN 4 THEN 10000
    WHEN 5 THEN 20000
    WHEN 6 THEN 35000
    WHEN 7 THEN 50000
    WHEN 8 THEN 75000
    WHEN 9 THEN 100000
    ELSE 100000
  END;
$function$;