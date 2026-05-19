import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminEmail, verifyAdmin } from "@/lib/adminAuth";
import { writeAuditLog } from "@/lib/admin/audit";
import { buildDuplicatedApartmentData } from "@/lib/admin/duplicateApartment";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const source = await prisma.apartment.findUnique({ where: { id } });
    if (!source) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = buildDuplicatedApartmentData(source);
    const apartment = await prisma.apartment.create({
      data: data as Parameters<typeof prisma.apartment.create>[0]["data"],
    });

    const adminEmail = (await getAdminEmail()) ?? "admin";
    await writeAuditLog({
      adminEmail,
      entityType: "apartment",
      entityId: apartment.id,
      action: "duplicate",
      summary: `Копія з ${source.title} (${source.id})`,
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error("Duplicate apartment error:", error);
    return NextResponse.json({ error: "Помилка копіювання" }, { status: 500 });
  }
}
