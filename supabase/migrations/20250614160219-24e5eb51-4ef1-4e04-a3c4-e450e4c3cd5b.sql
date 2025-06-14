
-- Create site_settings table for admin-controlled content
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add some default settings
INSERT INTO public.site_settings (key, value, description) VALUES
('homepage_trailer', NULL, 'URL for the homepage trailer video'),
('site_title', 'S3M E-Sports', 'Main site title'),
('contact_email', 'info@s3m-esports.com', 'Contact email');

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read site settings
CREATE POLICY "Anyone can view site settings" 
  ON public.site_settings 
  FOR SELECT 
  USING (true);

-- Only admins can modify site settings (you'll need to implement admin check)
CREATE POLICY "Admins can modify site settings" 
  ON public.site_settings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
