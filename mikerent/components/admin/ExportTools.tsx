"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type Props = {
  compact?: boolean;
};

export default function ExportTools({ compact }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(String(now.getMonth() + 1));

  const download = (type: "bookings" | "apartments") => {
    const params = new URLSearchParams({ type, year: String(year) });
    if (type === "bookings" && month) {
      params.set("month", month);
    }
    window.location.href = `/api/admin/export?${params.toString()}`;
  };

  return (
    <div className={compact ? "" : "rounded-xl border border-gray-200 bg-white p-6 shadow-sm"}>
      {!compact && (
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Download size={20} className="text-blue-600" />
          Експорт в Excel (CSV)
        </h2>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Рік</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded border px-2 py-1.5"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Місяць (броні)</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded border px-2 py-1.5"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => download("bookings")}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download size={16} />
          Бронювання
        </button>
        <button
          type="button"
          onClick={() => download("apartments")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Download size={16} />
          Квартири
        </button>
      </div>
      {!compact && (
        <p className="mt-3 text-xs text-gray-500">
          UTF-8 з BOM — відкривається в Excel. У бронях: телефон хазяїна, оплата,
          залишок, нотатки гостя.
        </p>
      )}
    </div>
  );
}
