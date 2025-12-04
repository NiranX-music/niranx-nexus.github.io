-- Add delete policy for admins on artists table
CREATE POLICY "Admins can delete artists" ON public.artists
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add delete policy for admins on tracks table  
CREATE POLICY "Admins can delete tracks" ON public.tracks
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));