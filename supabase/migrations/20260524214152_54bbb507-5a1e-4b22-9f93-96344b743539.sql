DROP POLICY IF EXISTS "Users can update their own reminder dispatches" ON public.reminder_dispatches;

CREATE POLICY "Users can update their own reminder dispatches"
  ON public.reminder_dispatches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);