import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (!email || !password) {
    console.error(
      "Задайте в .env: ADMIN_EMAIL та ADMIN_PASSWORD (див. .env.example)",
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
    },
    create: {
      email,
      password: hashedPassword,
      name,
    },
  });

  console.log("✅ Адміністратор:", admin.email, "(пароль синхронізовано з .env)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
