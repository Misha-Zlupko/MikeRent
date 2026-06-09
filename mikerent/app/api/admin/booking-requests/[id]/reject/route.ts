import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  APARTMENT_TELEGRAM_SELECT,
  mapBookingRequestFromDb,
  notifyBookingRequestProcessed,
} from "@/lib/telegramNotify";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

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
    const request = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
      },
      include: { apartment: { select: APARTMENT_TELEGRAM_SELECT } },
    });

    await notifyBookingRequestProcessed(
      mapBookingRequestFromDb(request),
      "REJECTED",
    );

    return NextResponse.json({ id: request.id, status: request.status });
  } catch (error) {
    console.error("Reject booking request error:", error);
    return NextResponse.json(
      { error: "Не вдалося відхилити заявку" },
      { status: 500 },
    );
  }
}
