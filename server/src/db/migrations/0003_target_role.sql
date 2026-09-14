ALTER TABLE "officials" ADD COLUMN IF NOT EXISTS "target_role_id" uuid REFERENCES "roles"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "officials_target_role_idx" ON "officials" ("target_role_id");
