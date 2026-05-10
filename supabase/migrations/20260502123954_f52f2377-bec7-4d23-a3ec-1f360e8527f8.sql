ALTER TABLE public.profile
ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'Available for Senior Data Roles / Staff Data Roles',
ADD COLUMN IF NOT EXISTS stats jsonb NOT NULL DEFAULT '[
  {"value":"4+","label":"Years experience"},
  {"value":"$600M+","label":"Revenue powered"},
  {"value":"90%","label":"Faster pipelines"},
  {"value":"200+","label":"Teams enabled"}
]'::jsonb;

ALTER TABLE public.experience
ADD COLUMN IF NOT EXISTS logo_url text;