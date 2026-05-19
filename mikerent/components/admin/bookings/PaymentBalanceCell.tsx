import type { PaymentStatus } from "@prisma/client";
import { getBookingPaymentInfo } from "@/lib/bookingPaymentDisplay";

type Props = {
  dateFrom: string;
  dateTo: string;
  totalAmount: number | null;
  ownerPayout: number | null;
  ourProfit: number | null;
  prepaidToMe: number | null;
  prepaidToOwner: number | null;
  paymentStatus: PaymentStatus;
};

export default function PaymentBalanceCell(props: Props) {
  const info = getBookingPaymentInfo({
    dateFrom: props.dateFrom,
    dateTo: props.dateTo,
    totalAmount: props.totalAmount,
    ownerPayout: props.ownerPayout,
    ourProfit: props.ourProfit,
    prepaidToMe: props.prepaidToMe,
    prepaidToOwner: props.prepaidToOwner,
    paymentStatus: props.paymentStatus,
  });

  if (info.clientTotal <= 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="space-y-1">
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
          info.isFullyPaid
            ? "bg-green-100 text-green-800"
            : info.isCheckedIn
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-900"
        }`}
      >
        {info.paymentStatusLabel}
      </span>
      <p className="text-xs text-gray-600">
        Сплачено: {info.paidAmount.toFixed(0)} грн
      </p>
      {!info.isFullyPaid && (
        <p className="text-sm font-semibold text-orange-600">
          Залишок: {info.remainingToPay.toFixed(0)} грн
        </p>
      )}
      {info.isCheckedIn && !info.isFullyPaid && (
        <p className="text-xs text-red-600">Після заїзду — не закрито</p>
      )}
    </div>
  );
}
