-- Enable realtime for admin dashboard tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;