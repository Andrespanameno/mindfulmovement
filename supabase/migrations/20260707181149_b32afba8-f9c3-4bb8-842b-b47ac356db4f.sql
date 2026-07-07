ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS session_max_minutes SMALLINT NOT NULL DEFAULT 5;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_session_max_minutes_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_session_max_minutes_check
  CHECK (session_max_minutes IN (3, 4, 5));