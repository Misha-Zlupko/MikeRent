import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

function withUtcHour(date: Date, hour: number) {
  const next = new Date(date);
  next.setUTCHours(hour, 0, 0, 0);
  return next;
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

// POST /api/admin/booking-requests/[id]/confirm
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prismaAny = prisma as typeof prisma & {
      bookingRequest: {
        findUnique: (args: unknown) => Promise<any>;
        update: (args: unknown) => Promise<any>;
      };
    };
    const { id } = await params;
    const request = await prismaAny.bookingRequest.findUnique({
      where: { id },
      include: { apartment: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Заявку не знайдено" }, { status: 404 });
    }

    if (request.status === "CONFIRMED" || request.processedAt) {
      return NextResponse.json(
        { error: "Заявка вже оброблена" },
        { status: 409 },
      );
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        apartmentId: request.apartmentId,
        status: { not: "CANCELLED" },
        dateFrom: { lt: request.checkOut },
        dateTo: { gt: request.checkIn },
      },
      select: { id: true },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Є конфлікт дат із вже існуючим бронюванням" },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          apartmentId: request.apartmentId,
          dateFrom: withUtcHour(new Date(request.checkIn), 14),
          dateTo: withUtcHour(new Date(request.checkOut), 12),
          guestPhone: request.phone,
          guestCount: request.guests,
          guestContact: request.comment,
          status: "CONFIRMED",
          ownerPhone: request.apartment.ownerPhone ?? null,
        },
      });

      await (tx as typeof tx & {
        bookingRequest: { update: (args: unknown) => Promise<any> };
      }).bookingRequest.update({
        where: { id: request.id },
        data: {
          status: "CONFIRMED",
          calledAt: request.calledAt ?? new Date(),
          processedAt: new Date(),
        },
      });

      return booking;
    });

    return NextResponse.json({ success: true, bookingId: result.id });
  } catch (error) {
    console.error("Confirm booking request error:", error);
    return NextResponse.json(
      { error: "Не вдалося підтвердити заявку" },
      { status: 500 },
    );
  }
}
