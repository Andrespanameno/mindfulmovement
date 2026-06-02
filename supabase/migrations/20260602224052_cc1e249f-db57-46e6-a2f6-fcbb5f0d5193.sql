ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_water_goal_display numeric,
ADD COLUMN IF NOT EXISTS daily_water_goal_display_unit text;