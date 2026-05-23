CREATE TABLE public.movement_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movement_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 0,
  reps INTEGER,
  reps_type TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.movement_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own movement sessions"
  ON public.movement_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movement sessions"
  ON public.movement_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movement sessions"
  ON public.movement_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_movement_sessions_user_completed
  ON public.movement_sessions (user_id, completed_at DESC);