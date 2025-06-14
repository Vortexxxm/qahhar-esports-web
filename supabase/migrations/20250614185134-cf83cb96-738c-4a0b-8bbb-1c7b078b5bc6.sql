
-- Add video_url column to news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Update the news table to support video uploads
COMMENT ON COLUMN public.news.video_url IS 'URL for news video content';
