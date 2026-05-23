/*
  Warnings:

  - You are about to drop the column `designImageUrl` on the `ToolkitRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ToolkitRequest" DROP COLUMN "designImageUrl",
ADD COLUMN     "designImageUrls" TEXT[];
