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

// GET /api/admin/bookings
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
    return NextResponse.json(
      { error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}

// POST /api/admin/bookings
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
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestCount: Number(data.guestCount),
        guestContact: data.guestContact,
        totalAmount: data.totalAmount ? Number(data.totalAmount) : null,
        ownerPayout: data.ownerPayout ? Number(data.ownerPayout) : null,
        ourProfit: data.ourProfit ? Number(data.ourProfit) : null,
        ownerPhone: data.ownerPhone,
        status: data.status || "PENDING",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Помилка створення бронювання" },
      { status: 500 },
    );
  }
}
