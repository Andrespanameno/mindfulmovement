CREATE TABLE public.reminder_settings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  start_hour INTEGER NOT NULL DEFAULT 8,
  end_hour INTEGER NOT NULL DEFAULT 16,
  interval_min INTEGER NOT NULL DEFAULT 60,
  movement BOOLEAN NOT NULL DEFAULT true,
  hydration BOOLEAN NOT NULL DEFAULT true,
  breath BOOLEAN NOT NULL DEFAULT true,
  quiet_weekends BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminder settings"
  ON public.reminder_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder settings"
  ON public.reminder_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings"
  ON public.reminder_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_reminder_settings_updated_at
  BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id);
  INSERT INTO public.reminder_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

INSERT INTO public.reminder_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;