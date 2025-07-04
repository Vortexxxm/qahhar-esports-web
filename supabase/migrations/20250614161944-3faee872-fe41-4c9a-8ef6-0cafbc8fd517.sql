
-- Update site_settings to support video uploads
INSERT INTO public.site_settings (key, value, description) VALUES
('homepage_video_file', NULL, 'Uploaded video file for homepage trailer')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- Create a storage bucket for admin uploaded videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-videos', 'admin-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read videos
CREATE POLICY IF NOT EXISTS "Public can view admin videos" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-videos');

-- Allow admins to upload/manage videos
CREATE POLICY IF NOT EXISTS "Admins can manage admin videos" ON storage.objects
FOR ALL USING (bucket_id = 'admin-videos');
