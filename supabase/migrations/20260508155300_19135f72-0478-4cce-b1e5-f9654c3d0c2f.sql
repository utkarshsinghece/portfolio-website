ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS show_hire_me boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_resume boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT false;