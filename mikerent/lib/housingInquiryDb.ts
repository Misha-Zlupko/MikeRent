import { prisma } from "@/lib/prisma";

export async function countActiveHousingInquiries(): Promise<number> {
  try {
    return await prisma.housingInquiry.count({
      where: { status: { in: ["NEW", "CALLED"] } },
    });
  } catch (error) {
    console.error("[HousingInquiry] count failed:", error);
    return 0;
  }
}
