type Props = {
  clientTotal: number;
  paidAmount: number;
  ownerTotalPrice: number;
  ourProfit: number;
  remainingToPay: number;
  prepaidTo: "me" | "owner";
};

export default function TotalSummary({
  clientTotal,
  paidAmount,
  ownerTotalPrice,
  ourProfit,
  remainingToPay,
  prepaidTo,
}: Props) {
  // Розрахунок хто скільки отримає при заїзді (в гривнях)
  const ownerDueAtCheckin =
    prepaidTo === "me"
      ? ownerTotalPrice
      : Math.max(0, ownerTotalPrice - paidAmount);

  const myDueAtCheckin =
    prepaidTo === "owner" ? ourProfit : Math.max(0, ourProfit - paidAmount);

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Всього до сплати:</p>
          <p className="text-lg font-bold">{clientTotal.toFixed(2)} грн</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Вже сплачено:</p>
          <p className="text-lg font-bold text-green-600">
            {paidAmount.toFixed(2)} грн
          </p>
          <p className="text-xs text-gray-500">
            ({prepaidTo === "me" ? "Мені" : "Хазяїну"})
          </p>
        </div>
      </div>

      {/* Розподіл при заїзді */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-sm font-medium mb-2">При заїзді отримають:</p>
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

      <div className="h-px bg-gray-300 my-3" />
      <div className="flex justify-between items-center text-orange-600 font-bold">
        <span>ЗАЛИШОК ДО СПЛАТИ:</span>
        <span className="text-xl">{remainingToPay.toFixed(2)} грн</span>
      </div>
    </div>
  );
}
