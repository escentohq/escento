-- Make the first role assignment immutable (MVP-02, issue #27).
--
-- `setRole` used to upsert `app_user.role` unconditionally, so a signed-in
-- MUSICIAN could become a CREATOR by invoking the Server Action directly. The
-- action now does a compare-and-set, but the action is not the trust boundary:
-- any authenticated client can update its own row through PostgREST ("users
-- update own row"). This trigger is the invariant that holds regardless of
-- which caller does the update, and it also resolves concurrent first choices
-- to exactly one durable value — the second writer sees a non-null OLD.role.

CREATE OR REPLACE FUNCTION "public"."enforce_immutable_app_user_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'app_user.role is immutable once assigned (user %)', OLD.id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."enforce_immutable_app_user_role"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."enforce_immutable_app_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_immutable_app_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_immutable_app_user_role"() TO "service_role";

DROP TRIGGER IF EXISTS "enforce_immutable_app_user_role" ON "public"."app_user";

CREATE TRIGGER "enforce_immutable_app_user_role"
    BEFORE UPDATE ON "public"."app_user"
    FOR EACH ROW EXECUTE FUNCTION "public"."enforce_immutable_app_user_role"();
