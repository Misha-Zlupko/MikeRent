import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { upsertGuestFromBooking } from "@/lib/admin/guest";

export async function PUT(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const guest = await upsertGuestFromBooking({
      guestPhone: data.guestPhone,
      guestName: data.guestName,
      guestNotes: data.notes,
    });
    return NextResponse.json(guest);
  } catch (error) {
    console.error("Guest update error:", error);
    return NextResponse.json({ error: "Помилка збереження" }, { status: 500 });
  }
}
