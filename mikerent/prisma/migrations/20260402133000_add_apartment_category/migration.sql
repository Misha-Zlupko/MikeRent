-- CreateEnum
CREATE TYPE "ApartmentCategory" AS ENUM ('EXCLUSIVE', 'SHARED');

-- AlterTable
ALTER TABLE "Apartment"
ADD COLUMN "category" "ApartmentCategory" NOT NULL DEFAULT 'EXCLUSIVE';
