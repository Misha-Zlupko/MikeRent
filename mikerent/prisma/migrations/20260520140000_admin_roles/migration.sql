-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'WORKER');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'OWNER';
