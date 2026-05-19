import type { AdminSession } from "@/lib/adminAuth";
import { isOwner } from "@/lib/adminAuth";

export function canDeleteApartments(session: AdminSession): boolean {
  return isOwner(session);
}

export function canDeleteBookings(session: AdminSession): boolean {
  return isOwner(session);
}

export function canDownloadBackup(session: AdminSession): boolean {
  return isOwner(session);
}

export function canManageWorkers(session: AdminSession): boolean {
  return isOwner(session);
}

export function canViewWorkerActivity(session: AdminSession): boolean {
  return isOwner(session);
}
