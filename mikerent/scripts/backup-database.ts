import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { exportDatabaseSnapshot } from "../lib/backup/exportDatabaseSnapshot";

/**
 * Локальна резервна копія в папку backups/ (не комітиться в git).
 * Запуск: npm run backup-db
 */
async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("Задай DATABASE_URL у .env");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const snapshot = await exportDatabaseSnapshot(prisma);
    const dir = path.join(process.cwd(), "backups");
    await mkdir(dir, { recursive: true });

    const filename = `mikerent-backup-${snapshot.exportedAt.slice(0, 19).replace(/[:T]/g, "-")}.json`;
    const filePath = path.join(dir, filename);
    await writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf-8");

    console.log("Резервна копія збережена:");
    console.log(filePath);
    console.log(
      `Квартири: ${snapshot.counts.apartments}, бронювання: ${snapshot.counts.bookings}, заявки: ${snapshot.counts.bookingRequests}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
