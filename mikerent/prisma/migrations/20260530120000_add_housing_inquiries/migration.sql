DO $$ BEGIN
  CREATE TYPE "HousingInquiryStatus" AS ENUM ('NEW', 'CALLED', 'COMPLETED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "HousingInquiryType" AS ENUM ('APARTMENT', 'HOUSE', 'ROOM', 'ANY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "HousingInquiry" (
    "id" TEXT NOT NULL,
    "inquiryNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "guests" INTEGER,
    "housingType" "HousingInquiryType" NOT NULL DEFAULT 'ANY',
    "comment" TEXT,
    "status" "HousingInquiryStatus" NOT NULL DEFAULT 'NEW',
    "calledAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HousingInquiry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HousingInquiry_inquiryNumber_key" ON "HousingInquiry"("inquiryNumber");
CREATE INDEX IF NOT EXISTS "HousingInquiry_status_createdAt_idx" ON "HousingInquiry"("status", "createdAt");
