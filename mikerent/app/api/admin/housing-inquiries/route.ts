import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await prisma.housingInquiry.findMany({
    where: { status: { in: ["NEW", "CALLED"] } },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ inquiries });
}
