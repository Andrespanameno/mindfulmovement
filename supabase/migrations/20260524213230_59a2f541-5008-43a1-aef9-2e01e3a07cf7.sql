-- Enable RLS on realtime.messages (idempotent)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if present to keep migration idempotent
DROP POLICY IF EXISTS "Users can subscribe to own reminder channel" ON realtime.messages;

-- Allow authenticated users to read realtime messages only for their own topic
CREATE POLICY "Users can subscribe to own reminder channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'reminder-dispatches-' || auth.uid()::text
);