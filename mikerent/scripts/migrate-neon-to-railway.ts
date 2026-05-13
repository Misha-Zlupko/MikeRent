import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/**
 * Копирует данные из исходной Postgres (Neon) в целевую (Railway).
 * Схема на целевой БД уже должна совпадать (prisma migrate deploy).
 *
 * В .env или в окружении задай:
 *   SOURCE_DATABASE_URL — строка Neon (лучше direct, не pooler-only)
 *   TARGET_DATABASE_URL — строка Railway
 *
 * Запуск: npx tsx scripts/migrate-neon-to-railway.ts
 */
const sourceUrl = process.env.SOURCE_DATABASE_URL?.trim();
const targetUrl = process.env.TARGET_DATABASE_URL?.trim();

if (!sourceUrl || !targetUrl) {
  console.error(
    "Задай SOURCE_DATABASE_URL (Neon) и TARGET_DATABASE_URL (Railway).",
  );
  process.exit(1);
}

const source = new PrismaClient({
  datasources: { db: { url: sourceUrl } },
});
const target = new PrismaClient({
  datasources: { db: { url: targetUrl } },
});

async function copyTable<T extends Record<string, unknown>>(
  name: string,
  read: () => Promise<T[]>,
  write: (rows: T[]) => Promise<{ count: number }>,
) {
  const rows = await read();
  if (rows.length === 0) {
    console.log(`  ${name}: 0 строк (пропуск)`);
    return;
  }
  const { count } = await write(rows);
  console.log(`  ${name}: скопировано ${count} строк`);
}

async function main() {
  console.log("Чтение из SOURCE, запись в TARGET…");

  await copyTable(
    "Admin",
    () => source.admin.findMany(),
    (rows) =>
      target.admin.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "Apartment",
    () => source.apartment.findMany(),
    (rows) =>
      target.apartment.createMany({
        data: rows as never,
        skipDuplicates: true,
      }),
  );

  await copyTable(
    "Booking (bookings)",
    () => source.booking.findMany(),
    (rows) =>
      target.booking.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "BookingRequest",
    () => source.bookingRequest.findMany(),
    (rows) =>
      target.bookingRequest.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "Testimonial",
    () => source.testimonial.findMany(),
    (rows) =>
      target.testimonial.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "ActiveUser",
    () => source.activeUser.findMany(),
    (rows) =>
      target.activeUser.createMany({ data: rows, skipDuplicates: true }),
  );

  console.log("Готово.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
