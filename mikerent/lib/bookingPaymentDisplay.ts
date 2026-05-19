import type { PaymentStatus } from "@prisma/client";
import { bookingStoredToUah } from "@/lib/bookingAmounts";
import { calcPrepaymentTotals } from "@/lib/bookingPrepayment";
import { PAYMENT_STATUS_LABELS } from "@/lib/paymentStatus";

export type BookingPaymentInfo = {
  clientTotal: number;
  paidAmount: number;
  remainingToPay: number;
  ownerDueAtCheckin: number;
  myDueAtCheckin: number;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  isFullyPaid: boolean;
  isCheckedIn: boolean;
  isPast: boolean;
};

export function getBookingPaymentInfo(params: {
  dateFrom: Date | string;
  dateTo: Date | string;
  totalAmount: number | null;
  ownerPayout: number | null;
  ourProfit: number | null;
  prepaidToMe: number | null;
  prepaidToOwner: number | null;
  paymentStatus: PaymentStatus;
  now?: Date;
}): BookingPaymentInfo {
  const now = params.now ?? new Date();
  const from = new Date(params.dateFrom);
  const to = new Date(params.dateTo);

  const clientTotal = bookingStoredToUah(params.totalAmount) ?? 0;
  const ownerTotal = bookingStoredToUah(params.ownerPayout) ?? 0;
  const profit = bookingStoredToUah(params.ourProfit) ?? 0;
  const prepaidToMe = bookingStoredToUah(params.prepaidToMe) ?? 0;
  const prepaidToOwner = bookingStoredToUah(params.prepaidToOwner) ?? 0;

  const totals = calcPrepaymentTotals({
    clientTotal,
    ownerTotalPrice: ownerTotal,
    ourProfit: profit,
    prepaidToMe,
    prepaidToOwner,
  });

  const isCheckedIn = from <= now && to >= now;
  const isPast = to < now;
  const isFullyPaid =
    params.paymentStatus === "PAID_IN_FULL" || totals.remainingToPay <= 0;

  return {
    clientTotal,
    paidAmount: totals.paidAmount,
    remainingToPay: totals.remainingToPay,
    ownerDueAtCheckin: totals.ownerDueAtCheckin,
    myDueAtCheckin: totals.myDueAtCheckin,
    paymentStatus: params.paymentStatus,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[params.paymentStatus],
    isFullyPaid,
    isCheckedIn,
    isPast,
  };
}
