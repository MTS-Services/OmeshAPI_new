ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "isGroupLeader" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "declarationAcceptedAt" TIMESTAMP(3);

-- Existing group bookings: the leader is the only member with an email.
UPDATE "Registration" r
SET "isGroupLeader" = true
FROM "PricingTier" t
WHERE r."pricingTierId" = t."id"
  AND t."isGroup" = true
  AND r."userId" IS NOT NULL
  AND r."email" IS NOT NULL;
