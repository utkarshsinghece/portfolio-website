
-- Restrict user_roles SELECT to own user or admins
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;

CREATE POLICY "Users view own roles or admins view all"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Lock down SECURITY DEFINER functions: revoke from anon/authenticated where unsafe
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role is still callable by authenticated (needed by RLS evaluation context)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
