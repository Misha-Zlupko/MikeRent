import { prisma } from "@/lib/prisma";

function startOfTodayUtc() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export type WorkerDayActivity = {
  adminEmail: string;
  name: string | null;
  apartmentsCreated: { entityId: string; summary: string; at: string }[];
  calls: { entityId: string; summary: string; at: string }[];
  bookings: { entityId: string; summary: string; at: string }[];
  other: { action: string; summary: string; at: string }[];
  totals: {
    apartments: number;
    calls: number;
    bookings: number;
    actions: number;
  };
};

export async function getWorkerActivityToday() {
  const since = startOfTodayUtc();

  const [workers, logs] = await Promise.all([
    prisma.admin.findMany({
      where: { role: "WORKER" },
      select: { email: true, name: true },
    }),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const workerEmails = new Set(workers.map((w) => w.email));
  const byEmail = new Map<string, WorkerDayActivity>();

  for (const w of workers) {
    byEmail.set(w.email, {
      adminEmail: w.email,
      name: w.name,
      apartmentsCreated: [],
      calls: [],
      bookings: [],
      other: [],
      totals: { apartments: 0, calls: 0, bookings: 0, actions: 0 },
    });
  }

  for (const log of logs) {
    if (!workerEmails.has(log.adminEmail)) continue;
    const row = byEmail.get(log.adminEmail)!;
    const item = {
      entityId: log.entityId,
      summary: log.summary,
      at: log.createdAt.toISOString(),
    };
    row.totals.actions += 1;

    if (log.entityType === "apartment" && log.action === "create") {
      row.apartmentsCreated.push(item);
      row.totals.apartments += 1;
    } else if (log.action === "call_check") {
      row.calls.push(item);
      row.totals.calls += 1;
    } else if (log.entityType === "booking") {
      row.bookings.push(item);
      row.totals.bookings += 1;
    } else {
      row.other.push({
        action: log.action,
        summary: log.summary,
        at: item.at,
      });
    }
  }

  const apartmentsToday = await prisma.apartment.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    since: since.toISOString(),
    workers: Array.from(byEmail.values()),
    apartmentsCreatedToday: apartmentsToday,
  };
}
