-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sortDescription" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
