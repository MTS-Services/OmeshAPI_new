/*
  Warnings:

  - The values [PENDING,CANCELLED] on the enum `PayoutStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [COMPLETED] on the enum `ToolkitRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCELLED] on the enum `TrainingEnrollmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `approvalStatus` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `distanceLabel` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `lifecycleStatus` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `registrationStatus` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketPrice` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `PayoutRequest` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `PayoutRequest` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `PayoutRequest` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to drop the column `needDesignHelp` on the `ToolkitRequest` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `ToolkitRequest` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `ToolkitRequest` table. All the data in the column will be lost.
  - You are about to drop the column `referenceImageUrl` on the `ToolkitRequest` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TrainingEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `TrainingEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `structureId` on the `TrainingEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TrainingEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TrainingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TrainingWeek` table. All the data in the column will be lost.
  - You are about to drop the column `structureId` on the `TrainingWeek` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TrainingWeek` table. All the data in the column will be lost.
  - You are about to drop the column `weekNumber` on the `TrainingWeek` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EventMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRegistration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainingDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainingStructure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planId,userId]` on the table `TrainingEnrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[category,durationMin]` on the table `TrainingPlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planId,weekNo]` on the table `TrainingWeek` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `PayoutRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `quantity` on table `ToolkitRequest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `planId` to the `TrainingEnrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `TrainingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMin` to the `TrainingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `TrainingPlan` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `TrainingPlan` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `planId` to the `TrainingWeek` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekNo` to the `TrainingWeek` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'REJECTED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'REFUNDED', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYPAL', 'BANK', 'CARD');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('FIVE_K', 'TEN_K');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_2FA');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EVENT_APPROVED', 'EVENT_REJECTED', 'EVENT_SUSPENDED', 'REGISTRATION_CONFIRMED', 'PAYOUT_APPROVED', 'PAYOUT_REJECTED', 'TOOLKIT_UPDATE', 'GENERIC');

-- AlterEnum
BEGIN;
CREATE TYPE "PayoutStatus_new" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PAID');
ALTER TABLE "PayoutRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PayoutRequest" ALTER COLUMN "status" TYPE "PayoutStatus_new" USING ("status"::text::"PayoutStatus_new");
ALTER TYPE "PayoutStatus" RENAME TO "PayoutStatus_old";
ALTER TYPE "PayoutStatus_new" RENAME TO "PayoutStatus";
DROP TYPE "PayoutStatus_old";
ALTER TABLE "PayoutRequest" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ToolkitRequestStatus_new" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'QUOTED', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED');
ALTER TABLE "ToolkitRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ToolkitRequest" ALTER COLUMN "status" TYPE "ToolkitRequestStatus_new" USING ("status"::text::"ToolkitRequestStatus_new");
ALTER TYPE "ToolkitRequestStatus" RENAME TO "ToolkitRequestStatus_old";
ALTER TYPE "ToolkitRequestStatus_new" RENAME TO "ToolkitRequestStatus";
DROP TYPE "ToolkitRequestStatus_old";
ALTER TABLE "ToolkitRequest" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TrainingEnrollmentStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');
ALTER TABLE "TrainingEnrollment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TrainingEnrollment" ALTER COLUMN "status" TYPE "TrainingEnrollmentStatus_new" USING ("status"::text::"TrainingEnrollmentStatus_new");
ALTER TYPE "TrainingEnrollmentStatus" RENAME TO "TrainingEnrollmentStatus_old";
ALTER TYPE "TrainingEnrollmentStatus_new" RENAME TO "TrainingEnrollmentStatus";
DROP TYPE "TrainingEnrollmentStatus_old";
ALTER TABLE "TrainingEnrollment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "EventMedia" DROP CONSTRAINT "EventMedia_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventOrder" DROP CONSTRAINT "EventOrder_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventOrder" DROP CONSTRAINT "EventOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_orderId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_userId_fkey";

-- DropForeignKey
ALTER TABLE "ToolkitRequest" DROP CONSTRAINT "ToolkitRequest_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingDay" DROP CONSTRAINT "TrainingDay_weekId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingEnrollment" DROP CONSTRAINT "TrainingEnrollment_structureId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingEnrollment" DROP CONSTRAINT "TrainingEnrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingStructure" DROP CONSTRAINT "TrainingStructure_trainingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingWeek" DROP CONSTRAINT "TrainingWeek_structureId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationCode" DROP CONSTRAINT "VerificationCode_userId_fkey";

-- DropIndex
DROP INDEX "Event_approvalStatus_lifecycleStatus_registrationStatus_idx";

-- DropIndex
DROP INDEX "Event_startsAt_idx";

-- DropIndex
DROP INDEX "PayoutRequest_createdAt_idx";

-- DropIndex
DROP INDEX "ToolkitRequest_createdAt_idx";

-- DropIndex
DROP INDEX "ToolkitRequest_organizerId_status_idx";

-- DropIndex
DROP INDEX "TrainingEnrollment_status_idx";

-- DropIndex
DROP INDEX "TrainingEnrollment_userId_structureId_key";

-- DropIndex
DROP INDEX "TrainingPlan_name_key";

-- DropIndex
DROP INDEX "TrainingWeek_structureId_weekNumber_key";

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "approvalStatus",
DROP COLUMN "bannerUrl",
DROP COLUMN "capacity",
DROP COLUMN "content",
DROP COLUMN "description",
DROP COLUMN "distanceLabel",
DROP COLUMN "lifecycleStatus",
DROP COLUMN "registrationStatus",
DROP COLUMN "startsAt",
DROP COLUMN "summary",
DROP COLUMN "ticketPrice",
ADD COLUMN     "availableSeats" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "body" TEXT,
ADD COLUMN     "bulletsBottom" TEXT[],
ADD COLUMN     "bulletsTop" TEXT[],
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "distance" TEXT,
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "totalSeats" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PayoutRequest" DROP COLUMN "accountNumber",
DROP COLUMN "processedAt",
ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2),
DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

-- AlterTable
ALTER TABLE "ToolkitRequest" DROP COLUMN "needDesignHelp",
DROP COLUMN "organizerId",
DROP COLUMN "phoneNumber",
DROP COLUMN "referenceImageUrl",
ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "designImageUrl" TEXT,
ADD COLUMN     "needsDesignHelp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "quoteAmount" DECIMAL(12,2),
ADD COLUMN     "quoteCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "submitterId" TEXT,
ALTER COLUMN "quantity" SET NOT NULL;

-- AlterTable
ALTER TABLE "TrainingEnrollment" DROP COLUMN "createdAt",
DROP COLUMN "joinedAt",
DROP COLUMN "structureId",
DROP COLUMN "updatedAt",
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TrainingPlan" DROP COLUMN "name",
ADD COLUMN     "category" "TrainingCategory" NOT NULL,
ADD COLUMN     "durationMin" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "TrainingWeek" DROP COLUMN "createdAt",
DROP COLUMN "structureId",
DROP COLUMN "updatedAt",
DROP COLUMN "weekNumber",
ADD COLUMN     "days" TEXT[],
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "weekNo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
ADD COLUMN     "teamClub" TEXT,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "EventMedia";

-- DropTable
DROP TABLE "EventOrder";

-- DropTable
DROP TABLE "EventRegistration";

-- DropTable
DROP TABLE "TrainingDay";

-- DropTable
DROP TABLE "TrainingStructure";

-- DropTable
DROP TABLE "UserProfile";

-- DropTable
DROP TABLE "VerificationCode";

-- DropEnum
DROP TYPE "EventApprovalStatus";

-- DropEnum
DROP TYPE "EventLifecycleStatus";

-- DropEnum
DROP TYPE "EventMediaType";

-- DropEnum
DROP TYPE "EventRegistrationStatus";

-- DropEnum
DROP TYPE "OrderPaymentStatus";

-- DropEnum
DROP TYPE "PayoutMethod";

-- DropEnum
DROP TYPE "RegistrationSource";

-- DropEnum
DROP TYPE "VerificationPurpose";

-- CreateTable
CREATE TABLE "OrganizerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "availableBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pendingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventImage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReview" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "fromStatus" "EventStatus" NOT NULL,
    "toStatus" "EventStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "gender" "Gender",
    "age" INTEGER,
    "dateOfBirth" TIMESTAMP(3),
    "location" TEXT,
    "teamClub" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "source" TEXT NOT NULL DEFAULT 'ONLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "processingFee" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod",
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "providerRef" TEXT,
    "promoCodeId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "amountOff" DECIMAL(10,2),
    "percentOff" DECIMAL(5,2),
    "maxRedemptions" INTEGER,
    "redeemedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "platformFeePct" DECIMAL(5,2) NOT NULL DEFAULT 6,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutAccount" (
    "id" TEXT NOT NULL,
    "organizerProfileId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "label" TEXT,
    "details" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolkitStep" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ToolkitStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "eventId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizerProfile_userId_key" ON "OrganizerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "OtpToken_userId_purpose_idx" ON "OtpToken"("userId", "purpose");

-- CreateIndex
CREATE INDEX "EventImage_eventId_position_idx" ON "EventImage"("eventId", "position");

-- CreateIndex
CREATE INDEX "EventReview_eventId_createdAt_idx" ON "EventReview"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "Registration_eventId_status_idx" ON "Registration"("eventId", "status");

-- CreateIndex
CREATE INDEX "Registration_userId_idx" ON "Registration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_eventId_email_key" ON "Registration"("eventId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_registrationId_key" ON "Payment"("registrationId");

-- CreateIndex
CREATE INDEX "Payment_eventId_status_idx" ON "Payment"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PayoutAccount_organizerProfileId_idx" ON "PayoutAccount"("organizerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ToolkitStep_position_key" ON "ToolkitStep"("position");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_startAt_idx" ON "Event"("status", "startAt");

-- CreateIndex
CREATE INDEX "ToolkitRequest_status_createdAt_idx" ON "ToolkitRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingEnrollment_userId_status_idx" ON "TrainingEnrollment"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingEnrollment_planId_userId_key" ON "TrainingEnrollment"("planId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlan_category_durationMin_key" ON "TrainingPlan"("category", "durationMin");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingWeek_planId_weekNo_key" ON "TrainingWeek"("planId", "weekNo");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- AddForeignKey
ALTER TABLE "OrganizerProfile" ADD CONSTRAINT "OrganizerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpToken" ADD CONSTRAINT "OtpToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReview" ADD CONSTRAINT "EventReview_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReview" ADD CONSTRAINT "EventReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutAccount" ADD CONSTRAINT "PayoutAccount_organizerProfileId_fkey" FOREIGN KEY ("organizerProfileId") REFERENCES "OrganizerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PayoutAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingWeek" ADD CONSTRAINT "TrainingWeek_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolkitRequest" ADD CONSTRAINT "ToolkitRequest_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolkitRequest" ADD CONSTRAINT "ToolkitRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
