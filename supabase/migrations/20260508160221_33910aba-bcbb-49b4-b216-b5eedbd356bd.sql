
-- 1. Add draft columns
ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS draft jsonb;

ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS draft jsonb,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pending_delete boolean NOT NULL DEFAULT false;

ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS draft jsonb,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pending_delete boolean NOT NULL DEFAULT false;

ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS draft jsonb,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pending_delete boolean NOT NULL DEFAULT false;

-- 2. publish_state singleton
CREATE TABLE IF NOT EXISTS public.publish_state (
  id integer PRIMARY KEY DEFAULT 1,
  last_published_at timestamptz,
  has_pending boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT publish_state_singleton CHECK (id = 1)
);

INSERT INTO public.publish_state (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.publish_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view publish_state" ON public.publish_state;
CREATE POLICY "Public view publish_state"
  ON public.publish_state FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins update publish_state" ON public.publish_state;
CREATE POLICY "Admins update publish_state"
  ON public.publish_state FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. publish_drafts RPC — admin only
CREATE OR REPLACE FUNCTION public.publish_drafts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  applied jsonb := '{}'::jsonb;
  cnt int;
  prof_d jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- profile (single row)
  SELECT draft INTO prof_d FROM public.profile WHERE id = 1;
  IF prof_d IS NOT NULL THEN
    UPDATE public.profile SET
      name           = COALESCE(prof_d->>'name', name),
      title          = COALESCE(prof_d->>'title', title),
      tagline        = COALESCE(prof_d->>'tagline', tagline),
      about          = COALESCE(prof_d->>'about', about),
      email          = COALESCE(prof_d->>'email', email),
      phone          = COALESCE(prof_d->>'phone', phone),
      location       = COALESCE(prof_d->>'location', location),
      linkedin       = COALESCE(prof_d->>'linkedin', linkedin),
      github         = COALESCE(prof_d->>'github', github),
      instagram      = COALESCE(prof_d->>'instagram', instagram),
      youtube        = COALESCE(prof_d->>'youtube', youtube),
      twitter        = COALESCE(prof_d->>'twitter', twitter),
      website        = COALESCE(prof_d->>'website', website),
      availability   = COALESCE(prof_d->>'availability', availability),
      stats          = COALESCE(prof_d->'stats', stats),
      show_hire_me   = COALESCE((prof_d->>'show_hire_me')::boolean, show_hire_me),
      show_resume    = COALESCE((prof_d->>'show_resume')::boolean, show_resume),
      show_email     = COALESCE((prof_d->>'show_email')::boolean, show_email),
      show_phone     = COALESCE((prof_d->>'show_phone')::boolean, show_phone),
      draft = NULL,
      updated_at = now()
    WHERE id = 1;
    applied := applied || jsonb_build_object('profile', 1);
  END IF;

  -- experience: deletes
  DELETE FROM public.experience WHERE pending_delete = true;
  GET DIAGNOSTICS cnt = ROW_COUNT;
  applied := applied || jsonb_build_object('experience_deleted', cnt);

  -- experience: apply drafts
  UPDATE public.experience SET
    company    = COALESCE(draft->>'company', company),
    role       = COALESCE(draft->>'role', role),
    location   = COALESCE(draft->>'location', location),
    period     = COALESCE(draft->>'period', period),
    sort_order = COALESCE((draft->>'sort_order')::int, sort_order),
    highlights = COALESCE(draft->'highlights', highlights),
    tech_stack = COALESCE(draft->'tech_stack', tech_stack),
    logo_url   = COALESCE(draft->>'logo_url', logo_url),
    is_published = true,
    draft = NULL
  WHERE draft IS NOT NULL OR is_published = false;
  GET DIAGNOSTICS cnt = ROW_COUNT;
  applied := applied || jsonb_build_object('experience_updated', cnt);

  -- skills: deletes + drafts
  DELETE FROM public.skills WHERE pending_delete = true;
  UPDATE public.skills SET
    name        = COALESCE(draft->>'name', name),
    group_title = COALESCE(draft->>'group_title', group_title),
    icon_key    = COALESCE(draft->>'icon_key', icon_key),
    color       = COALESCE(draft->>'color', color),
    sort_order  = COALESCE((draft->>'sort_order')::int, sort_order),
    group_order = COALESCE((draft->>'group_order')::int, group_order),
    is_published = true,
    draft = NULL
  WHERE draft IS NOT NULL OR is_published = false;

  -- education: deletes + drafts
  DELETE FROM public.education WHERE pending_delete = true;
  UPDATE public.education SET
    institution = COALESCE(draft->>'institution', institution),
    degree      = COALESCE(draft->>'degree', degree),
    location    = COALESCE(draft->>'location', location),
    period      = COALESCE(draft->>'period', period),
    sort_order  = COALESCE((draft->>'sort_order')::int, sort_order),
    is_published = true,
    draft = NULL
  WHERE draft IS NOT NULL OR is_published = false;

  UPDATE public.publish_state
  SET last_published_at = now(),
      has_pending = false,
      updated_at = now()
  WHERE id = 1;

  RETURN applied;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_drafts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_drafts() TO authenticated;

-- 4. mark_pending() trigger to flip publish_state.has_pending = true automatically
CREATE OR REPLACE FUNCTION public.mark_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.publish_state SET has_pending = true, updated_at = now() WHERE id = 1;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_mark_pending ON public.profile;
CREATE TRIGGER profile_mark_pending
  AFTER UPDATE OF draft ON public.profile
  FOR EACH ROW WHEN (NEW.draft IS DISTINCT FROM OLD.draft)
  EXECUTE FUNCTION public.mark_pending();

DROP TRIGGER IF EXISTS experience_mark_pending ON public.experience;
CREATE TRIGGER experience_mark_pending
  AFTER INSERT OR UPDATE OR DELETE ON public.experience
  FOR EACH ROW EXECUTE FUNCTION public.mark_pending();

DROP TRIGGER IF EXISTS skills_mark_pending ON public.skills;
CREATE TRIGGER skills_mark_pending
  AFTER INSERT OR UPDATE OR DELETE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.mark_pending();

DROP TRIGGER IF EXISTS education_mark_pending ON public.education;
CREATE TRIGGER education_mark_pending
  AFTER INSERT OR UPDATE OR DELETE ON public.education
  FOR EACH ROW EXECUTE FUNCTION public.mark_pending();

REVOKE ALL ON FUNCTION public.mark_pending() FROM PUBLIC, anon, authenticated;
