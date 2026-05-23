/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `TrainingPlanCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `TrainingPlanCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrainingPlanCategory" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlanCategory_slug_key" ON "TrainingPlanCategory"("slug");
