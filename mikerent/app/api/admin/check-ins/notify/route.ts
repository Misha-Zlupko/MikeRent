import { NextResponse } from "next/server";
import { sendTodayCheckInTelegram } from "@/lib/admin/checkInReminders";
import { requireOwner } from "@/lib/adminAuth";
import { isTelegramConfigured } from "@/lib/telegramNotify";

/** POST /api/admin/check-ins/notify — надіслати нагадування про сьогоднішні заселення */
export async function POST() {
  const session = await requireOwner();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { error: "Telegram не налаштовано (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)" },
      { status: 503 },
    );
  }

  try {
    const result = await sendTodayCheckInTelegram();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Manual check-in notify error:", error);
    return NextResponse.json(
      { error: "Не вдалося надіслати повідомлення" },
      { status: 500 },
    );
  }
}
