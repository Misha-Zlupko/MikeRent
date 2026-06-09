import { prisma } from "@/lib/prisma";
import { bookingMoneyToUah } from "@/lib/bookingAmounts";
import { isActiveBookingStatus } from "@/lib/bookingStatus";
import { agencyBookingWhere } from "@/lib/bookingRecordType";
import { isSameCalendarDayKyiv, formatDateKyiv } from "@/lib/dates/ukraine";
import {
  APARTMENT_TELEGRAM_SELECT,
  notifyDailyCheckIns,
} from "@/lib/telegramNotify";

export type TodayCheckIn = {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  guestCount: number | null;
  clientTotalUah: number;
  ourProfitUah: number;
  dateFrom: Date;
  dateTo: Date;
  apartment: {
    id: string;
    title: string;
    city: string;
    address: string;
    ownerName: string | null;
    ownerPhone: string | null;
  };
  ownerPhone: string | null;
};

export async function getTodayCheckIns(
  now = new Date(),
): Promise<TodayCheckIn[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      ...agencyBookingWhere,
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    include: {
      apartment: { select: APARTMENT_TELEGRAM_SELECT },
    },
    orderBy: { dateFrom: "asc" },
  });

  return bookings
    .filter(
      (b) =>
        isActiveBookingStatus(b.status) &&
        isSameCalendarDayKyiv(b.dateFrom, now),
    )
    .map((b) => {
      const money = bookingMoneyToUah(b);
      const ownerPhone =
        b.apartment.ownerPhone?.trim() || b.ownerPhone?.trim() || null;
      return {
        id: b.id,
        guestName: b.guestName,
        guestPhone: b.guestPhone,
        guestCount: b.guestCount,
        clientTotalUah: money.clientTotal,
        ourProfitUah: money.ourProfit,
        dateFrom: b.dateFrom,
        dateTo: b.dateTo,
        apartment: b.apartment,
        ownerPhone,
      };
    });
}

export function mapCheckInToNotifyItem(b: TodayCheckIn) {
  return {
    apartmentTitle: b.apartment.title,
    apartmentId: b.apartment.id,
    city: b.apartment.city,
    address: b.apartment.address,
    ownerName: b.apartment.ownerName,
    ownerPhone: b.ownerPhone,
    guestName: b.guestName,
    guestPhone: b.guestPhone,
    guestCount: b.guestCount,
    clientTotalUah: b.clientTotalUah,
    ourProfitUah: b.ourProfitUah,
    checkInLabel: b.dateFrom.toLocaleDateString("uk-UA", {
      timeZone: "Europe/Kyiv",
    }),
    checkOutLabel: b.dateTo.toLocaleDateString("uk-UA", {
      timeZone: "Europe/Kyiv",
    }),
  };
}

export async function sendTodayCheckInTelegram(now = new Date()) {
  const checkIns = await getTodayCheckIns(now);
  const dateLabel = todayCheckInsDateLabel(now);

  if (checkIns.length === 0) {
    return {
      sent: false,
      skipped: true,
      reason: "no_check_ins_today" as const,
      dateLabel,
      checkInsCount: 0,
      telegramSent: false,
    };
  }

  const telegramSent = await notifyDailyCheckIns({
    dateLabel,
    items: checkIns.map(mapCheckInToNotifyItem),
  });

  return {
    sent: telegramSent,
    skipped: false,
    reason: null,
    dateLabel,
    checkInsCount: checkIns.length,
    telegramSent,
  };
}

export function todayCheckInsDateLabel(now = new Date()) {
  return formatDateKyiv(now);
}
