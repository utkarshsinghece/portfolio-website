
-- Strip admin from anyone who isn't the owner
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
    SELECT id FROM auth.users WHERE lower(email) = 'sutkarsh28@gmail.com'
  );

-- Replace the trigger function to gate admin on the owner email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF lower(NEW.email) = 'sutkarsh28@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Hard guard: prevent INSERT/UPDATE that grants admin to anyone else
CREATE OR REPLACE FUNCTION public.enforce_admin_owner_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
BEGIN
  IF NEW.role = 'admin' THEN
    SELECT lower(email) INTO user_email FROM auth.users WHERE id = NEW.user_id;
    IF user_email IS DISTINCT FROM 'sutkarsh28@gmail.com' THEN
      RAISE EXCEPTION 'Only the owner account may hold the admin role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_admin_owner_only_trg ON public.user_roles;
CREATE TRIGGER enforce_admin_owner_only_trg
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_owner_only();

-- Make sure the trigger on auth.users exists (recreate idempotently)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
