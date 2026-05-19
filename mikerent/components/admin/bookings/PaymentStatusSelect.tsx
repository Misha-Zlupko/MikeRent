"use client";

import type { PaymentStatus } from "@prisma/client";
import { PAYMENT_STATUS_OPTIONS } from "@/lib/paymentStatus";
import { CreditCard } from "lucide-react";

type Props = {
  value: PaymentStatus;
  onChange: (v: PaymentStatus) => void;
};

export default function PaymentStatusSelect({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard size={20} className="text-blue-600" />
        Статус оплати
      </h2>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PaymentStatus)}
        className="w-full max-w-md p-2 border rounded focus:ring-2 focus:ring-blue-500"
      >
        {PAYMENT_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="mt-3 max-w-xl text-sm text-gray-600">
        Після заїзду: вкажіть передоплату в блоці «Фінанси» і поставте{" "}
        <strong>«Все оплачено»</strong>, коли гість доплатив залишок. Залишок
        рахується автоматично.
      </p>
    </div>
  );
}
