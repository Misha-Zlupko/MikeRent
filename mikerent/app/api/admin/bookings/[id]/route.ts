import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

function withUtcHour(value: unknown, hour: number) {
  const date = new Date(String(value));
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

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

// GET /api/admin/bookings/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { apartment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET booking error:", error);
    return NextResponse.json(
      { error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/bookings/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        apartmentId: data.apartmentId,
        dateFrom: withUtcHour(data.dateFrom, 14),
        dateTo: withUtcHour(data.dateTo, 12),
        guestName: data.guestName || null,
        guestPhone: data.guestPhone || null,
        guestCount: data.guestCount ? Number(data.guestCount) : null,
        guestContact: data.guestContact || null,
        totalAmount: data.totalAmount != null ? Number(data.totalAmount) : null,
        ownerPayout: data.ownerPayout != null ? Number(data.ownerPayout) : null,
        ourProfit: data.ourProfit != null ? Number(data.ourProfit) : null,
        ownerPhone: data.ownerPhone || null,
        status: data.status || "CONFIRMED",
      },
      include: { apartment: true },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Помилка оновлення" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Помилка видалення" }, { status: 500 });
  }
}
