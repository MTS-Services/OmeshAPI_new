-- DropForeignKey
ALTER TABLE "TrainingEnrollment" DROP CONSTRAINT "TrainingEnrollment_planId_fkey";

-- AlterTable
ALTER TABLE "TrainingPlan" ALTER COLUMN "durationMin" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
