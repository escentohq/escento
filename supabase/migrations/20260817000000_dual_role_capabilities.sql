-- Dual capability (issue #6). An account holds capabilities, not one permanent role.
--
-- `role` is deliberately NOT dropped. It keeps its immutability and narrows in
-- meaning to "the first capability this account claimed" — still the right source
-- for a one-word label about another user, still what tells signin/callback that
-- onboarding has not happened, and the rollback anchor for this change.
-- Authorization moves to the two capability columns below.

ALTER TABLE "public"."app_user"
  ADD COLUMN IF NOT EXISTS "is_musician" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_creator"  boolean NOT NULL DEFAULT false;

-- Backfill. Every existing account keeps exactly what it had, so on the day this
-- lands, membership and equality agree on every row and no user's access changes.
UPDATE "public"."app_user" SET "is_musician" = true WHERE "role" = 'MUSICIAN';
UPDATE "public"."app_user" SET "is_creator"  = true WHERE "role" = 'CREATOR';

-- Replaces enforce_immutable_app_user_role (20260816000000) and keeps its clause.
--
-- Same trust argument as that migration: the Server Action is not the boundary.
-- The "users update own row" policy over a table-wide GRANT means any
-- authenticated client can PATCH these columns straight through PostgREST, so
-- "capabilities are grantable but never revocable" has to live here.
--
-- This blocks the service-role client too, exactly as the trigger it replaces
-- did. Revoking a capability is therefore a deliberate migration, not a routine
-- admin action.
CREATE OR REPLACE FUNCTION "public"."enforce_app_user_role_capabilities"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.role IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'app_user.role is immutable once assigned (user %)', OLD.id
        USING ERRCODE = 'check_violation';
    END IF;

    IF (OLD.is_musician AND NOT NEW.is_musician)
       OR (OLD.is_creator AND NOT NEW.is_creator) THEN
      RAISE EXCEPTION 'app_user capabilities are additive only (user %)', OLD.id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- role implies its own capability, on INSERT and UPDATE alike. This is what
  -- lets claimRole() in onboarding/role/actions.ts stay unchanged: it still
  -- writes only `role`, and the matching capability follows.
  IF NEW.role = 'MUSICIAN' THEN NEW.is_musician := true; END IF;
  IF NEW.role = 'CREATOR'  THEN NEW.is_creator  := true; END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."enforce_app_user_role_capabilities"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."enforce_app_user_role_capabilities"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_app_user_role_capabilities"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_app_user_role_capabilities"() TO "service_role";

DROP TRIGGER IF EXISTS "enforce_immutable_app_user_role" ON "public"."app_user";
DROP FUNCTION IF EXISTS "public"."enforce_immutable_app_user_role"();

CREATE TRIGGER "enforce_app_user_role_capabilities"
    BEFORE INSERT OR UPDATE ON "public"."app_user"
    FOR EACH ROW EXECUTE FUNCTION "public"."enforce_app_user_role_capabilities"();

-- The admin dashboard counts creators; a partial index keeps that a lookup
-- rather than a scan once both capabilities are common.
CREATE INDEX IF NOT EXISTS "app_user_is_creator_idx"
  ON "public"."app_user" ("id") WHERE "is_creator";
CREATE INDEX IF NOT EXISTS "app_user_is_musician_idx"
  ON "public"."app_user" ("id") WHERE "is_musician";
