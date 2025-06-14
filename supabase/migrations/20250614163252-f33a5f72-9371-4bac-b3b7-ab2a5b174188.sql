
-- Fix the special_players table structure to match the migration
ALTER TABLE public.special_players 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Drop the old columns that don't match
ALTER TABLE public.special_players 
DROP COLUMN IF EXISTS assigned_at,
DROP COLUMN IF EXISTS updated_by;

-- Update the functions to match the new structure
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
