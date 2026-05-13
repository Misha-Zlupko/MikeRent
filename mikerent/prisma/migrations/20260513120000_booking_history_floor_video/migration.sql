-- Статус «відхилено» для бронювань у БД
ALTER TYPE "BookingStatus" ADD VALUE 'REJECTED';

-- Оновлення записів (Prisma @updatedAt)
ALTER TABLE "bookings" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Поверх та відеоогляд квартири (опційно)
ALTER TABLE "Apartment" ADD COLUMN "floor" INTEGER;
ALTER TABLE "Apartment" ADD COLUMN "totalFloors" INTEGER;
ALTER TABLE "Apartment" ADD COLUMN "videoTourUrl" TEXT;
