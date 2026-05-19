import type { SeasonMonthStat } from "@/lib/admin/seasonStats";

type Props = {
  year: number;
  months: SeasonMonthStat[];
  totals: {
    bookingsCount: number;
    revenueUah: number;
    ourProfitUah: number;
  };
};

export default function SeasonDashboard({ year, months, totals }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold">Сезон {year} (травень — вересень)</h2>
      <p className="mb-4 text-sm text-gray-500">
        Активні броні: {totals.bookingsCount} • Виручка ~
        {totals.revenueUah.toLocaleString("uk-UA")} грн • Ваш заробіток ~
        {totals.ourProfitUah.toLocaleString("uk-UA")} грн
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-2 pr-4">Місяць</th>
              <th className="py-2 pr-4">Броні</th>
              <th className="py-2 pr-4">Ночей</th>
              <th className="py-2 pr-4">Завантаження</th>
              <th className="py-2 pr-4">Виручка</th>
              <th className="py-2">Ваш заробіток</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium">{m.label}</td>
                <td className="py-2 pr-4">{m.bookingsCount}</td>
                <td className="py-2 pr-4">{m.bookedNights}</td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 max-w-[120px] flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${m.occupancyPct}%` }}
                      />
                    </div>
                    <span>{m.occupancyPct}%</span>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  {m.revenueUah.toLocaleString("uk-UA")} грн
                </td>
                <td className="py-2">
                  {m.ourProfitUah.toLocaleString("uk-UA")} грн
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
