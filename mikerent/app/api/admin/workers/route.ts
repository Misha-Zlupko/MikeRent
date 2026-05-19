import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/adminAuth";
import { writeAuditLog } from "@/lib/admin/audit";

export async function GET() {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json(
      { error: "Лише власник може переглядати співробітників" },
      { status: 403 },
    );
  }

  const workers = await prisma.admin.findMany({
    where: { role: "WORKER" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(workers);
}

export async function POST(req: Request) {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json(
      { error: "Лише власник може створювати акаунти співробітників" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim() || null;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email та пароль обовʼязкові" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль мінімум 8 символів" },
        { status: 400 },
      );
    }

    const exists = await prisma.admin.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Користувач з таким email вже існує" },
        { status: 409 },
      );
    }

    const worker = await prisma.admin.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        name,
        role: "WORKER",
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    await writeAuditLog({
      adminEmail: owner.email,
      entityType: "admin",
      entityId: worker.id,
      action: "worker_create",
      summary: `Створено акаунт співробітника ${email}`,
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error("Create worker error:", error);
    return NextResponse.json({ error: "Помилка створення" }, { status: 500 });
  }
}
