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

// GET /api/admin/booking-requests
export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prismaAny = prisma as typeof prisma & {
      bookingRequest: {
        findMany: (args: unknown) => Promise<any[]>;
      };
    };
    const requests = await prismaAny.bookingRequest.findMany({
      where: {
        status: {
          in: ["NEW", "CALLED"],
        },
      },
      include: {
        apartment: true,
      },
      orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Load booking requests error:", error);
    return NextResponse.json(
      { error: "Помилка завантаження заявок" },
      { status: 500 },
    );
  }
}
