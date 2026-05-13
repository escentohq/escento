-- Add nullable password hash for credentials-based accounts.
-- OAuth-only users keep this column NULL.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

