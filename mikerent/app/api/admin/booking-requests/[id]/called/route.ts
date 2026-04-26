import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

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

// POST /api/admin/booking-requests/[id]/called
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prismaAny = prisma as typeof prisma & {
      bookingRequest: {
        update: (args: unknown) => Promise<any>;
      };
    };
    const { id } = await params;
    const request = await prismaAny.bookingRequest.update({
      where: { id },
      data: {
        status: "CALLED",
        calledAt: new Date(),
      },
      select: { id: true, status: true, calledAt: true },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("Mark booking request called error:", error);
    return NextResponse.json(
      { error: "Не вдалося позначити прозвон" },
      { status: 500 },
    );
  }
}
