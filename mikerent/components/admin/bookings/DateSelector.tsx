"use client";

import { Calendar } from "lucide-react";

type Props = {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  nights: number;
};

export default function DateSelector({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  nights,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar size={20} className="text-blue-600" />
        Дати
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Заїзд *</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Виїзд *</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {nights > 0 && (
        <p className="text-sm text-gray-600 mt-2">
          {nights} {nights === 1 ? "ніч" : nights < 5 ? "ночі" : "ночей"}
        </p>
      )}
    </div>
  );
}
