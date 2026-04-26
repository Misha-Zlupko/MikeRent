-- CreateEnum
CREATE TYPE "BookingRequestStatus" AS ENUM ('NEW', 'CALLED', 'CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "comment" TEXT,
    "guests" INTEGER NOT NULL,
    "nights" INTEGER NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "BookingRequestStatus" NOT NULL DEFAULT 'NEW',
    "calledAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingRequest_bookingNumber_key" ON "BookingRequest"("bookingNumber");

-- CreateIndex
CREATE INDEX "BookingRequest_apartmentId_status_checkIn_idx" ON "BookingRequest"("apartmentId", "status", "checkIn");

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
