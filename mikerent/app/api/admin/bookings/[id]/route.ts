import { NextResponse } from "next/server";
import type {
  BookingRecordType,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { hasOverlappingActiveBooking } from "@/lib/bookingOverlap";
import { getAdminEmail, getAdminSession, requireOwner } from "@/lib/adminAuth";
import { summarizeBookingChanges, writeAuditLog } from "@/lib/admin/audit";
import { upsertGuestFromBooking } from "@/lib/admin/guest";
import {
  isAgencyBooking,
  parseBookingRecordType,
} from "@/lib/bookingRecordType";

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

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "REJECTED"] as const;

// PATCH /api/admin/bookings/[id] — зміна лише статусу (скасування / відновлення)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const status = body?.status as string | undefined;

    if (
      (status === "CANCELLED" || status === "REJECTED") &&
      session.role !== "OWNER"
    ) {
      return NextResponse.json(
        { error: "Скасувати або видалити бронювання може лише власник" },
        { status: 403 },
      );
    }

    if (!BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
      return NextResponse.json(
        { error: "Невідомий статус бронювання" },
        { status: 400 },
      );
    }

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (status === "CONFIRMED" || status === "PENDING") {
      const overlaps = await hasOverlappingActiveBooking({
        apartmentId: existing.apartmentId,
        dateFrom: existing.dateFrom,
        dateTo: existing.dateTo,
        excludeBookingId: id,
      });
      if (overlaps) {
        return NextResponse.json(
          {
            error:
              "Є перетин з іншим активним бронюванням на ці дати — змініть дати або скасуйте інше бронювання.",
          },
          { status: 409 },
        );
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status as BookingStatus },
      include: { apartment: true },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("PATCH booking error:", error);
    return NextResponse.json(
      { error: "Помилка оновлення статусу" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/bookings/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const apartmentId =
      typeof data.apartmentId === "string" && data.apartmentId
        ? data.apartmentId
        : existing.apartmentId;
    const dateFrom =
      data.dateFrom != null && String(data.dateFrom).length > 0
        ? withUtcHour(data.dateFrom, 14)
        : existing.dateFrom;
    const dateTo =
      data.dateTo != null && String(data.dateTo).length > 0
        ? withUtcHour(data.dateTo, 12)
        : existing.dateTo;

    const rawStatus = data.status;
    const status = BOOKING_STATUSES.includes(
      rawStatus as (typeof BOOKING_STATUSES)[number],
    )
      ? rawStatus
      : "CONFIRMED";

    if (
      (status === "CANCELLED" || status === "REJECTED") &&
      session.role !== "OWNER"
    ) {
      return NextResponse.json(
        { error: "Скасувати бронювання може лише власник" },
        { status: 403 },
      );
    }

    if (status === "CONFIRMED" || status === "PENDING") {
      const overlaps = await hasOverlappingActiveBooking({
        apartmentId,
        dateFrom,
        dateTo,
        excludeBookingId: id,
      });
      if (overlaps) {
        return NextResponse.json(
          {
            error:
              "Є перетин з іншим активним бронюванням на ці дати — змініть дати або скасуйте інше бронювання.",
          },
          { status: 409 },
        );
      }
    }

    const paymentStatus = (data.paymentStatus as PaymentStatus) || existing.paymentStatus;
    const recordType =
      parseBookingRecordType(data.recordType) ?? existing.recordType;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        apartmentId,
        dateFrom,
        dateTo,
        recordType,
        guestName: data.guestName || null,
        guestPhone: data.guestPhone || null,
        guestCount: data.guestCount ? Number(data.guestCount) : null,
        guestContact: data.guestContact || null,
        totalAmount: data.totalAmount != null ? Number(data.totalAmount) : null,
        ownerPayout: data.ownerPayout != null ? Number(data.ownerPayout) : null,
        ourProfit: data.ourProfit != null ? Number(data.ourProfit) : null,
        prepaidToMe:
          data.prepaidToMe != null ? Number(data.prepaidToMe) : null,
        prepaidToOwner:
          data.prepaidToOwner != null ? Number(data.prepaidToOwner) : null,
        paymentStatus,
        ownerPhone: data.ownerPhone || null,
        status: status as BookingStatus,
      },
      include: { apartment: true },
    });

    if (isAgencyBooking(recordType)) {
      await upsertGuestFromBooking({
        guestPhone: data.guestPhone,
        guestName: data.guestName,
        guestNotes: data.guestNotes,
      });
    }

    const changeSummary = summarizeBookingChanges(
      {
        dateFrom: existing.dateFrom,
        dateTo: existing.dateTo,
        totalAmount: existing.totalAmount,
        paymentStatus: existing.paymentStatus,
      },
      {
        dateFrom: booking.dateFrom,
        dateTo: booking.dateTo,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
      },
    );
    if (changeSummary) {
      const adminEmail = (await getAdminEmail()) ?? "admin";
      await writeAuditLog({
        adminEmail,
        entityType: "booking",
        entityId: id,
        action: "update",
        summary: changeSummary,
      });
    }

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
  const session = await requireOwner();
  if (!session) {
    return NextResponse.json(
      { error: "Видалення бронювань доступне лише власнику" },
      { status: 403 },
    );
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
