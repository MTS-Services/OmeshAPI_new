/*
  Warnings:

  - You are about to drop the column `category` on the `TrainingPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[durationMin]` on the table `TrainingPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `TrainingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainingPlanCategoryId` to the `TrainingPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TrainingPlan_category_durationMin_key";

-- AlterTable
ALTER TABLE "TrainingPlan" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "trainingPlanCategoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TrainingPlanCategory" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlanCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlan_durationMin_key" ON "TrainingPlan"("durationMin");

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_trainingPlanCategoryId_fkey" FOREIGN KEY ("trainingPlanCategoryId") REFERENCES "TrainingPlanCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
