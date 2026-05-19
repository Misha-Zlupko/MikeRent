import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import { exportDatabaseSnapshot } from "@/lib/backup/exportDatabaseSnapshot";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await exportDatabaseSnapshot(prisma);
    const date = snapshot.exportedAt.slice(0, 10);
    const body = JSON.stringify(snapshot, null, 2);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="mikerent-backup-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("backup export:", error);
    return NextResponse.json(
      { error: "Не вдалося створити резервну копію" },
      { status: 500 },
    );
  }
}
