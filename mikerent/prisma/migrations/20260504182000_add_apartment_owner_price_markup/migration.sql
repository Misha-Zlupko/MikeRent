-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "ownerPrice" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Apartment" ADD COLUMN     "markup" INTEGER NOT NULL DEFAULT 0;

-- Backfill: treat existing pricePerNight as final price
UPDATE "Apartment"
SET "ownerPrice" = "pricePerNight",
    "markup" = 0
WHERE "ownerPrice" = 0 AND "markup" = 0;

