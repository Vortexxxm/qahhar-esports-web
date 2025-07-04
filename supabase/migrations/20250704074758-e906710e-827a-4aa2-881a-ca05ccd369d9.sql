
-- Add journalist role to the app_role enum
ALTER TYPE public.app_role ADD VALUE 'journalist';

-- Update news table RLS policies to allow journalists to manage news
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;

CREATE POLICY "Admins and journalists can manage news" ON public.news 
FOR ALL 
USING (
  get_user_role(auth.uid()) = 'admin' OR 
  get_user_role(auth.uid()) = 'journalist'
);
