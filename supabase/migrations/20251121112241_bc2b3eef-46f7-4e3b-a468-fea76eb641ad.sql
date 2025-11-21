-- Fix infinite recursion in study_group_members SELECT policy
-- Drop the incorrect policy that references chat_room_members
DROP POLICY IF EXISTS "Users can view group memberships" ON public.study_group_members;

-- Create a corrected policy that avoids recursion by checking study_groups instead
CREATE POLICY "Users can view group memberships"
ON public.study_group_members
FOR SELECT
USING (
  -- Users can see memberships of public groups or groups they created
  EXISTS (
    SELECT 1 FROM public.study_groups sg
    WHERE sg.id = study_group_members.group_id
    AND (sg.is_private = false OR sg.created_by = auth.uid())
  )
  -- Or they can see their own membership
  OR auth.uid() = user_id
);