/*
  Warnings:

  - You are about to drop the column `amountOff` on the `PromoCode` table. All the data in the column will be lost.
  - You are about to drop the column `maxRedemptions` on the `PromoCode` table. All the data in the column will be lost.
  - You are about to drop the column `percentOff` on the `PromoCode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrganizerProfile" ADD COLUMN     "manualCount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PromoCode" DROP COLUMN "amountOff",
DROP COLUMN "maxRedemptions",
DROP COLUMN "percentOff";

-- CreateTable
CREATE TABLE "AllowedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,

    CONSTRAINT "AllowedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedEmail_email_promoCodeId_key" ON "AllowedEmail"("email", "promoCodeId");

-- AddForeignKey
ALTER TABLE "AllowedEmail" ADD CONSTRAINT "AllowedEmail_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
