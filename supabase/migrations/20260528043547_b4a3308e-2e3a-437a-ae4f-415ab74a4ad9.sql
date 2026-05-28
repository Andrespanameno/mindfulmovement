ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tutorial_seen BOOLEAN NOT NULL DEFAULT false;

-- Existing users who already completed onboarding should not see the tutorial again
UPDATE public.profiles SET tutorial_seen = true WHERE onboarding_completed = true;

-- Update the signup trigger to explicitly seed tutorial_seen = false for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, tutorial_seen)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    false
  );
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id);
  INSERT INTO public.reminder_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$function$;