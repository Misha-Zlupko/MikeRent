import { calcPrepaymentTotals } from "@/lib/bookingPrepayment";

type Props = {
  clientTotal: number;
  ownerTotalPrice: number;
  ourProfit: number;
  prepaidToMe: number;
  prepaidToOwner: number;
};

export default function TotalSummary({
  clientTotal,
  ownerTotalPrice,
  ourProfit,
  prepaidToMe,
  prepaidToOwner,
}: Props) {
  const {
    paidAmount,
    ownerDueAtCheckin,
    myDueAtCheckin,
    remainingToPay,
  } = calcPrepaymentTotals({
    clientTotal,
    ownerTotalPrice,
    ourProfit,
    prepaidToMe,
    prepaidToOwner,
  });

  return (
    <div className="mt-6 rounded-lg bg-gray-100 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Всього до сплати:</p>
          <p className="text-lg font-bold">{clientTotal.toFixed(2)} грн</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Вже сплачено (передоплата):</p>
          <p className="text-lg font-bold text-green-600">
            {paidAmount.toFixed(2)} грн
          </p>
          <p className="text-xs text-gray-500">
            Я: {prepaidToMe.toFixed(2)} · Хазяїн: {prepaidToOwner.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-300 pt-4">
        <p className="mb-2 text-sm font-medium">При заїзді отримають:</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Хазяїн:</p>
            <p className="text-base font-bold">
              {ownerDueAtCheckin.toFixed(2)} грн
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Я:</p>
            <p className="text-base font-bold text-green-600">
              {myDueAtCheckin.toFixed(2)} грн
            </p>
          </div>
        </div>
      </div>

      <div className="my-3 h-px bg-gray-300" />
      <div className="flex items-center justify-between font-bold text-orange-600">
        <span>ЗАЛИШОК ДО СПЛАТИ:</span>
        <span className="text-xl">{remainingToPay.toFixed(2)} грн</span>
      </div>
    </div>
  );
}
