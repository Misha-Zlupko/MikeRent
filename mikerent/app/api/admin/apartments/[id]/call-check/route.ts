import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { writeAuditLog } from "@/lib/admin/audit";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.apartment.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const apartment = await prisma.apartment.update({
      where: { id },
      data: { lastCalledAt: new Date() },
      select: { id: true, lastCalledAt: true },
    });

    await writeAuditLog({
      adminEmail: session.email,
      entityType: "apartment",
      entityId: id,
      action: "call_check",
      summary: `Прозвон: ${existing.title}`,
    });

    return NextResponse.json(apartment);
  } catch (error) {
    console.error("Call check update error:", error);
    return NextResponse.json({ error: "Помилка оновлення" }, { status: 500 });
  }
}
