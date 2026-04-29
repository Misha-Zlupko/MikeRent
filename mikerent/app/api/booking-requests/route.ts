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

async function sendTelegramBookingNotification(params: {
  token: string;
  chatId: string;
  message: string;
}) {
  const url = `https://api.telegram.org/bot${params.token}/sendMessage`;

  const sendOnce = async () => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.message,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
  };

  // Простий ретрай на випадок тимчасової помилки Telegram API
  let result = await sendOnce();
  if (!result.response.ok) {
    result = await sendOnce();
  }

  if (!result.response.ok) {
    throw new Error(
      `Telegram API error: ${result.response.status} ${JSON.stringify(result.payload)}`,
    );
  }
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

    let telegramSent = false;

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

      try {
        await sendTelegramBookingNotification({
          token: TELEGRAM_BOT_TOKEN,
          chatId: TELEGRAM_CHAT_ID,
          message,
        });
        telegramSent = true;
      } catch (error) {
        console.error("Telegram notify error:", error);
      }
    } else {
      console.warn(
        "Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing",
      );
    }

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
