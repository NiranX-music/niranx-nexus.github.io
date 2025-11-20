-- Grant admin role to project owner (initial setup)
INSERT INTO public.user_roles (user_id, role)
VALUES ('a42a5430-3f5d-4b47-a09a-68a2030e257a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;