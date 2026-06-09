import { prisma } from "@/lib/prisma";
import { bookingMoneyToUah } from "@/lib/bookingAmounts";
import { calcPrepaymentTotals } from "@/lib/bookingPrepayment";
import { isActiveBookingStatus } from "@/lib/bookingStatus";
import { getBookingTripPhase } from "@/lib/bookingTripPhase";
import { agencyBookingWhere } from "@/lib/bookingRecordType";
import { calendarDateKyiv } from "@/lib/dates/ukraine";
import {
  getNbuUsdRateForKyivDate,
  uahToUsd,
} from "@/lib/nbuExchangeRate";

export type EarningsBookingRow = {
  id: string;
  apartmentTitle: string;
  guestName: string | null;
  phase: "completed" | "active" | "upcoming";
  dateFrom: string;
  dateTo: string;
  clientTotal: number;
  ourProfit: number;
  receivedToMe: number;
  remainingToCollect: number;
  ourProfitPending: number;
  paymentStatusLabel: string;
  nbuRate: number | null;
  nbuRateDate: string | null;
  nbuRateEstimate: boolean;
  ourProfitUsd: number | null;
  receivedToMeUsd: number | null;
  ourProfitPendingUsd: number | null;
};

export type EarningsUsdSummary = {
  /** Поточний курс НБУ (для довідки) */
  currentNbuRate: number | null;
  currentNbuRateDate: string | null;
  /** Середньозважений курс по вже отриманих (UAH / USD) */
  receivedEffectiveRate: number | null;
  /** Чи всі броні мають курс (false — суми без урахування частини броней) */
  complete: boolean;
  receivedToMe: number;
  pendingClientRemaining: number;
  pendingOurProfit: number;
  completedOurProfit: number;
  upcomingOurProfit: number;
  activeOurProfit: number;
  totalOurProfit: number;
};

export type EarningsOverview = {
  /** Передоплата, яку вже отримав MikeRent (усі активні броні) */
  receivedToMe: number;
  /** Передоплата разом: нам + хазяїнам */
  receivedPrepaidTotal: number;
  /** Скільки клієнти ще мають доплатити (активні + майбутні) */
  pendingClientRemaining: number;
  /** Наш заробіток, який ще не отримали (при заїзді) */
  pendingOurProfit: number;
  /** Повна сума броней, що ще не завершились */
  pendingBookingsVolume: number;
  pendingBookingsCount: number;
  /** Заробіток по завершених поїздках */
  completedOurProfit: number;
  completedReceivedToMe: number;
  completedCount: number;
  /** Майбутні заїзди */
  upcomingOurProfit: number;
  upcomingClientTotal: number;
  upcomingCount: number;
  /** Зараз живуть у квартирі */
  activeCount: number;
  activeOurProfit: number;
  /** Усього по активних бронях */
  totalOurProfit: number;
  totalClientVolume: number;
  activeBookingsCount: number;
  pendingRows: EarningsBookingRow[];
  upcomingRows: EarningsBookingRow[];
  completedRows: EarningsBookingRow[];
  usd: EarningsUsdSummary;
};

function roundUah(n: number) {
  return Math.round(n * 100) / 100;
}

function roundUsd(n: number) {
  return Math.round(n * 100) / 100;
}

function sumUsdPartial(values: (number | null)[]): { value: number; complete: boolean } {
  let total = 0;
  let complete = values.length > 0;
  for (const v of values) {
    if (v == null) {
      complete = false;
      continue;
    }
    total += v;
  }
  return { value: roundUsd(total), complete };
}

function enrichRowWithUsd(
  row: Omit<
    EarningsBookingRow,
    | "nbuRate"
    | "nbuRateDate"
    | "nbuRateEstimate"
    | "ourProfitUsd"
    | "receivedToMeUsd"
    | "ourProfitPendingUsd"
  >,
  rateInfo: { rate: number; rateDate: string; isEstimate: boolean } | null,
): EarningsBookingRow {
  if (!rateInfo) {
    return {
      ...row,
      nbuRate: null,
      nbuRateDate: null,
      nbuRateEstimate: false,
      ourProfitUsd: null,
      receivedToMeUsd: null,
      ourProfitPendingUsd: null,
    };
  }

  return {
    ...row,
    nbuRate: rateInfo.rate,
    nbuRateDate: rateInfo.rateDate,
    nbuRateEstimate: rateInfo.isEstimate,
    ourProfitUsd: uahToUsd(row.ourProfit, rateInfo.rate),
    receivedToMeUsd: uahToUsd(row.receivedToMe, rateInfo.rate),
    ourProfitPendingUsd: uahToUsd(row.ourProfitPending, rateInfo.rate),
  };
}

const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "Не оплачено",
  PREPAID_RECEIVED: "Передоплата",
  BALANCE_AT_CHECKIN: "Доплата при заїзді",
  PAID_IN_FULL: "Оплачено повністю",
};

export async function getEarningsOverview(): Promise<EarningsOverview> {
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: agencyBookingWhere,
    include: { apartment: { select: { title: true } } },
    orderBy: { dateFrom: "asc" },
  });

  let receivedToMe = 0;
  let receivedPrepaidTotal = 0;
  let pendingClientRemaining = 0;
  let pendingOurProfit = 0;
  let pendingBookingsVolume = 0;
  let pendingBookingsCount = 0;
  let completedOurProfit = 0;
  let completedReceivedToMe = 0;
  let completedCount = 0;
  let upcomingOurProfit = 0;
  let upcomingClientTotal = 0;
  let upcomingCount = 0;
  let activeCount = 0;
  let activeOurProfit = 0;
  let totalOurProfit = 0;
  let totalClientVolume = 0;
  let activeBookingsCount = 0;

  const pendingRowsRaw: Omit<
    EarningsBookingRow,
    | "nbuRate"
    | "nbuRateDate"
    | "nbuRateEstimate"
    | "ourProfitUsd"
    | "receivedToMeUsd"
    | "ourProfitPendingUsd"
  >[] = [];
  const upcomingRowsRaw: typeof pendingRowsRaw = [];
  const completedRowsRaw: typeof pendingRowsRaw = [];

  for (const b of bookings) {
    if (!isActiveBookingStatus(b.status)) continue;
    if (b.status !== "CONFIRMED" && b.status !== "PENDING") continue;

    activeBookingsCount += 1;

    const money = bookingMoneyToUah(b);
    const totals = calcPrepaymentTotals({
      clientTotal: money.clientTotal,
      ownerTotalPrice: money.ownerPayout,
      ourProfit: money.ourProfit,
      prepaidToMe: money.prepaidToMe,
      prepaidToOwner: money.prepaidToOwner,
    });

    const phase = getBookingTripPhase(b.dateFrom, b.dateTo, now);
    const paymentStatusLabel =
      PAYMENT_LABELS[b.paymentStatus] ?? b.paymentStatus;

    receivedToMe += money.prepaidToMe;
    receivedPrepaidTotal += money.prepaidToMe + money.prepaidToOwner;
    totalOurProfit += money.ourProfit;
    totalClientVolume += money.clientTotal;

    const row = {
      id: b.id,
      apartmentTitle: b.apartment.title,
      guestName: b.guestName,
      phase,
      dateFrom: b.dateFrom.toISOString(),
      dateTo: b.dateTo.toISOString(),
      clientTotal: money.clientTotal,
      ourProfit: money.ourProfit,
      receivedToMe: money.prepaidToMe,
      remainingToCollect: totals.remainingToPay,
      ourProfitPending: totals.myDueAtCheckin,
      paymentStatusLabel,
    };

    if (phase === "completed") {
      completedCount += 1;
      completedOurProfit += money.ourProfit;
      completedReceivedToMe += money.prepaidToMe;
      completedRowsRaw.push(row);
      continue;
    }

    pendingBookingsCount += 1;
    pendingClientRemaining += totals.remainingToPay;
    pendingOurProfit += totals.myDueAtCheckin;
    pendingBookingsVolume += money.clientTotal;
    pendingRowsRaw.push(row);

    if (phase === "upcoming") {
      upcomingCount += 1;
      upcomingOurProfit += money.ourProfit;
      upcomingClientTotal += money.clientTotal;
      upcomingRowsRaw.push(row);
    } else {
      activeCount += 1;
      activeOurProfit += money.ourProfit;
    }
  }

  const todayKyiv = calendarDateKyiv(now);
  const currentNbu = await getNbuUsdRateForKyivDate(todayKyiv);

  // upcomingRowsRaw — підмножина pendingRowsRaw; для підсумків USD/UAH — без дублікатів
  const allRaw = [...pendingRowsRaw, ...completedRowsRaw];
  const uniqueCheckInDays = [
    ...new Set(allRaw.map((row) => calendarDateKyiv(new Date(row.dateFrom)))),
  ];

  const rateByCheckInDay = new Map<
    string,
    { rate: number; rateDate: string; isEstimate: boolean }
  >();

  await Promise.all(
    uniqueCheckInDays.map(async (checkInDay) => {
      if (checkInDay > todayKyiv && currentNbu) {
        rateByCheckInDay.set(checkInDay, { ...currentNbu, isEstimate: true });
        return;
      }
      const historical = await getNbuUsdRateForKyivDate(checkInDay);
      if (historical) {
        rateByCheckInDay.set(checkInDay, { ...historical, isEstimate: false });
      }
    }),
  );

  const rateForRow = (dateFromIso: string) => {
    const checkInDay = calendarDateKyiv(new Date(dateFromIso));
    return rateByCheckInDay.get(checkInDay) ?? null;
  };

  const enrich = (row: (typeof pendingRowsRaw)[number]) =>
    enrichRowWithUsd(row, rateForRow(row.dateFrom));

  const pendingRows = pendingRowsRaw.map(enrich);
  const upcomingRows = upcomingRowsRaw.map(enrich);
  const completedRows = completedRowsRaw.map(enrich);
  const allEnriched = allRaw.map(enrich);

  const receivedUsd = sumUsdPartial(allEnriched.map((r) => r.receivedToMeUsd));
  const pendingClientUsd = sumUsdPartial(
    pendingRows.map((r) =>
      r.nbuRate ? uahToUsd(r.remainingToCollect, r.nbuRate) : null,
    ),
  );
  const pendingProfitUsd = sumUsdPartial(pendingRows.map((r) => r.ourProfitPendingUsd));
  const completedProfitUsd = sumUsdPartial(completedRows.map((r) => r.ourProfitUsd));
  const upcomingProfitUsd = sumUsdPartial(upcomingRows.map((r) => r.ourProfitUsd));
  const activeProfitUsd = sumUsdPartial(
    pendingRows.filter((r) => r.phase === "active").map((r) => r.ourProfitUsd),
  );
  const totalProfitUsd = sumUsdPartial(allEnriched.map((r) => r.ourProfitUsd));

  const usdComplete =
    receivedUsd.complete &&
    pendingClientUsd.complete &&
    pendingProfitUsd.complete &&
    completedProfitUsd.complete &&
    upcomingProfitUsd.complete &&
    activeProfitUsd.complete &&
    totalProfitUsd.complete;

  const usd: EarningsUsdSummary = {
    currentNbuRate: currentNbu?.rate ?? null,
    currentNbuRateDate: currentNbu?.rateDate ?? null,
    receivedEffectiveRate:
      receivedUsd.value > 0
        ? roundUah(receivedToMe / receivedUsd.value)
        : null,
    complete: usdComplete,
    receivedToMe: receivedUsd.value,
    pendingClientRemaining: pendingClientUsd.value,
    pendingOurProfit: pendingProfitUsd.value,
    completedOurProfit: completedProfitUsd.value,
    upcomingOurProfit: upcomingProfitUsd.value,
    activeOurProfit: activeProfitUsd.value,
    totalOurProfit: totalProfitUsd.value,
  };

  return {
    receivedToMe: roundUah(receivedToMe),
    receivedPrepaidTotal: roundUah(receivedPrepaidTotal),
    pendingClientRemaining: roundUah(pendingClientRemaining),
    pendingOurProfit: roundUah(pendingOurProfit),
    pendingBookingsVolume: roundUah(pendingBookingsVolume),
    pendingBookingsCount,
    completedOurProfit: roundUah(completedOurProfit),
    completedReceivedToMe: roundUah(completedReceivedToMe),
    completedCount,
    upcomingOurProfit: roundUah(upcomingOurProfit),
    upcomingClientTotal: roundUah(upcomingClientTotal),
    upcomingCount,
    activeCount,
    activeOurProfit: roundUah(activeOurProfit),
    totalOurProfit: roundUah(totalOurProfit),
    totalClientVolume: roundUah(totalClientVolume),
    activeBookingsCount,
    pendingRows: pendingRows.slice(0, 40),
    upcomingRows: upcomingRows.slice(0, 20),
    completedRows: completedRows.slice(-20).reverse(),
    usd,
  };
}
