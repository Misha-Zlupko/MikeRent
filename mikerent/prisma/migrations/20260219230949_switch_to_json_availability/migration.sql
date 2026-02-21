/*
  Warnings:

  - You are about to drop the column `seasonFrom` on the `Apartment` table. All the data in the column will be lost.
  - You are about to drop the column `seasonTo` on the `Apartment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Apartment" DROP COLUMN "seasonFrom",
DROP COLUMN "seasonTo",
ADD COLUMN     "availability" JSONB;
