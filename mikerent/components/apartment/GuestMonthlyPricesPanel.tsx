"use client";

import { useMemo } from "react";
import {
  formatMonthKeyLabel,
  getGuestMonthlyPriceRows,
  getMonthKey,
  type MonthlyPrices,
} from "@/lib/monthlyPricing";

type Props = {
  monthlyPrices: MonthlyPrices;
  /** Підсвітити місяці обраного періоду */
  checkIn?: string;
  checkOut?: string;
};

export function GuestMonthlyPricesPanel({
  monthlyPrices,
  checkIn,
  checkOut,
}: Props) {
  const rows = useMemo(
    () => getGuestMonthlyPriceRows(monthlyPrices),
    [monthlyPrices],
  );

  const highlightedMonths = useMemo(() => {
    if (!checkIn || !checkOut) return new Set<string>();
    const keys = new Set<string>();
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const cursor = new Date(start);
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    const endMonth = new Date(end);
    endMonth.setDate(1);
    while (cursor <= endMonth) {
      keys.add(getMonthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys;
  }, [checkIn, checkOut]);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-amber-800 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        Ціни по місяцях ще не вказані. Зверніться до менеджера.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
      <p className="text-sm font-semibold text-gray-900 mb-1">
        Ціна за ніч по місяцях
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Обирайте дати в календарі — вартість залежить від місяця заїзду.
      </p>
      <ul className="space-y-2">
        {rows.map((row) => {
          const active = highlightedMonths.has(row.monthKey);
          return (
            <li
              key={row.monthKey}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-blue-100 border border-blue-200 font-medium text-blue-900"
                  : "bg-white border border-gray-100 text-gray-800"
              }`}
            >
              <span>{row.label}</span>
              <span className="tabular-nums whitespace-nowrap">
                {row.pricePerNight.toLocaleString("uk-UA")} ₴ / ніч
              </span>
            </li>
          );
        })}
      </ul>
      {checkIn && checkOut && highlightedMonths.size > 0 && (
        <p className="mt-3 text-xs text-blue-700">
          Підсвічено:{" "}
          {Array.from(highlightedMonths)
            .sort()
            .map((k) => formatMonthKeyLabel(k))
            .join(", ")}
        </p>
      )}
    </div>
  );
}
