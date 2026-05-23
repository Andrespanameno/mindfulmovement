CREATE TABLE public.reminder_dispatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminder_dispatches_user_created
  ON public.reminder_dispatches (user_id, created_at DESC);

ALTER TABLE public.reminder_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminder dispatches"
  ON public.reminder_dispatches FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder dispatches"
  ON public.reminder_dispatches FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.reminder_dispatches;