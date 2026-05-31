import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateTotalByMonth,
  resolveGuestMonthlyPrices,
  getMissingPriceMonths,
} from "@/lib/monthlyPricing";
import {
  mapBookingRequestFromDb,
  notifyBookingRequestNew,
} from "@/lib/telegramNotify";

function generateBookingNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${y}${m}${d}-${random}`;
}

function parseDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function withUtcHour(date: Date, hour: number) {
  const next = new Date(date);
  next.setUTCHours(hour, 0, 0, 0);
  return next;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const checkInRaw = parseDate(data.checkIn);
    const checkOutRaw = parseDate(data.checkOut);
    const checkIn = checkInRaw ? withUtcHour(checkInRaw, 14) : null;
    const checkOut = checkOutRaw ? withUtcHour(checkOutRaw, 12) : null;

    if (!data.apartmentId || !data.phone || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Не вистачає обов'язкових полів" },
        { status: 400 },
      );
    }

    const apartment = await prisma.apartment.findUnique({
      where: { id: String(data.apartmentId) },
      select: {
        id: true,
        title: true,
        availability: true,
      },
    });

    if (!apartment) {
      return NextResponse.json({ error: "Квартиру не знайдено" }, { status: 404 });
    }

    const monthlyPrices = resolveGuestMonthlyPrices(apartment.availability);
    const missingMonths = getMissingPriceMonths(checkIn, checkOut, monthlyPrices);
    if (missingMonths.length > 0) {
      return NextResponse.json(
        {
          error:
            "Бронювання недоступне: на один або декілька місяців у вибраному періоді не вказана ціна.",
        },
        { status: 400 },
      );
    }

    const calculatedTotalPrice = calculateTotalByMonth(
      checkIn,
      checkOut,
      monthlyPrices,
    );

    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        bookingNumber: generateBookingNumber(),
        apartmentId: String(data.apartmentId),
        phone: String(data.phone),
        comment: data.comment ? String(data.comment) : null,
        guests: Number(data.guests) || 1,
        nights: Number(data.nights) || 1,
        checkIn,
        checkOut,
        totalPrice: calculatedTotalPrice,
      },
      include: {
        apartment: {
          select: { title: true },
        },
      },
    });

    const telegramSent = await notifyBookingRequestNew(
      mapBookingRequestFromDb(bookingRequest),
    );

    return NextResponse.json(
      {
        success: true,
        bookingNumber: bookingRequest.bookingNumber,
        telegramSent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booking request error:", error);
    return NextResponse.json({ error: "Помилка створення заявки" }, { status: 500 });
  }
}
