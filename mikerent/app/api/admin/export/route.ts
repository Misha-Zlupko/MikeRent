import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import { buildApartmentsCsv, buildBookingsCsv } from "@/lib/admin/exportCsv";
import { normalizeGuestPhone } from "@/lib/phone";
import { agencyBookingWhere } from "@/lib/bookingRecordType";

export async function GET(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "bookings";
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const month = searchParams.get("month");

  try {
    if (type === "apartments") {
      const apartments = await prisma.apartment.findMany({
        orderBy: { title: "asc" },
      });
      const csv = buildApartmentsCsv(apartments);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="apartments-${year}.csv"`,
        },
      });
    }

    const monthNum = month ? Number(month) : null;
    const rangeStart =
      monthNum && monthNum >= 1 && monthNum <= 12
        ? new Date(Date.UTC(year, monthNum - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
    const rangeEnd =
      monthNum && monthNum >= 1 && monthNum <= 12
        ? new Date(Date.UTC(year, monthNum, 0, 23, 59, 59))
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    const bookings = await prisma.booking.findMany({
      where: {
        ...agencyBookingWhere,
        dateFrom: { lte: rangeEnd },
        dateTo: { gte: rangeStart },
      },
      include: { apartment: true },
      orderBy: { dateFrom: "asc" },
    });

    const guests = await prisma.guest.findMany();
    const guestNotes = new Map<string, string>();
    for (const g of guests) {
      if (g.notes) guestNotes.set(g.phoneNormalized, g.notes);
    }
    const notesByRawPhone = new Map<string, string>();
    for (const b of bookings) {
      if (!b.guestPhone) continue;
      const key = normalizeGuestPhone(b.guestPhone);
      const note = guestNotes.get(key);
      if (note) notesByRawPhone.set(b.guestPhone, note);
    }

    const csv = buildBookingsCsv(bookings, notesByRawPhone);
    const suffix = monthNum ? `${year}-${String(monthNum).padStart(2, "0")}` : `${year}`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bookings-${suffix}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Помилка експорту" }, { status: 500 });
  }
}
