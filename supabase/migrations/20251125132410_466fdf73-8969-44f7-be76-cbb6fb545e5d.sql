-- Allow students to join classrooms by inserting themselves into classroom_members
CREATE POLICY "Students can join classrooms"
ON public.classroom_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);