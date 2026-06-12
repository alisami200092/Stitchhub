-- Trigger to clean up public.user table on delete from auth.users
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public."user" WHERE id = OLD.id::text;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the on_auth_user_deleted trigger safely
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_user();

-- Re-define handle_new_user to avoid unique constraint violations during re-signup testing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Delete conflicting user to prevent Database error saving new user (fail-safe for testing)
  DELETE FROM public."user" WHERE email = NEW.email OR id = NEW.id::text;

  INSERT INTO public."user" (id, name, email, role)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
