
CREATE TABLE public.motivational_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  author text DEFAULT 'Mindful Movement',
  category text NOT NULL CHECK (category IN ('movement','consistency','hydration','breathing','stress_relief','progress','encouragement')),
  placement text NOT NULL CHECK (placement IN ('home_page','session_completion','hydration_completion','progress_summary')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_motivational_messages_placement_active
  ON public.motivational_messages (placement, active);

ALTER TABLE public.motivational_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active messages"
  ON public.motivational_messages
  FOR SELECT
  TO authenticated
  USING (active = true);

INSERT INTO public.motivational_messages (message, author, category, placement) VALUES
-- HOME PAGE
('Small actions build lasting progress.', 'Mindful Movement', 'progress', 'home_page'),
('A few intentional minutes can shift your whole day.', 'Mindful Movement', 'movement', 'home_page'),
('Your body appreciates every mindful movement.', 'Mindful Movement', 'movement', 'home_page'),
('Progress does not have to be intense to be meaningful.', 'Mindful Movement', 'progress', 'home_page'),
('Today is a gentle invitation to begin again.', 'Mindful Movement', 'encouragement', 'home_page'),
('Consistency is kinder than intensity.', 'Mindful Movement', 'consistency', 'home_page'),
('Movement is a quiet form of self-care.', 'Mindful Movement', 'movement', 'home_page'),
('A calm breath is always within reach.', 'Mindful Movement', 'breathing', 'home_page'),
('Tiny resets create steady momentum.', 'Mindful Movement', 'consistency', 'home_page'),
('Stillness counts. Motion counts. Both matter.', 'Mindful Movement', 'stress_relief', 'home_page'),
('Hydration is a small act of devotion to yourself.', 'Mindful Movement', 'hydration', 'home_page'),
('You do not need a perfect day to make a meaningful one.', 'Mindful Movement', 'encouragement', 'home_page'),
('Show up softly. That is enough.', 'Mindful Movement', 'encouragement', 'home_page'),

-- SESSION COMPLETION
('You showed up for yourself today.', 'Mindful Movement', 'encouragement', 'session_completion'),
('That small pause mattered.', 'Mindful Movement', 'stress_relief', 'session_completion'),
('Momentum grows one reset at a time.', 'Mindful Movement', 'consistency', 'session_completion'),
('Your body says thank you.', 'Mindful Movement', 'movement', 'session_completion'),
('Beautifully done. Carry this calm with you.', 'Mindful Movement', 'stress_relief', 'session_completion'),
('A few minutes well spent.', 'Mindful Movement', 'progress', 'session_completion'),
('Gentle effort is real effort.', 'Mindful Movement', 'movement', 'session_completion'),
('You just made the day a little kinder.', 'Mindful Movement', 'encouragement', 'session_completion'),
('That is how lasting change is built.', 'Mindful Movement', 'consistency', 'session_completion'),
('Every reset is a quiet victory.', 'Mindful Movement', 'progress', 'session_completion'),
('Your breath, your body, your moment.', 'Mindful Movement', 'breathing', 'session_completion'),
('You returned to yourself. That is everything.', 'Mindful Movement', 'encouragement', 'session_completion'),
('Small movement, big care.', 'Mindful Movement', 'movement', 'session_completion'),

-- HYDRATION COMPLETION
('A sip is a small promise kept.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('Your body is grateful for that glass.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('Hydration done gently is hydration done well.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('Steady sips, steady self.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('Tiny refills add up to a brighter day.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('You just gave your body what it asked for.', 'Mindful Movement', 'encouragement', 'hydration_completion'),
('Hydration is a quiet act of kindness to yourself.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('One glass closer to a softer afternoon.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('Gentle hydration, gentle energy.', 'Mindful Movement', 'hydration', 'hydration_completion'),
('Small sips, real care.', 'Mindful Movement', 'hydration', 'hydration_completion'),

-- PROGRESS SUMMARY
('Look how far small steps have carried you.', 'Mindful Movement', 'progress', 'progress_summary'),
('Consistency, not intensity, built this.', 'Mindful Movement', 'consistency', 'progress_summary'),
('Every entry here is a moment you chose yourself.', 'Mindful Movement', 'encouragement', 'progress_summary'),
('Progress is the gentle sum of showing up.', 'Mindful Movement', 'progress', 'progress_summary'),
('You are building something quiet and real.', 'Mindful Movement', 'progress', 'progress_summary'),
('Your journey does not need to be loud to be meaningful.', 'Mindful Movement', 'encouragement', 'progress_summary'),
('Small actions, steady proof.', 'Mindful Movement', 'progress', 'progress_summary'),
('A rhythm is forming, one mindful day at a time.', 'Mindful Movement', 'consistency', 'progress_summary'),
('This is what kind progress looks like.', 'Mindful Movement', 'progress', 'progress_summary'),
('Each session here is a small thank-you to your future self.', 'Mindful Movement', 'encouragement', 'progress_summary'),
('Movement, breath, hydration — all woven into your week.', 'Mindful Movement', 'movement', 'progress_summary'),
('Streaks are built breath by breath.', 'Mindful Movement', 'breathing', 'progress_summary');
