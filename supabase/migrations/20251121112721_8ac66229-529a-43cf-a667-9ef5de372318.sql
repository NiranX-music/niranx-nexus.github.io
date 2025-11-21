-- Fix infinite recursion in chat_room_members SELECT policy using a security definer helper

-- 1) Create helper function to check if current user is member of a chat room
create or replace function public.is_member_of_chat_room(_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_room_members
    where room_id = _room_id
      and user_id = auth.uid()
  );
$$;

-- 2) Replace recursive SELECT policy on chat_room_members
DROP POLICY IF EXISTS "Users can view room memberships" ON public.chat_room_members;

CREATE POLICY "Users can view room memberships"
ON public.chat_room_members
FOR SELECT
USING (
  public.is_member_of_chat_room(room_id)
);