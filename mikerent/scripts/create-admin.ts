import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@mikerent.com";
  const password = "admin_misha_123"; // зміни на свій пароль!
  const name = "Administrator";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name,
    },
  });

  console.log("✅ Адміністратора створено:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
