import { NextResponse } from "next/server";
import { sendTodayCheckInTelegram } from "@/lib/admin/checkInReminders";
import { kyivHour } from "@/lib/dates/ukraine";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const url = new URL(req.url);
  return url.searchParams.get("secret") === secret;
}

/** GET /api/cron/daily-check-ins — щоденне повідомлення в Telegram о заселеннях (00:00 за Києвом) */
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const hourKyiv = kyivHour(now);
  const force = new URL(req.url).searchParams.get("force") === "1";

  if (!force && hourKyiv !== 0) {
    return NextResponse.json({
      skipped: true,
      reason: "Not midnight in Europe/Kyiv",
      hourKyiv,
    });
  }

  try {
    const result = await sendTodayCheckInTelegram(now);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Daily check-in cron error:", error);
    return NextResponse.json(
      { error: "Failed to send daily check-in reminder" },
      { status: 500 },
    );
  }
}
