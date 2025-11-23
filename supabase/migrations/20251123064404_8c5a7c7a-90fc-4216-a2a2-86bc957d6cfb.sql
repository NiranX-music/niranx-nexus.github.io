-- Fix infinite recursion error for classrooms RLS policies
-- Remove policy that created a cyclic dependency between classrooms and classroom_members

DROP POLICY IF EXISTS "Students can view enrolled classrooms" ON public.classrooms;