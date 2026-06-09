import type { PaymentStatus } from "@prisma/client";
import { bookingMoneyToUah } from "@/lib/bookingAmounts";
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

  const money = bookingMoneyToUah(params);
  const clientTotal = money.clientTotal;
  const ownerTotal = money.ownerPayout;
  const profit = money.ourProfit;
  const prepaidToMe = money.prepaidToMe;
  const prepaidToOwner = money.prepaidToOwner;

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
