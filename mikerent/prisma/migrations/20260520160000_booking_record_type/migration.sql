-- CreateEnum
CREATE TYPE "BookingRecordType" AS ENUM ('AGENCY', 'OWNER', 'EXTERNAL');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "recordType" "BookingRecordType" NOT NULL DEFAULT 'AGENCY';
