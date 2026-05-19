import Link from "next/link";
import { Wallet, AlertCircle } from "lucide-react";
import type { PaymentOverviewRow } from "@/lib/admin/paymentOverview";

function RowList({
  title,
  items,
  accent,
}: {
  title: string;
  items: PaymentOverviewRow[];
  accent: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-4 last:mb-0">
      <h3 className={`mb-2 text-sm font-semibold ${accent}`}>{title}</h3>
      <ul className="space-y-2">
        {items.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
          >
            <div>
              <Link
                href={`/admin/bookings/edit/${b.id}`}
                className="font-medium text-blue-700 hover:underline"
              >
                {b.guestName || "Гість"} — {b.apartmentTitle}
              </Link>
              <p className="text-xs text-gray-500">
                {new Date(b.dateFrom).toLocaleDateString("uk-UA")} –{" "}
                {new Date(b.dateTo).toLocaleDateString("uk-UA")} •{" "}
                {b.paymentStatusLabel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">
                Сплачено: {b.paidAmount.toFixed(0)} / {b.clientTotal.toFixed(0)} грн
              </p>
              <p className="font-bold text-orange-600">
                Залишок: {b.remainingToPay.toFixed(0)} грн
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  checkedInUnpaid: PaymentOverviewRow[];
  upcomingUnpaid: PaymentOverviewRow[];
};

export default function PaymentOverviewPanel({
  checkedInUnpaid,
  upcomingUnpaid,
}: Props) {
  const total = checkedInUnpaid.length + upcomingUnpaid.length;

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-6 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-orange-900">
        <Wallet size={20} />
        Оплата та залишок
      </h2>
      <p className="mb-4 text-sm text-orange-800">
        Чи отримані гроші після заїзду. Оновіть передоплату та статус оплати в
        картці бронювання.
      </p>

      {total === 0 ? (
        <p className="text-sm text-green-700">
          Немає броней з несплаченим залишком — все ок.
        </p>
      ) : (
        <>
          {checkedInUnpaid.length > 0 && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>
                <strong>{checkedInUnpaid.length}</strong> гостей уже заселені, але
                залишок ще не закритий.
              </span>
            </div>
          )}
          <RowList
            title="Заселені — очікується оплата при заїзді"
            items={checkedInUnpaid}
            accent="text-red-800"
          />
          <RowList
            title="Майбутні заїзди — є залишок"
            items={upcomingUnpaid}
            accent="text-amber-800"
          />
        </>
      )}
      <Link
        href="/admin/bookings"
        className="mt-4 inline-block text-sm text-blue-600 hover:underline"
      >
        Усі бронювання →
      </Link>
    </div>
  );
}
