-- Allow students to view classrooms they are members of
CREATE POLICY "Students can view classrooms they joined"
ON public.classrooms
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_members
    WHERE classroom_members.classroom_id = classrooms.id
    AND classroom_members.student_id = auth.uid()
    AND classroom_members.enrollment_status = 'active'
  )
);

-- Allow anyone to view public/active classrooms for browsing
CREATE POLICY "Everyone can view active classrooms"
ON public.classrooms
FOR SELECT
TO authenticated
USING (is_active = true);