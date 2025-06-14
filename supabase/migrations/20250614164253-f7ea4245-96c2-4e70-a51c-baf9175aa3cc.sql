
-- Fix the special_players table constraint issue
ALTER TABLE public.special_players DROP CONSTRAINT IF EXISTS special_players_type_check;

-- Add the correct constraint that allows 'weekly' and 'monthly' values
ALTER TABLE public.special_players 
ADD CONSTRAINT special_players_type_check 
CHECK (type IN ('weekly', 'monthly'));

-- Ensure the table has the correct structure
ALTER TABLE public.special_players 
ALTER COLUMN type SET NOT NULL;
