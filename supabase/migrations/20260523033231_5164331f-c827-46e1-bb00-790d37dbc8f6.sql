CREATE TABLE public.hydration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ounces INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hydration logs"
  ON public.hydration_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydration logs"
  ON public.hydration_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hydration logs"
  ON public.hydration_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_hydration_logs_user_logged
  ON public.hydration_logs (user_id, logged_at DESC);