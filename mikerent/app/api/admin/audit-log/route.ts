import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(50, Number(searchParams.get("take")) || 20);

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json(logs);
}
