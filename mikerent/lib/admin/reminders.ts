import { prisma } from "@/lib/prisma";
import { bookingMoneyToUah } from "@/lib/bookingAmounts";
import { calcPrepaymentTotals } from "@/lib/bookingPrepayment";
import { isActiveBookingStatus } from "@/lib/bookingStatus";
import { agencyBookingWhere } from "@/lib/bookingRecordType";

export type AdminReminder = {
  id: string;
  kind: "checkin_tomorrow" | "owner_call" | "unpaid_balance";
  title: string;
  subtitle: string;
  href: string;
};

function startOfUtcDay(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function addUtcDays(d: Date, days: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export async function getAdminReminders(): Promise<AdminReminder[]> {
  const now = new Date();
  const today = startOfUtcDay(now);
  const tomorrow = addUtcDays(today, 1);
  const dayAfter = addUtcDays(today, 2);
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  const [checkins, apartments, unpaidCandidates] = await Promise.all([
    prisma.booking.findMany({
      where: {
        ...agencyBookingWhere,
        dateFrom: { gte: tomorrow, lt: dayAfter },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      include: { apartment: { select: { title: true } } },
      orderBy: { dateFrom: "asc" },
    }),
    prisma.apartment.findMany({
      select: {
        id: true,
        title: true,
        ownerName: true,
        lastCalledAt: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        ...agencyBookingWhere,
        dateFrom: { gte: today },
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          { paymentStatus: "BALANCE_AT_CHECKIN" },
          { paymentStatus: "PREPAID_RECEIVED" },
          { paymentStatus: "UNPAID" },
        ],
      },
      include: { apartment: { select: { title: true } } },
      take: 80,
      orderBy: { dateFrom: "asc" },
    }),
  ]);

  const out: AdminReminder[] = [];

  for (const b of checkins) {
    if (!isActiveBookingStatus(b.status)) continue;
    out.push({
      id: `checkin-${b.id}`,
      kind: "checkin_tomorrow",
      title: `Заїзд завтра: ${b.guestName || "Гість"}`,
      subtitle: `${b.apartment.title} • ${b.guestPhone || "без тел."}`,
      href: `/admin/bookings/edit/${b.id}`,
    });
  }

  for (const a of apartments) {
    const needsCall =
      !a.lastCalledAt || a.lastCalledAt < twelveHoursAgo;
    if (!needsCall) continue;
    out.push({
      id: `call-${a.id}`,
      kind: "owner_call",
      title: `Прозвон хазяїна: ${a.ownerName || a.title}`,
      subtitle: a.title,
      href: `/admin/apartments/edit/${a.id}`,
    });
  }

  for (const b of unpaidCandidates) {
    if (!isActiveBookingStatus(b.status)) continue;
    if (b.paymentStatus === "PAID_IN_FULL") continue;

    const money = bookingMoneyToUah(b);
    const { remainingToPay } = calcPrepaymentTotals({
      clientTotal: money.clientTotal,
      ownerTotalPrice: money.ownerPayout,
      ourProfit: money.ourProfit,
      prepaidToMe: money.prepaidToMe,
      prepaidToOwner: money.prepaidToOwner,
    });
    if (remainingToPay <= 0) continue;

    out.push({
      id: `unpaid-${b.id}`,
      kind: "unpaid_balance",
      title: `Залишок ${remainingToPay} грн: ${b.guestName || "Гість"}`,
      subtitle: `${b.apartment.title} • заїзд ${b.dateFrom.toLocaleDateString("uk-UA")}`,
      href: `/admin/bookings/edit/${b.id}`,
    });
  }

  return out.slice(0, 30);
}
