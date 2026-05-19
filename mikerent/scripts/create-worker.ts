import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];
  const name = process.argv[4]?.trim() || null;

  if (!email || !password) {
    console.error(
      "Використання: npx tsx scripts/create-worker.ts worker@email.com password123 [Імʼя]",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Пароль мінімум 8 символів");
    process.exit(1);
  }

  const worker = await prisma.admin.upsert({
    where: { email },
    update: {
      password: await bcrypt.hash(password, 10),
      name,
      role: "WORKER",
    },
    create: {
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role: "WORKER",
    },
  });

  console.log("✅ Співробітник:", worker.email, "(роль WORKER)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
