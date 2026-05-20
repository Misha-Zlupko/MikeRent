"use client";

import type { BookingRecordType } from "@prisma/client";
import { BOOKING_RECORD_TYPE_LABELS } from "@/lib/bookingRecordType";

type Props = {
  value: BookingRecordType;
  onChange: (value: BookingRecordType) => void;
  /** У формі квартири — лише хазяїн / інший рієлтор */
  externalOnly?: boolean;
};

export default function BookingRecordTypeSelect({
  value,
  onChange,
  externalOnly = false,
}: Props) {
  const options: BookingRecordType[] = externalOnly
    ? ["OWNER", "EXTERNAL"]
    : ["AGENCY", "OWNER", "EXTERNAL"];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-2">Тип запису</h2>
      <p className="text-sm text-gray-500 mb-3">
        {externalOnly
          ? "Дати закриваються на сайті, у списку «Бронювання» не з’являться."
          : "«Мої клієнти» — у списку бронювань. Хазяїн / інший рієлтор — лише в картці квартири."}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BookingRecordType)}
        className="w-full max-w-md p-2 border rounded focus:ring-2 focus:ring-blue-500"
      >
        {options.map((key) => (
          <option key={key} value={key}>
            {BOOKING_RECORD_TYPE_LABELS[key]}
          </option>
        ))}
      </select>
    </div>
  );
}
