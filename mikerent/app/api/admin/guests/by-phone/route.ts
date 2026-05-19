import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import {
  findGuestByPhone,
  findPastBookingsByPhone,
} from "@/lib/admin/guest";

export async function GET(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.trim() ?? "";
  const excludeBookingId = searchParams.get("excludeBookingId") ?? undefined;

  if (!phone) {
    return NextResponse.json({ guest: null, pastBookings: [] });
  }

  try {
    const [guest, pastBookings] = await Promise.all([
      findGuestByPhone(phone),
      findPastBookingsByPhone(phone, excludeBookingId),
    ]);

    return NextResponse.json({
      guest,
      pastBookings: pastBookings.map((b) => ({
        id: b.id,
        dateFrom: b.dateFrom.toISOString(),
        dateTo: b.dateTo.toISOString(),
        status: b.status,
        guestName: b.guestName,
        apartmentTitle: b.apartment.title,
        city: b.apartment.city,
      })),
    });
  } catch (error) {
    console.error("Guest lookup error:", error);
    return NextResponse.json({ error: "Помилка" }, { status: 500 });
  }
}
