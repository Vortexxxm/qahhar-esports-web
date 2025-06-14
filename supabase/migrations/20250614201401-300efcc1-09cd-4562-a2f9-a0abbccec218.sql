
-- First, let's make sure the user_likes table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  liked_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, liked_user_id)
);

-- Add foreign key constraints if they don't exist
ALTER TABLE public.user_likes 
DROP CONSTRAINT IF EXISTS user_likes_user_id_fkey;

ALTER TABLE public.user_likes 
ADD CONSTRAINT user_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_likes 
DROP CONSTRAINT IF EXISTS user_likes_liked_user_id_fkey;

ALTER TABLE public.user_likes 
ADD CONSTRAINT user_likes_liked_user_id_fkey 
FOREIGN KEY (liked_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can create likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Allow read access to user_likes" ON public.user_likes;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.user_likes;
DROP POLICY IF EXISTS "Allow delete for own likes" ON public.user_likes;

-- Create new policies
CREATE POLICY "Allow read access to user_likes" 
  ON public.user_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow insert for authenticated users" 
  ON public.user_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete for own likes" 
  ON public.user_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Make sure the profiles table has the total_likes column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0;

-- Update the trigger function to handle likes count
CREATE OR REPLACE FUNCTION public.update_user_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET total_likes = total_likes + 1
    WHERE id = NEW.liked_user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET total_likes = total_likes - 1
    WHERE id = OLD.liked_user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_likes_count_trigger ON public.user_likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.user_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_user_likes_count();

-- Update current likes count for all users
UPDATE public.profiles 
SET total_likes = COALESCE((
  SELECT COUNT(*) 
  FROM public.user_likes 
  WHERE liked_user_id = profiles.id
), 0);
