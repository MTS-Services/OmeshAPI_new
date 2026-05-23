/*
  Warnings:

  - You are about to drop the column `registrationId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[batchId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_registrationId_fkey";

-- DropIndex
DROP INDEX "Payment_registrationId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "registrationId",
ADD COLUMN     "batchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "paymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_batchId_key" ON "Payment"("batchId");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
