-- Create classroom videos table for teacher-managed YouTube library
CREATE TABLE IF NOT EXISTS public.classroom_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_description TEXT,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.classroom_videos ENABLE ROW LEVEL SECURITY;

-- Teachers can manage videos in their classrooms
CREATE POLICY "Teachers can manage classroom videos"
  ON public.classroom_videos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms
      WHERE classrooms.id = classroom_videos.classroom_id
      AND classrooms.teacher_id = auth.uid()
    )
  );

-- Students can view videos in enrolled classrooms
CREATE POLICY "Students can view classroom videos"
  ON public.classroom_videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_members
      WHERE classroom_members.classroom_id = classroom_videos.classroom_id
      AND classroom_members.student_id = auth.uid()
      AND classroom_members.enrollment_status = 'active'
    )
  );

-- Create index for performance
CREATE INDEX idx_classroom_videos_classroom_id ON public.classroom_videos(classroom_id);
CREATE INDEX idx_classroom_videos_order ON public.classroom_videos(classroom_id, order_index);