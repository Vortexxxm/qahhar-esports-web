
-- Create girls_profiles table for team leader and members
CREATE TABLE public.girls_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('leader', 'member')),
  bio TEXT,
  image_url TEXT,
  achievements TEXT[],
  social_links JSONB DEFAULT '{}',
  squad_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_weekly_ratings table for weekly evaluation system
CREATE TABLE public.girls_weekly_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  activity_score INTEGER DEFAULT 0 CHECK (activity_score >= 0 AND activity_score <= 100),
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  commitment_score INTEGER DEFAULT 0 CHECK (commitment_score >= 0 AND commitment_score <= 100),
  total_score INTEGER GENERATED ALWAYS AS (activity_score + performance_score + commitment_score) STORED,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_highlights table for video submissions
CREATE TABLE public.girls_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT CHECK (category IN ('kills', 'funny', 'clutch', 'other')),
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_monthly_winner BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Create girls_blog table for internal blogging
CREATE TABLE public.girls_blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('diary', 'tips', 'experience', 'other')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_suggestions table for suggestion box
CREATE TABLE public.girls_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('events', 'competitions', 'team_development', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  votes INTEGER DEFAULT 0,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_training_schedule table for training and wars schedule
CREATE TABLE public.girls_training_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('training', 'war', 'meeting', 'tournament')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  room_info TEXT,
  max_participants INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_awards table for monthly awards and recognition
CREATE TABLE public.girls_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  award_type TEXT NOT NULL,
  award_title TEXT NOT NULL,
  description TEXT,
  award_date DATE NOT NULL,
  prize_amount DECIMAL(10,2),
  is_monetary BOOLEAN DEFAULT false,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_gallery table for photos and memories
CREATE TABLE public.girls_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT CHECK (category IN ('group_photos', 'room_screenshots', 'designs', 'fan_art', 'other')),
  uploaded_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_announcements table for girls-specific announcements
CREATE TABLE public.girls_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create girls_join_requests table for girls-specific join requests
CREATE TABLE public.girls_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  game_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
  play_hours_daily TEXT NOT NULL,
  previous_teams TEXT,
  why_join TEXT NOT NULL,
  commitment_level TEXT CHECK (commitment_level IN ('casual', 'semi_serious', 'serious', 'professional')),
  can_attend_training BOOLEAN DEFAULT true,
  preferred_role TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.girls_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_weekly_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_training_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girls_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for girls_profiles
CREATE POLICY "Everyone can view girls profiles" ON public.girls_profiles FOR SELECT USING (true);
CREATE POLICY "Admins can manage girls profiles" ON public.girls_profiles FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_weekly_ratings
CREATE POLICY "Everyone can view weekly ratings" ON public.girls_weekly_ratings FOR SELECT USING (true);
CREATE POLICY "Admins can manage weekly ratings" ON public.girls_weekly_ratings FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_highlights
CREATE POLICY "Everyone can view approved highlights" ON public.girls_highlights FOR SELECT USING (is_approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can submit highlights" ON public.girls_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own highlights" ON public.girls_highlights FOR UPDATE USING (auth.uid() = user_id AND is_approved = false);
CREATE POLICY "Admins can manage all highlights" ON public.girls_highlights FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_blog
CREATE POLICY "Everyone can view published blogs" ON public.girls_blog FOR SELECT USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "Users can create blogs" ON public.girls_blog FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own blogs" ON public.girls_blog FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all blogs" ON public.girls_blog FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_suggestions
CREATE POLICY "Everyone can view suggestions" ON public.girls_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can create suggestions" ON public.girls_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suggestions" ON public.girls_suggestions FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can manage all suggestions" ON public.girls_suggestions FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_training_schedule
CREATE POLICY "Everyone can view training schedule" ON public.girls_training_schedule FOR SELECT USING (true);
CREATE POLICY "Admins can manage training schedule" ON public.girls_training_schedule FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_awards
CREATE POLICY "Everyone can view awards" ON public.girls_awards FOR SELECT USING (true);
CREATE POLICY "Admins can manage awards" ON public.girls_awards FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_gallery
CREATE POLICY "Everyone can view gallery" ON public.girls_gallery FOR SELECT USING (true);
CREATE POLICY "Users can upload to gallery" ON public.girls_gallery FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admins can manage gallery" ON public.girls_gallery FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_announcements
CREATE POLICY "Everyone can view announcements" ON public.girls_announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.girls_announcements FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for girls_join_requests
CREATE POLICY "Everyone can create join requests" ON public.girls_join_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all join requests" ON public.girls_join_requests FOR SELECT USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can manage join requests" ON public.girls_join_requests FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_girls_weekly_ratings_week ON public.girls_weekly_ratings(week_start);
CREATE INDEX idx_girls_highlights_approved ON public.girls_highlights(is_approved, submitted_at);
CREATE INDEX idx_girls_blog_published ON public.girls_blog(is_published, created_at);
CREATE INDEX idx_girls_suggestions_status ON public.girls_suggestions(status, created_at);
CREATE INDEX idx_girls_training_schedule_date ON public.girls_training_schedule(scheduled_date);
CREATE INDEX idx_girls_gallery_featured ON public.girls_gallery(is_featured, uploaded_at);
CREATE INDEX idx_girls_announcements_priority ON public.girls_announcements(priority, is_pinned, created_at);
