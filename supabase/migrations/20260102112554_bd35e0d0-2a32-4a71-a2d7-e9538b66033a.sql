-- Fix xstage_projects policies to allow creators to see their newly created projects

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view projects they are members of" ON xstage_projects;

-- Create new SELECT policy that also allows the creator to view
CREATE POLICY "Users can view their projects" ON xstage_projects
FOR SELECT USING (
  created_by = auth.uid() OR is_xstage_project_member(id, auth.uid())
);