-- Revert issue #6 dual capability. Restores one immutable role per account.
--
-- Idempotent so it is safe on a local stack that never received
-- 20260816050844 (that file was deleted from the repo with the code revert).

DROP TRIGGER IF EXISTS "enforce_app_user_role_capabilities" ON "public"."app_user";
DROP FUNCTION IF EXISTS "public"."enforce_app_user_role_capabilities"();

DROP INDEX IF EXISTS "public"."app_user_is_creator_idx";
DROP INDEX IF EXISTS "public"."app_user_is_musician_idx";

ALTER TABLE "public"."app_user"
  DROP COLUMN IF EXISTS "is_musician",
  DROP COLUMN IF EXISTS "is_creator";

-- Byte-for-byte restore of 20260816000000_lock_first_role_assignment.sql.
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
