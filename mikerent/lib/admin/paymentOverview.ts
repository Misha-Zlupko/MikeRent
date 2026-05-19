import { prisma } from "@/lib/prisma";
import { getBookingPaymentInfo } from "@/lib/bookingPaymentDisplay";
import { isActiveBookingStatus } from "@/lib/bookingStatus";

export type PaymentOverviewRow = {
  id: string;
  guestName: string | null;
  apartmentTitle: string;
  dateFrom: string;
  dateTo: string;
  clientTotal: number;
  paidAmount: number;
  remainingToPay: number;
  paymentStatusLabel: string;
  isFullyPaid: boolean;
  isCheckedIn: boolean;
};

export async function getPaymentOverview(): Promise<{
  checkedInUnpaid: PaymentOverviewRow[];
  upcomingUnpaid: PaymentOverviewRow[];
  allUnpaidCount: number;
}> {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: { status: { in: ["CONFIRMED", "PENDING"] } },
    include: { apartment: { select: { title: true } } },
    orderBy: { dateFrom: "asc" },
  });

  const checkedInUnpaid: PaymentOverviewRow[] = [];
  const upcomingUnpaid: PaymentOverviewRow[] = [];

  for (const b of bookings) {
    if (!isActiveBookingStatus(b.status)) continue;

    const info = getBookingPaymentInfo({
      dateFrom: b.dateFrom,
      dateTo: b.dateTo,
      totalAmount: b.totalAmount,
      ownerPayout: b.ownerPayout,
      ourProfit: b.ourProfit,
      prepaidToMe: b.prepaidToMe,
      prepaidToOwner: b.prepaidToOwner,
      paymentStatus: b.paymentStatus,
      now,
    });

    if (info.isFullyPaid) continue;

    const row: PaymentOverviewRow = {
      id: b.id,
      guestName: b.guestName,
      apartmentTitle: b.apartment.title,
      dateFrom: b.dateFrom.toISOString(),
      dateTo: b.dateTo.toISOString(),
      clientTotal: info.clientTotal,
      paidAmount: info.paidAmount,
      remainingToPay: info.remainingToPay,
      paymentStatusLabel: info.paymentStatusLabel,
      isFullyPaid: info.isFullyPaid,
      isCheckedIn: info.isCheckedIn,
    };

    if (info.isCheckedIn) {
      checkedInUnpaid.push(row);
    } else if (!info.isPast) {
      upcomingUnpaid.push(row);
    }
  }

  return {
    checkedInUnpaid,
    upcomingUnpaid,
    allUnpaidCount: checkedInUnpaid.length + upcomingUnpaid.length,
  };
}
