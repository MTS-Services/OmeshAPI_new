-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tShirtImageUrl" TEXT[],
ADD COLUMN     "tShirtIncluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tShirtPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tShirtSizes" TEXT[];
