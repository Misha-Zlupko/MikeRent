import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import {
  mapHousingInquiryFromDb,
  notifyHousingInquiryProcessed,
} from "@/lib/telegramNotify";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inquiry = await prisma.housingInquiry.update({
    where: { id },
    data: { status: "COMPLETED", processedAt: new Date() },
  });

  await notifyHousingInquiryProcessed(
    mapHousingInquiryFromDb(inquiry),
    "COMPLETED",
  );

  return NextResponse.json({ success: true });
}
