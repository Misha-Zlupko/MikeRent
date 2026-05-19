import { prisma } from "@/lib/prisma";

export async function writeAuditLog(params: {
  adminEmail: string;
  entityType: "apartment" | "booking" | "admin";
  entityId: string;
  action: string;
  summary: string;
}) {
  await prisma.auditLog.create({
    data: {
      adminEmail: params.adminEmail,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      summary: params.summary.slice(0, 500),
    },
  });
}

export function summarizeBookingChanges(
  before: {
    dateFrom: Date;
    dateTo: Date;
    totalAmount: number | null;
    paymentStatus?: string;
  },
  after: {
    dateFrom: Date;
    dateTo: Date;
    totalAmount: number | null;
    paymentStatus?: string;
  },
): string | null {
  const parts: string[] = [];
  const df = before.dateFrom.toISOString().slice(0, 10);
  const dt = before.dateTo.toISOString().slice(0, 10);
  const df2 = after.dateFrom.toISOString().slice(0, 10);
  const dt2 = after.dateTo.toISOString().slice(0, 10);
  if (df !== df2 || dt !== dt2) {
    parts.push(`дати ${df}–${dt} → ${df2}–${dt2}`);
  }
  if (before.totalAmount !== after.totalAmount) {
    parts.push(`сума ${before.totalAmount ?? "—"} → ${after.totalAmount ?? "—"}`);
  }
  if (
    before.paymentStatus &&
    after.paymentStatus &&
    before.paymentStatus !== after.paymentStatus
  ) {
    parts.push(`оплата ${before.paymentStatus} → ${after.paymentStatus}`);
  }
  return parts.length ? parts.join("; ") : null;
}

export function summarizeApartmentPriceChanges(
  beforeAvail: unknown,
  afterAvail: unknown,
): string | null {
  const pick = (a: unknown) => {
    if (!a || typeof a !== "object") return null;
    const o = a as {
      monthlyPrices?: Record<string, number>;
      season?: { from?: string; to?: string };
    };
    return {
      monthlyPrices: o.monthlyPrices ?? {},
      seasonFrom: o.season?.from ?? "",
      seasonTo: o.season?.to ?? "",
    };
  };
  const b = pick(beforeAvail);
  const n = pick(afterAvail);
  if (!b || !n) return null;
  const parts: string[] = [];
  if (b.seasonFrom !== n.seasonFrom || b.seasonTo !== n.seasonTo) {
    parts.push(`сезон ${b.seasonFrom}–${b.seasonTo} → ${n.seasonFrom}–${n.seasonTo}`);
  }
  const months = new Set([
    ...Object.keys(b.monthlyPrices),
    ...Object.keys(n.monthlyPrices),
  ]);
  const priceChanges: string[] = [];
  for (const m of months) {
    if (b.monthlyPrices[m] !== n.monthlyPrices[m]) {
      priceChanges.push(`${m}: ${b.monthlyPrices[m] ?? "—"}→${n.monthlyPrices[m] ?? "—"}`);
    }
  }
  if (priceChanges.length) {
    parts.push(`ціни (${priceChanges.slice(0, 4).join(", ")}${priceChanges.length > 4 ? "…" : ""})`);
  }
  return parts.length ? parts.join("; ") : null;
}
