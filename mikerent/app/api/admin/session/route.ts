import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  canDeleteApartments,
  canDeleteBookings,
  canDownloadBackup,
  canManageWorkers,
  canViewWorkerActivity,
} from "@/lib/adminPermissions";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    email: session.email,
    name: session.name,
    role: session.role,
    permissions: {
      canDeleteApartments: canDeleteApartments(session),
      canDeleteBookings: canDeleteBookings(session),
      canDownloadBackup: canDownloadBackup(session),
      canManageWorkers: canManageWorkers(session),
      canViewWorkerActivity: canViewWorkerActivity(session),
    },
  });
}
