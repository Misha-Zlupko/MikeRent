import Link from "next/link";
import type { EarningsOverview } from "@/lib/admin/earningsStats";
import { formatUsd } from "@/lib/nbuExchangeRate";

function formatUah(value: number) {
  return `${value.toLocaleString("uk-UA")} ₴`;
}

function formatNbuRate(rate: number | null, date: string | null) {
  if (rate == null) return "курс недоступний";
  const dateLabel = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("uk-UA")
    : "";
  return `${rate.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ₴/$${dateLabel ? ` · ${dateLabel}` : ""}`;
}

function StatCard({
  label,
  value,
  hint,
  accent = "blue",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "blue" | "green" | "amber" | "violet" | "slate";
}) {
  const accents = {
    blue: "from-blue-50 to-white border-blue-100 text-blue-700",
    green: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-white border-amber-100 text-amber-700",
    violet: "from-violet-50 to-white border-violet-100 text-violet-700",
    slate: "from-slate-50 to-white border-slate-200 text-slate-700",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${accents[accent]}`}
    >
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function BookingsTable({
  title,
  rows,
  emptyText,
  showUsd = false,
}: {
  title: string;
  rows: EarningsOverview["pendingRows"];
  emptyText: string;
  showUsd?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Житло</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium">Дати</th>
                <th className="px-5 py-3 font-medium">Сума</th>
                <th className="px-5 py-3 font-medium">Наш заробіток</th>
                {showUsd ? (
                  <th className="px-5 py-3 font-medium">$ (НБУ)</th>
                ) : null}
                {showUsd ? (
                  <th className="px-5 py-3 font-medium">Отримано $</th>
                ) : null}
                <th className="px-5 py-3 font-medium">Отримано</th>
                <th className="px-5 py-3 font-medium">Залишок</th>
                <th className="px-5 py-3 font-medium">Наш залишок</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    <Link
                      href={`/admin/bookings/edit/${row.id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {row.apartmentTitle}
                    </Link>
                    {row.guestName ? (
                      <div className="text-xs font-normal text-gray-500">
                        {row.guestName}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {row.phase === "upcoming"
                      ? "Майбутня"
                      : row.phase === "active"
                        ? "Зараз"
                        : "Завершена"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                    {new Date(row.dateFrom).toLocaleDateString("uk-UA")} –{" "}
                    {new Date(row.dateTo).toLocaleDateString("uk-UA")}
                  </td>
                  <td className="px-5 py-3 text-gray-900">
                    {formatUah(row.clientTotal)}
                  </td>
                  <td className="px-5 py-3 font-medium text-emerald-700">
                    {formatUah(row.ourProfit)}
                  </td>
                  {showUsd ? (
                    <td className="px-5 py-3 text-sky-700">
                      {row.ourProfitUsd != null ? (
                        <>
                          {formatUsd(row.ourProfitUsd)}
                          {row.nbuRateEstimate ? (
                            <span className="ml-1 text-xs text-gray-400">≈</span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ) : null}
                  {showUsd ? (
                    <td className="px-5 py-3 text-sky-700">
                      {row.receivedToMeUsd != null ? (
                        <>
                          {formatUsd(row.receivedToMeUsd)}
                          {row.nbuRateEstimate ? (
                            <span className="ml-1 text-xs text-gray-400">≈</span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ) : null}
                  <td className="px-5 py-3 text-gray-600">
                    {formatUah(row.receivedToMe)}
                  </td>
                  <td className="px-5 py-3 text-amber-700">
                    {formatUah(row.remainingToCollect)}
                  </td>
                  <td className="px-5 py-3 text-violet-700">
                    {formatUah(row.ourProfitPending)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type Props = {
  data: EarningsOverview;
};

export function EarningsDashboard({ data }: Props) {
  const { usd } = data;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
        Рахунок: <b>наш заробіток = отримано нами + наш залишок при заїзді</b>.
        Броні з сайту без розбиття враховуються в гривнях напряму (без ×42).
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Гривня (₴)</h2>
            <p className="text-sm text-gray-500">Основний облік у гривнях</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accent="green"
            label="Вже отримано (нам)"
            value={formatUah(data.receivedToMe)}
            hint={`Передоплати разом: ${formatUah(data.receivedPrepaidTotal)}`}
          />
          <StatCard
            accent="amber"
            label="На бронях — залишок від клієнтів"
            value={formatUah(data.pendingClientRemaining)}
            hint={`${data.pendingBookingsCount} незавершених броней`}
          />
          <StatCard
            accent="blue"
            label="Зароблено (завершені)"
            value={formatUah(data.completedOurProfit)}
            hint={`${data.completedCount} поїздок · отримано ${formatUah(data.completedReceivedToMe)}`}
          />
          <StatCard
            accent="violet"
            label="Буде зароблено (нам)"
            value={formatUah(data.pendingOurProfit)}
            hint={`Майбутні: ${formatUah(data.upcomingOurProfit)} · зараз: ${formatUah(data.activeOurProfit)}`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white lg:col-span-1">
            <p className="text-sm text-slate-300">Загальний наш заробіток</p>
            <p className="mt-2 text-3xl font-bold">{formatUah(data.totalOurProfit)}</p>
            <p className="mt-4 text-sm text-slate-300">Перевірка</p>
            <p className="mt-1 text-base text-sky-300">
              {formatUah(data.receivedToMe)} + {formatUah(data.pendingOurProfit)} ≈{" "}
              {formatUah(data.receivedToMe + data.pendingOurProfit)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <StatCard
              accent="slate"
              label="Обсяг незавершених броней"
              value={formatUah(data.pendingBookingsVolume)}
              hint={`${data.pendingBookingsCount} бронювань`}
            />
            <StatCard
              accent="slate"
              label="Майбутні заїзди"
              value={formatUah(data.upcomingClientTotal)}
              hint={`${data.upcomingCount} броней · заробіток ${formatUah(data.upcomingOurProfit)}`}
            />
            <StatCard
              accent="slate"
              label="Зараз у квартирі"
              value={formatUah(data.activeOurProfit)}
              hint={`${data.activeCount} активних броней`}
            />
            <StatCard
              accent="slate"
              label="Усі броні (обсяг)"
              value={formatUah(data.totalClientVolume)}
              hint={`${data.activeBookingsCount} підтверджених / очікує`}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Долар ($) за курсом НБУ
            </h2>
            <p className="text-sm text-gray-500">
              Кожна бронь конвертується по курсу НБУ на дату заїзду; сума в $ не
              дорівнює «₴ ÷ курс сьогодні»
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Курс сьогодні:{" "}
            <span className="font-medium text-gray-900">
              {formatNbuRate(usd.currentNbuRate, usd.currentNbuRateDate)}
            </span>
          </p>
        </div>

        {!usd.complete ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Для частини броней курс НБУ тимчасово недоступний — суми в $ можуть бути
            неповними.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accent="green"
            label="Вже отримано (нам)"
            value={formatUsd(usd.receivedToMe)}
            hint={
              usd.receivedEffectiveRate != null
                ? `Середній курс: ${usd.receivedEffectiveRate.toLocaleString("uk-UA")} ₴/$`
                : undefined
            }
          />
          <StatCard
            accent="amber"
            label="Залишок від клієнтів"
            value={formatUsd(usd.pendingClientRemaining)}
            hint={`${data.pendingBookingsCount} незавершених броней`}
          />
          <StatCard
            accent="blue"
            label="Зароблено (завершені)"
            value={formatUsd(usd.completedOurProfit)}
            hint={`${data.completedCount} поїздок`}
          />
          <StatCard
            accent="violet"
            label="Буде зароблено (нам)"
            value={formatUsd(usd.pendingOurProfit)}
            hint={`Майбутні: ${formatUsd(usd.upcomingOurProfit)} · зараз: ${formatUsd(usd.activeOurProfit)}`}
          />
        </div>

        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
          <p className="text-sm font-medium text-sky-800">Загальний заробіток у $</p>
          <p className="mt-2 text-3xl font-bold text-sky-950">
            {formatUsd(usd.totalOurProfit)}
          </p>
          <p className="mt-3 text-sm text-sky-700">
            Перевірка: {formatUsd(usd.receivedToMe)} + {formatUsd(usd.pendingOurProfit)}{" "}
            ≈ {formatUsd(usd.receivedToMe + usd.pendingOurProfit)}
          </p>
        </div>
      </section>

      <BookingsTable
        title="Незавершені броні (гроші на бронях)"
        rows={data.pendingRows}
        emptyText="Немає активних або майбутніх бронювань"
        showUsd
      />

      <BookingsTable
        title="Майбутні заїзди"
        rows={data.upcomingRows}
        emptyText="Немає майбутніх бронювань"
        showUsd
      />

      <BookingsTable
        title="Завершені поїздки"
        rows={data.completedRows}
        emptyText="Ще немає завершених броней"
        showUsd
      />
    </div>
  );
}
