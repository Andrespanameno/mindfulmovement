CREATE TABLE public.achievement_celebrations_seen (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id text NOT NULL,
  celebrated boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievement_celebrations_seen TO authenticated;
GRANT ALL ON public.achievement_celebrations_seen TO service_role;

ALTER TABLE public.achievement_celebrations_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievement celebrations"
ON public.achievement_celebrations_seen FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievement celebrations"
ON public.achievement_celebrations_seen FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievement celebrations"
ON public.achievement_celebrations_seen FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX achievement_celebrations_seen_user_idx
ON public.achievement_celebrations_seen (user_id);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS achievements_baselined boolean NOT NULL DEFAULT false;