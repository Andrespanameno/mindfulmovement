ALTER TABLE public.reminder_settings
  ADD COLUMN IF NOT EXISTS active_days SMALLINT NOT NULL DEFAULT 127;

-- Migrate existing quiet_weekends users to the new bitmask before dropping the column.
UPDATE public.reminder_settings
  SET active_days = 62  -- Mon..Fri = bits 1..5
  WHERE quiet_weekends = true;

ALTER TABLE public.reminder_settings
  DROP COLUMN IF EXISTS quiet_weekends;
