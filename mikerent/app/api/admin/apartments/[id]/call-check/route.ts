import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// POST /api/admin/apartments/[id]/call-check
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const apartment = await prisma.apartment.update({
      where: { id },
      data: { lastCalledAt: new Date() },
      select: { id: true, lastCalledAt: true },
    });

    return NextResponse.json(apartment);
  } catch (error) {
    console.error("Call check update error:", error);
    return NextResponse.json({ error: "Помилка оновлення" }, { status: 500 });
  }
}
