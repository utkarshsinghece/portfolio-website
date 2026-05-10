
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Anyone can view roles" ON public.user_roles
  FOR SELECT USING (true);

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profile (hero/about) singleton
CREATE TABLE public.profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  about TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  linkedin TEXT,
  github TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admins update profile" ON public.profile FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert profile" ON public.profile FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Experience
CREATE TABLE public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  period TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Admin manage experience" ON public.experience FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed profile
INSERT INTO public.profile (id, name, title, tagline, about, email, phone, location, linkedin, github)
VALUES (
  1,
  'Utkarsh Singh',
  'Senior Data Engineer',
  'Building data pipelines that move billions of records — and billions in revenue.',
  'Data Engineer with 4+ years designing and automating large-scale data pipelines using Spark, Kafka, Databricks, Hadoop, Snowflake, Hive, and Airflow. Skilled in ETL, CI/CD, real-time streaming, and performance tuning — cutting query times by 90%.',
  'sutkarsh28@gmail.com',
  '+91 8755792651',
  'Bengaluru, India',
  '',
  ''
);

-- Seed experience
INSERT INTO public.experience (company, role, location, period, sort_order, highlights) VALUES
('Visa Inc.', 'Senior Data Engineer', 'Bengaluru', '10/2024 — Present', 1, '[
  {"metric":"$600M+","text":"Automated Spark workflows across 10+ billing systems, partitioning into Hive tables and powering revenue streams of $600M+."},
  {"metric":"90%","text":"Re-engineered billing pipelines with SFTP ingestion + PySpark + Hive partitioning, delivering 90% faster analytics."},
  {"metric":"100%","text":"Built a Python email notification service with dashboards, Excel variance reports and one-click approvals — removing 100% of Ops effort."},
  {"metric":"200+","text":"Co-built AMPED UI for Visa''s Global Billing Platform (Angular, Python, Java) — eliminating manual work across 200+ teams."},
  {"metric":"100+","text":"Automated extraction of billing status across 100+ applications into finance-ready reports."},
  {"metric":"90%","text":"Implemented Airflow + Jenkins + GitHub CI/CD pricing pipelines — cutting manual work by 90%."},
  {"metric":"Auto","text":"Configured Control-M to auto-trigger pipelines on SFTP file arrival."}
]'::jsonb),
('Netflix', 'Data Engineer', 'Sydney, NSW', '07/2023 — 09/2024', 2, '[
  {"metric":"99%","text":"Built core data models across Membership & Finance domains ensuring 99% consistency, completeness and quality."},
  {"metric":"30%","text":"Optimized Spark/Hive ETL pipelines, reducing processing time by 30%."},
  {"metric":"Tableau","text":"Built dashboards and scheduled reports on Tableau server for business analytics."},
  {"metric":"DSE","text":"Partnered with DSE teams to evolve metrics and tools measuring health of financial systems."}
]'::jsonb),
('Wipro', 'Data Engineer', 'Greater Noida', '08/2021 — 07/2023', 3, '[
  {"metric":"50%","text":"Designed ETL pipelines transforming billions of records — 29% less manual work and 50% lower Azure cost."},
  {"metric":"90%","text":"Parametrized Azure Data Factory pipelines — cutting manual effort by 90%."},
  {"metric":"30%","text":"Tuned PySpark with partitioning + bucketing — 30% faster data processing."},
  {"metric":"10%","text":"Leveraged PySpark caching to reduce infra costs by 10% via deduplication."}
]'::jsonb);
