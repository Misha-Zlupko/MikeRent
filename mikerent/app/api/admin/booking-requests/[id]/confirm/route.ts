import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { hasOverlappingActiveBooking } from "@/lib/bookingOverlap";
import { uahToBookingStored } from "@/lib/bookingAmounts";
import {
  mapBookingFromDb,
  mapBookingRequestFromDb,
  notifyBookingNew,
  notifyBookingRequestConfirmFailed,
} from "@/lib/telegramNotify";

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
    const request = await prisma.bookingRequest.findUnique({
      where: { id },
      include: { apartment: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Заявку не знайдено" }, { status: 404 });
    }

    const notifyPayload = mapBookingRequestFromDb(request);

    if (request.status === "CONFIRMED" || request.processedAt) {
      return NextResponse.json(
        { error: "Заявка вже оброблена" },
        { status: 409 },
      );
    }

    const checkInUtc = withUtcHour(new Date(request.checkIn), 14);
    const checkOutUtc = withUtcHour(new Date(request.checkOut), 12);
    const conflict = await hasOverlappingActiveBooking({
      apartmentId: request.apartmentId,
      dateFrom: checkInUtc,
      dateTo: checkOutUtc,
    });

    if (conflict) {
      await notifyBookingRequestConfirmFailed(
        notifyPayload,
        "Конфлікт дат — на ці дати вже є активне бронювання",
      );
      return NextResponse.json(
        { error: "Є конфлікт дат із вже існуючим бронюванням" },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          apartmentId: request.apartmentId,
          dateFrom: checkInUtc,
          dateTo: checkOutUtc,
          guestPhone: request.phone,
          guestCount: request.guests,
          guestContact: request.comment,
          status: "CONFIRMED",
          ownerPhone: request.apartment.ownerPhone ?? null,
          totalAmount: uahToBookingStored(request.totalPrice),
        },
        include: { apartment: true },
      });

      await tx.bookingRequest.update({
        where: { id: request.id },
        data: {
          status: "CONFIRMED",
          calledAt: request.calledAt ?? new Date(),
          processedAt: new Date(),
        },
      });

      return booking;
    });

    await notifyBookingNew(
      mapBookingFromDb(result, result.apartment, "Підтвердження заявки", {
        bookingRequestNumber: request.bookingNumber,
      }),
    );

    return NextResponse.json({ success: true, bookingId: result.id });
  } catch (error) {
    console.error("Confirm booking request error:", error);
    return NextResponse.json(
      { error: "Не вдалося підтвердити заявку" },
      { status: 500 },
    );
  }
}
