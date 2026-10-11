DO $$ BEGIN
  CREATE TYPE "SponsorSupportType" AS ENUM ('SPONSORSHIP', 'DONATION');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "SponsorRequest" (
    "id" TEXT NOT NULL,
    "supportType" "SponsorSupportType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "eventName" TEXT,
    "message" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "orderId" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SponsorRequest_orderId_key" ON "SponsorRequest"("orderId");
CREATE INDEX IF NOT EXISTS "SponsorRequest_paymentStatus_createdAt_idx" ON "SponsorRequest"("paymentStatus", "createdAt");
CREATE INDEX IF NOT EXISTS "SponsorRequest_supportType_createdAt_idx" ON "SponsorRequest"("supportType", "createdAt");
