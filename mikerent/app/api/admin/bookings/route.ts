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

// GET /api/admin/bookings - отримати всі бронювання
export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        apartment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}

// POST /api/admin/bookings - створити бронювання
export async function POST(req: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const booking = await prisma.booking.create({
      data: {
        apartmentId: data.apartmentId,
        dateFrom: new Date(data.dateFrom),
        dateTo: new Date(data.dateTo),

        // Інформація про гостя
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestCount: data.guestCount ? Number(data.guestCount) : null,
        guestContact: data.guestContact,

        // Фінанси
        totalAmount: data.totalAmount ? Number(data.totalAmount) : null,
        ownerPayout: data.ownerPayout ? Number(data.ownerPayout) : null,
        ourProfit: data.ourProfit ? Number(data.ourProfit) : null,

        // Додатково
        ownerPhone: data.ownerPhone,
        status: data.status || "CONFIRMED",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Помилка створення" }, { status: 500 });
  }
}

// DELETE /api/admin/bookings?apartmentId=xxx - видалити всі бронювання квартири
export async function DELETE(req: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const apartmentId = searchParams.get("apartmentId");

  if (!apartmentId) {
    return NextResponse.json(
      { error: "apartmentId required" },
      { status: 400 },
    );
  }

  try {
    await prisma.booking.deleteMany({
      where: { apartmentId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bookings error:", error);
    return NextResponse.json({ error: "Помилка видалення" }, { status: 500 });
  }
}
