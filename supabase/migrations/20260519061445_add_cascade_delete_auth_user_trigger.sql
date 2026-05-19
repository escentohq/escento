CREATE OR REPLACE FUNCTION public.delete_auth_user_on_app_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.supabase_user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER app_user_delete_auth_user
BEFORE DELETE ON public.user
FOR EACH ROW
EXECUTE FUNCTION public.delete_auth_user_on_app_user_delete();
