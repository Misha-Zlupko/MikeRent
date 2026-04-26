import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// POST /api/booking-requests
export async function POST(req: Request) {
  try {
    const prismaAny = prisma as typeof prisma & {
      bookingRequest: {
        create: (args: unknown) => Promise<any>;
      };
    };
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

    const generatedNumber = generateBookingNumber();
    const bookingRequest = await prismaAny.bookingRequest.create({
      data: {
        bookingNumber: generatedNumber,
        apartmentId: String(data.apartmentId),
        phone: String(data.phone),
        comment: data.comment ? String(data.comment) : null,
        guests: Number(data.guests) || 1,
        nights: Number(data.nights) || 1,
        checkIn,
        checkOut,
        totalPrice: Number(data.totalPrice) || 0,
      },
      include: {
        apartment: {
          select: { title: true },
        },
      },
    });

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `
📞 НОВА ЗАЯВКА НА БРОНЮВАННЯ

🏢 Апартаменти: ${bookingRequest.apartment.title}
📋 Номер заявки: ${bookingRequest.bookingNumber}

📱 Телефон: ${bookingRequest.phone}
💬 Коментар: ${bookingRequest.comment || "Без коментаря"}

📅 Дати:
Заїзд: ${bookingRequest.checkIn.toLocaleDateString("uk-UA")}
Виїзд: ${bookingRequest.checkOut.toLocaleDateString("uk-UA")}
Ночей: ${bookingRequest.nights}

👥 Гостей: ${bookingRequest.guests}
💰 Сума: ${bookingRequest.totalPrice} ₴
      `.trim();

      void fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
      }).catch((error) => {
        console.error("Telegram notify error:", error);
      });
    }

    return NextResponse.json(
      {
        success: true,
        bookingNumber: bookingRequest.bookingNumber,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booking request error:", error);
    return NextResponse.json({ error: "Помилка створення заявки" }, { status: 500 });
  }
}
