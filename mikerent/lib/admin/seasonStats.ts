import { prisma } from "@/lib/prisma";
import { bookingMoneyToUah } from "@/lib/bookingAmounts";
import { isActiveBookingStatus } from "@/lib/bookingStatus";
import { agencyBookingWhere } from "@/lib/bookingRecordType";

export type SeasonMonthStat = {
  month: number;
  label: string;
  bookingsCount: number;
  revenueUah: number;
  ourProfitUah: number;
  bookedNights: number;
  occupancyPct: number;
};

const SEASON_MONTHS = [5, 6, 7, 8, 9] as const;

const MONTH_LABELS: Record<number, string> = {
  5: "Травень",
  6: "Червень",
  7: "Липень",
  8: "Серпень",
  9: "Вересень",
};

function nightsInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function overlapNightsInMonth(
  from: Date,
  to: Date,
  year: number,
  month: number,
): number {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const a = Math.max(from.getTime(), start.getTime());
  const b = Math.min(to.getTime(), end.getTime());
  if (b <= a) return 0;
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

export async function getSeasonDashboardStats(year: number) {
  const apartmentsCount = await prisma.apartment.count();
  const rangeStart = new Date(Date.UTC(year, 4, 1));
  const rangeEnd = new Date(Date.UTC(year, 8, 30, 23, 59, 59));

  const bookings = await prisma.booking.findMany({
    where: {
      ...agencyBookingWhere,
      dateFrom: { lte: rangeEnd },
      dateTo: { gte: rangeStart },
    },
    select: {
      id: true,
      dateFrom: true,
      dateTo: true,
      status: true,
      totalAmount: true,
      ourProfit: true,
    },
  });

  const active = bookings.filter((b) => isActiveBookingStatus(b.status));

  const months: SeasonMonthStat[] = SEASON_MONTHS.map((month) => {
    const inMonth = active.filter((b) => {
      const mStart = new Date(Date.UTC(year, month - 1, 1));
      const mEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      return b.dateFrom <= mEnd && b.dateTo >= mStart;
    });

    let bookedNights = 0;
    let revenueUah = 0;
    let ourProfitUah = 0;

    for (const b of inMonth) {
      const nights = overlapNightsInMonth(b.dateFrom, b.dateTo, year, month);
      bookedNights += nights;
      const money = bookingMoneyToUah(b);
      const total = money.clientTotal;
      const profit = money.ourProfit;
      const tripNights = Math.max(
        1,
        Math.ceil(
          (b.dateTo.getTime() - b.dateFrom.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );
      revenueUah += (total / tripNights) * nights;
      ourProfitUah += (profit / tripNights) * nights;
    }

    const capacity = apartmentsCount * nightsInMonth(year, month);
    const occupancyPct =
      capacity > 0 ? Math.min(100, Math.round((bookedNights / capacity) * 100)) : 0;

    return {
      month,
      label: MONTH_LABELS[month],
      bookingsCount: inMonth.length,
      revenueUah: Math.round(revenueUah),
      ourProfitUah: Math.round(ourProfitUah),
      bookedNights,
      occupancyPct,
    };
  });

  const totals = {
    bookingsCount: active.length,
    revenueUah: months.reduce((s, m) => s + m.revenueUah, 0),
    ourProfitUah: months.reduce((s, m) => s + m.ourProfitUah, 0),
  };

  return { year, apartmentsCount, months, totals };
}
