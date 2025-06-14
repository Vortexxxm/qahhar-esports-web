
-- Create table for special players (weekly and monthly)
CREATE TABLE IF NOT EXISTS public.special_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.special_players ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing special players (everyone can see)
CREATE POLICY "Everyone can view special players" 
  ON public.special_players 
  FOR SELECT 
  USING (true);

-- Create policy for admins to manage special players
CREATE POLICY "Admins can manage special players" 
  ON public.special_players 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add realtime support
ALTER TABLE public.special_players REPLICA IDENTITY FULL;

-- Function to set weekly player
CREATE OR REPLACE FUNCTION public.set_weekly_player(player_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate current weekly player
  UPDATE public.special_players 
  SET is_active = false, end_date = now()
  WHERE type = 'weekly' AND is_active = true;
  
  -- Set new weekly player
  INSERT INTO public.special_players (user_id, type, created_by)
  VALUES (player_id, 'weekly', auth.uid());
END;
$$;

-- Function to set monthly player
CREATE OR REPLACE FUNCTION public.set_monthly_player(player_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate current monthly player
  UPDATE public.special_players 
  SET is_active = false, end_date = now()
  WHERE type = 'monthly' AND is_active = true;
  
  -- Set new monthly player
  INSERT INTO public.special_players (user_id, type, created_by)
  VALUES (player_id, 'monthly', auth.uid());
END;
$$;

-- Add special_players to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.special_players;
