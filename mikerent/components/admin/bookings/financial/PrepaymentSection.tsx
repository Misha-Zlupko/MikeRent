"use client";

import { User, Home } from "lucide-react";

type Props = {
  paidAmount: number;
  onPaidAmountChange: (value: number) => void;
  remainingToPay: number;
  prepaidTo: "me" | "owner";
  onPrepaidToChange: (value: "me" | "owner") => void;
  nights: number;
  ownerPricePerNight: number;
  markupPerNight: number;
};

export default function PrepaymentSection({
  paidAmount,
  onPaidAmountChange,
  remainingToPay,
  prepaidTo,
  onPrepaidToChange,
  nights,
  ownerPricePerNight,
  markupPerNight,
}: Props) {
  // Суми до сплати при заїзді (в гривнях)
  const ownerDueAtCheckin =
    prepaidTo === "me"
      ? ownerPricePerNight * nights // хазяїн отримує все при заїзді
      : Math.max(0, ownerPricePerNight * nights - paidAmount); // хазяїн отримує решту

  const myDueAtCheckin =
    prepaidTo === "owner"
      ? markupPerNight * nights // я отримую все при заїзді
      : Math.max(0, markupPerNight * nights - paidAmount); // я отримую решту

  return (
    <div className="border-t pt-6">
      <h3 className="font-medium text-lg mb-4">Оплата від клієнта</h3>

      {/* Перемикач - хто забирає передоплату */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Передоплату отримує:
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onPrepaidToChange("me")}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              prepaidTo === "me"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User size={20} />
              <span className="font-medium">Я</span>
            </div>
            <p className="text-xs mt-1">
              {prepaidTo === "me"
                ? "Передоплата йде мені"
                : "Натисніть, щоб передоплата йшла вам"}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onPrepaidToChange("owner")}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              prepaidTo === "owner"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Home size={20} />
              <span className="font-medium">Хазяїн</span>
            </div>
            <p className="text-xs mt-1">
              {prepaidTo === "owner"
                ? "Передоплата йде хазяїну"
                : "Натисніть, щоб передоплата йшла хазяїну"}
            </p>
          </button>
        </div>
      </div>

      {/* Поточні поля введення */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Вже сплачено (грн)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={paidAmount}
            onChange={(e) => onPaidAmountChange(Number(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Сума, яку клієнт вніс зараз (передоплата/завдаток)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Залишок до сплати (грн)
          </label>
          <div className="w-full p-2 bg-gray-100 border rounded text-gray-900 font-medium">
            {remainingToPay.toFixed(2)} грн
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Клієнт має доплатити при заїзді
          </p>
        </div>
      </div>

      {/* Інформація про розподіл передоплати */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium mb-3">Розподіл платежів:</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>💰 Передоплата ({paidAmount.toFixed(2)} грн):</span>
            <span className="font-medium text-blue-600">
              {prepaidTo === "me" ? "Мені" : "Хазяїну"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>🏠 Хазяїн отримає при заїзді:</span>
            <span className="font-medium">
              {ownerDueAtCheckin.toFixed(2)} грн
            </span>
          </div>

          <div className="flex justify-between">
            <span>👤 Я отримаю при заїзді:</span>
            <span className="font-medium text-green-600">
              {myDueAtCheckin.toFixed(2)} грн
            </span>
          </div>
        </div>
      </div>

      {/* Попередження */}
      {paidAmount > 0 && (
        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
          <p className="font-medium text-yellow-700 mb-1">⚠️ Важливо:</p>
          <p>
            {prepaidTo === "me"
              ? `Передоплата ${paidAmount} грн залишається у вас. Хазяїн отримає ${ownerDueAtCheckin.toFixed(2)} грн при заїзді.`
              : `Передоплата ${paidAmount} грн йде хазяїну. Ви отримаєте ${myDueAtCheckin.toFixed(2)} грн при заїзді.`}
          </p>
        </div>
      )}
    </div>
  );
}
