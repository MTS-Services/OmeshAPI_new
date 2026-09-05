CREATE TABLE "PricingTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Registration" ADD COLUMN "pricingTierId" TEXT;

CREATE UNIQUE INDEX "PricingTier_eventId_name_key" ON "PricingTier"("eventId", "name");
CREATE INDEX "PricingTier_eventId_idx" ON "PricingTier"("eventId");
CREATE INDEX "Registration_pricingTierId_idx" ON "Registration"("pricingTierId");

ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Registration" ADD CONSTRAINT "Registration_pricingTierId_fkey"
  FOREIGN KEY ("pricingTierId") REFERENCES "PricingTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "PricingTier" ("id", "name", "price", "eventId")
SELECT 'legacy-' || "id", 'General Admission', "price", "id"
FROM "Event" event
WHERE NOT EXISTS (
  SELECT 1 FROM "PricingTier" tier WHERE tier."eventId" = event."id"
);