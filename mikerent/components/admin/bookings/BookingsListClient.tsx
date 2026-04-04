"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ExternalLink,
  Phone,
  Pencil,
  Home,
  Clock,
  CalendarDays,
  Archive,
  LayoutGrid,
} from "lucide-react";
import { bookingStoredToUah } from "@/lib/bookingAmounts";
import DeleteBookingButton from "@/components/admin/bookings/DeleteBookingButton";

export type BookingRowSerialized = {
  id: string;
  dateFrom: string;
  dateTo: string;
  guestName: string | null;
  guestPhone: string | null;
  guestCount: number | null;
  guestContact: string | null;
  totalAmount: number | null;
  ownerPayout: number | null;
  ourProfit: number | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  apartment: {
    id: string;
    title: string;
    city: string;
    ownerPhone: string | null;
  };
};

type TabId = "all" | "active" | "upcoming" | "pending" | "archive";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

function overlapsToday(fromIso: string, toIso: string, now: Date) {
  const from = startOfDay(new Date(fromIso));
  const to = endOfDay(new Date(toIso));
  const t0 = startOfDay(now);
  const t1 = endOfDay(now);
  return from <= t1 && to >= t0;
}

function classify(
  b: BookingRowSerialized,
  now: Date,
): "active" | "pending" | "upcoming" | "past" | "cancelled" {
  if (b.status === "CANCELLED") return "cancelled";
  if (overlapsToday(b.dateFrom, b.dateTo, now)) return "active";
  if (b.status === "PENDING") return "pending";
  const from = startOfDay(new Date(b.dateFrom));
  if (from > endOfDay(now)) return "upcoming";
  return "past";
}

function sortByCheckInAsc(a: BookingRowSerialized, b: BookingRowSerialized) {
  return new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime();
}

function sortByCheckOutDesc(a: BookingRowSerialized, b: BookingRowSerialized) {
  return new Date(b.dateTo).getTime() - new Date(a.dateTo).getTime();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calculateNights(fromIso: string, toIso: string) {
  const diff = Math.abs(
    new Date(toIso).getTime() - new Date(fromIso).getTime(),
  );
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const tabs: {
  id: TabId;
  label: string;
  short: string;
  icon: typeof Home;
}[] = [
  { id: "all", label: "Усі групами", short: "Усі", icon: LayoutGrid },
  { id: "active", label: "Зараз заселені", short: "Заселені", icon: Home },
  { id: "upcoming", label: "Заплановані", short: "План", icon: CalendarDays },
  { id: "pending", label: "Очікують", short: "Очікують", icon: Clock },
  { id: "archive", label: "Архів", short: "Архів", icon: Archive },
];

function BookingTableRow({ booking }: { booking: BookingRowSerialized }) {
  const nights = calculateNights(booking.dateFrom, booking.dateTo);
  const now = new Date();
  const isActive = overlapsToday(booking.dateFrom, booking.dateTo, now);
  const isFuture = startOfDay(new Date(booking.dateFrom)) > endOfDay(now);

  const totalUah = bookingStoredToUah(booking.totalAmount);
  const ownerUah = bookingStoredToUah(booking.ownerPayout);
  const profitUah = bookingStoredToUah(booking.ourProfit);

  let statusLabel = "";
  let statusClass = "bg-gray-100 text-gray-700";
  if (booking.status === "CANCELLED") {
    statusLabel = "Скасовано";
    statusClass = "bg-red-100 text-red-800";
  } else if (booking.status === "PENDING") {
    statusLabel = "Очікує";
    statusClass = "bg-yellow-100 text-yellow-800";
  } else if (isActive) {
    statusLabel = "Активне";
    statusClass = "bg-green-100 text-green-700";
  } else if (isFuture) {
    statusLabel = "Заплановане";
    statusClass = "bg-blue-100 text-blue-700";
  } else {
    statusLabel = "Завершене";
    statusClass = "bg-gray-100 text-gray-700";
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <td className="p-4 align-top">
        <div className="font-medium text-gray-900">
          <Link
            href={`/apartments/${booking.apartment.id}`}
            target="_blank"
            className="hover:text-blue-600 flex items-center gap-1"
          >
            {booking.apartment.title}
            <ExternalLink size={14} className="text-gray-400" />
          </Link>
        </div>
        <div className="text-sm text-gray-500">{booking.apartment.city}</div>
        {booking.apartment.ownerPhone && (
          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <Phone size={12} className="text-gray-400 shrink-0" />
            <span className="text-gray-500">Хазяїн:</span>
            <a
              href={`tel:${booking.apartment.ownerPhone.replace(/\s/g, "")}`}
              className="text-blue-600 hover:underline"
            >
              {booking.apartment.ownerPhone}
            </a>
          </div>
        )}
      </td>
      <td className="p-4 align-top">
        <div className="font-medium text-gray-900">
          {booking.guestName || "—"}
        </div>
        {booking.guestPhone && (
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Phone size={12} />
            {booking.guestPhone}
          </div>
        )}
        {booking.guestCount != null && booking.guestCount > 0 && (
          <div className="text-sm text-gray-500">{booking.guestCount} осіб</div>
        )}
      </td>
      <td className="p-4 align-top">
        <div className="text-gray-900">
          {formatDate(booking.dateFrom)} — {formatDate(booking.dateTo)}
        </div>
        <div className="text-sm text-gray-500">{nights} ночей</div>
      </td>
      <td className="p-4 align-top">
        <div className="font-medium text-gray-900">
          {totalUah != null ? `${totalUah.toFixed(2)} грн` : "—"}
        </div>
        {totalUah != null && nights > 0 && (
          <div className="text-sm text-gray-500">
            {(totalUah / nights).toFixed(2)} грн/ніч
          </div>
        )}
      </td>
      <td className="p-4 align-top text-gray-900">
        {ownerUah != null ? `${ownerUah.toFixed(2)} грн` : "—"}
      </td>
      <td className="p-4 align-top font-medium text-green-600">
        {profitUah != null ? `${profitUah.toFixed(2)} грн` : "—"}
      </td>
      <td className="p-4 align-top">
        <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
          {statusLabel}
        </span>
      </td>
      <td className="p-4 align-top">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/bookings/edit/${booking.id}`}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Редагувати"
          >
            <Pencil size={18} />
          </Link>
          <DeleteBookingButton id={booking.id} />
        </div>
      </td>
    </tr>
  );
}

function SectionBlock({
  title,
  subtitle,
  accentClass,
  bookings,
}: {
  title: string;
  subtitle: string;
  accentClass: string;
  bookings: BookingRowSerialized[];
}) {
  if (bookings.length === 0) return null;
  return (
    <div className="mb-8 last:mb-0">
      <div
        className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 px-1 mb-3 border-l-4 pl-4 ${accentClass}`}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <span className="text-sm font-medium text-gray-600 tabular-nums">
          {bookings.length}{" "}
          {bookings.length === 1 ? "бронювання" : "бронювань"}
        </span>
      </div>
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Квартира
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Гість
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Дата
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Сума (грн)
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Хазяїну
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Прибуток
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Статус
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <BookingTableRow key={b.id} booking={b} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function BookingsListClient({
  bookings,
}: {
  bookings: BookingRowSerialized[];
}) {
  const [tab, setTab] = useState<TabId>("all");
  const now = useMemo(() => new Date(), []);

  const grouped = useMemo(() => {
    const active: BookingRowSerialized[] = [];
    const pending: BookingRowSerialized[] = [];
    const upcoming: BookingRowSerialized[] = [];
    const archive: BookingRowSerialized[] = [];

    for (const b of bookings) {
      const c = classify(b, now);
      if (c === "cancelled" || c === "past") {
        archive.push(b);
      } else if (c === "active") {
        active.push(b);
      } else if (c === "pending") {
        pending.push(b);
      } else {
        upcoming.push(b);
      }
    }

    active.sort(sortByCheckInAsc);
    pending.sort(sortByCheckInAsc);
    upcoming.sort(sortByCheckInAsc);
    archive.sort(sortByCheckOutDesc);

    return { active, pending, upcoming, archive };
  }, [bookings, now]);

  const filteredSingle = useMemo(() => {
    let list: BookingRowSerialized[] = [];
    switch (tab) {
      case "active":
        list = grouped.active;
        break;
      case "upcoming":
        list = grouped.upcoming;
        break;
      case "pending":
        list = grouped.pending;
        break;
      case "archive":
        list = grouped.archive;
        break;
      default:
        list = [];
    }
    if (tab === "archive") {
      return [...list].sort(sortByCheckOutDesc);
    }
    return [...list].sort(sortByCheckInAsc);
  }, [tab, grouped]);

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500">Поки немає бронювань</p>
        <Link
          href="/admin/bookings/new"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-2"
        >
          <Plus size={16} />
          Додати перше бронювання
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <p className="text-sm text-gray-500">
          У списках порядок: найближча дата заїзду зверху (для архіву — нещодавно
          завершені першими).
        </p>
        <div
          className="inline-flex flex-wrap p-1 bg-gray-100 rounded-xl gap-1"
          role="tablist"
          aria-label="Фільтр бронювань"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
                title={t.label}
              >
                <Icon size={16} className="shrink-0 opacity-80" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "all" && (
        <div className="space-y-2">
          <SectionBlock
            title="Зараз заселені"
            subtitle="Гості перебувають у квартирі сьогодні"
            accentClass="border-emerald-500"
            bookings={grouped.active}
          />
          <SectionBlock
            title="Очікують підтвердження"
            subtitle="Статус «Очікує» — потрібна ваша дія"
            accentClass="border-amber-500"
            bookings={grouped.pending}
          />
          <SectionBlock
            title="Заплановані"
            subtitle="Підтверджені майбутні заїзди, найближчі зверху"
            accentClass="border-sky-500"
            bookings={grouped.upcoming}
          />
          <SectionBlock
            title="Архів"
            subtitle="Завершені періоди та скасовані бронювання"
            accentClass="border-gray-400"
            bookings={grouped.archive}
          />
        </div>
      )}

      {tab !== "all" && (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          {filteredSingle.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              У цій категорії поки нічого немає
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Квартира
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Гість
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Дата
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Сума (грн)
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Хазяїну
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Прибуток
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Статус
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSingle.map((b) => (
                    <BookingTableRow key={b.id} booking={b} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
