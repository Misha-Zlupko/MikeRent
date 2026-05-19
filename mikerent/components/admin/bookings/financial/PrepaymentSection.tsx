"use client";

import { calcPrepaymentTotals } from "@/lib/bookingPrepayment";

type Props = {
  prepaidToMe: number;
  prepaidToOwner: number;
  onPrepaidToMeChange: (value: number) => void;
  onPrepaidToOwnerChange: (value: number) => void;
  clientTotal: number;
  ownerTotalPrice: number;
  ourProfit: number;
};

export default function PrepaymentSection({
  prepaidToMe,
  prepaidToOwner,
  onPrepaidToMeChange,
  onPrepaidToOwnerChange,
  clientTotal,
  ownerTotalPrice,
  ourProfit,
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

  const overpaid = paidAmount > clientTotal && clientTotal > 0;

  return (
    <div className="border-t pt-6">
      <h3 className="mb-4 text-lg font-medium">Передоплата від клієнта</h3>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Я отримав (грн)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={prepaidToMe || ""}
            onChange={(e) => onPrepaidToMeChange(Number(e.target.value) || 0)}
            className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ваша частина передоплати / завдатку
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Хазяїн отримав (грн)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={prepaidToOwner || ""}
            onChange={(e) =>
              onPrepaidToOwnerChange(Number(e.target.value) || 0)
            }
            className="w-full rounded border p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500">
            Частина передоплати, яку забрав хазяїн
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Всього передоплата (грн)
          </label>
          <div className="w-full rounded border bg-gray-50 p-2 font-medium text-gray-900">
            {paidAmount.toFixed(2)} грн
          </div>
          <p className="mt-1 text-xs text-gray-500">Сума двох полів вище</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Залишок до сплати при заїзді (грн)
          </label>
          <div className="w-full rounded border bg-gray-100 p-2 font-medium text-gray-900">
            {remainingToPay.toFixed(2)} грн
          </div>
        </div>
      </div>

      {overpaid && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Передоплата ({paidAmount.toFixed(2)} грн) більша за загальну суму
          бронювання ({clientTotal.toFixed(2)} грн). Перевірте суми.
        </div>
      )}

      <div className="mb-4 rounded-lg bg-gray-50 p-4">
        <h4 className="mb-3 font-medium">Розподіл при заїзді:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Хазяїн отримає при заїзді:</span>
            <span className="font-medium">{ownerDueAtCheckin.toFixed(2)} грн</span>
          </div>
          <div className="flex justify-between">
            <span>Я отримаю при заїзді:</span>
            <span className="font-medium text-green-600">
              {myDueAtCheckin.toFixed(2)} грн
            </span>
          </div>
        </div>
      </div>

      {paidAmount > 0 && (
        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
          Клієнт вніс {paidAmount.toFixed(2)} грн: вам{" "}
          {prepaidToMe.toFixed(2)} грн, хазяїну {prepaidToOwner.toFixed(2)} грн.
          При заїзді доплата {remainingToPay.toFixed(2)} грн.
        </div>
      )}
    </div>
  );
}
